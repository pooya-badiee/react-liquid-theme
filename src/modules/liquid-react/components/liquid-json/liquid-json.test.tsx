import { Liquid } from 'liquidjs'
import { describe, expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidJson } from './liquid-json'
import { each, type LiquidJsonValue, liquid, liquidString, raw, toLiquidJson, when } from './to-liquid-json'

const engine = new Liquid()
// shopify outputs `null` for missing values, liquidjs outputs nothing
engine.registerFilter('json', (value: unknown) => JSON.stringify(value ?? null))

async function evaluate(value: LiquidJsonValue, data: object = {}) {
  const output = await engine.parseAndRender(toLiquidJson(value), data)
  return JSON.parse(output)
}

describe('toLiquidJson', () => {
  test('static values', async () => {
    const value = { a: 'x', b: 1, c: true, d: null, e: [1, 'two'], f: { g: [] }, skipped: undefined }
    expect(await evaluate(value)).toEqual({ a: 'x', b: 1, c: true, d: null, e: [1, 'two'], f: { g: [] } })
  })

  test('static strings cannot break out of the script or into liquid', async () => {
    const value = { html: '</script>', liquid: '{{ secret }} {% if x %}', quote: 'a "b" \\ c' }
    const output = toLiquidJson(value)
    expect(output).not.toContain('</script>')
    expect(output).not.toMatch(/\{\{|\{%/)
    expect(await evaluate(value, { secret: 'leaked' })).toEqual(value)
  })

  test('liquid values are json encoded', async () => {
    const value = { title: liquid('product.title'), price: liquid('product.price | divided_by: 100.0') }
    const product = { title: 'Sofa "Large"\nwith \\ newline', price: 12345 }
    expect(await evaluate(value, { product })).toEqual({ title: product.title, price: 123.45 })
  })

  test('missing liquid values become null', async () => {
    expect(await evaluate({ a: liquid('missing.value'), b: [liquid('nope')] })).toEqual({ a: null, b: [null] })
  })

  test('conditional keys in every combination', async () => {
    const value = { a: when('a', 1), b: 2, c: when('c', 3) }
    for (const a of [true, false]) {
      for (const c of [true, false]) {
        expect(await evaluate(value, { a, c })).toEqual({ ...(a && { a: 1 }), b: 2, ...(c && { c: 3 }) })
      }
    }
  })

  test('object where every key is conditional', async () => {
    const value = { a: when('a', 1), b: when('b', 2), c: when('c', 3) }
    for (const flags of [0, 1, 2, 3, 4, 5, 6, 7]) {
      const [a, b, c] = [flags & 1, flags & 2, flags & 4].map(Boolean)
      expect(await evaluate(value, { a, b, c })).toEqual({ ...(a && { a: 1 }), ...(b && { b: 2 }), ...(c && { c: 3 }) })
    }
  })

  test('arrays keep order with conditional elements', async () => {
    const value = [when('a', 'a'), 'b', when('c', 'c')]
    expect(await evaluate(value, { a: false, c: true })).toEqual(['b', 'c'])
    expect(await evaluate(value, { a: true, c: false })).toEqual(['a', 'b'])
  })

  test('when with otherwise is a regular value', async () => {
    const value = { brand: when('is_hetta', 'Hetta', 'Sundays'), maybe: [when('x', 1, liquid('y'))] }
    expect(await evaluate(value, { is_hetta: true, x: false, y: 'z' })).toEqual({ brand: 'Hetta', maybe: ['z'] })
    expect(await evaluate(value, { is_hetta: false, x: true })).toEqual({ brand: 'Sundays', maybe: [1] })
  })

  test('standalone when without otherwise falls back to null', async () => {
    expect(await evaluate(when('x', 1), { x: false })).toBe(null)
  })

  test('each', async () => {
    const value = { items: each('p in products', { id: liquid('p.id') }) }
    expect(await evaluate(value, { products: [{ id: 1 }, { id: 2 }] })).toEqual({ items: [{ id: 1 }, { id: 2 }] })
    expect(await evaluate(value, { products: [] })).toEqual({ items: [] })
  })

  test('each with where skipping first and last items', async () => {
    const value = each('p in products', liquid('p.id'), { where: 'p.show' })
    const products = [
      { id: 1, show: false },
      { id: 2, show: true },
      { id: 3, show: true },
      { id: 4, show: false },
    ]
    expect(await evaluate(value, { products })).toEqual([2, 3])
    expect(await evaluate(value, { products: [{ id: 1, show: false }] })).toEqual([])
  })

  test('each with setup, where and conditional item', async () => {
    const value = each('p in products', when('label', { label: liquid('label') }), {
      setup: `
        assign label = p.name | upcase
        assign visible = p.visible
      `,
      where: 'visible',
    })
    const products = [
      { name: 'a', visible: true },
      { name: 'b', visible: false },
      { name: '', visible: true },
      { name: 'c', visible: true },
    ]
    // empty string is truthy in liquid, so only the hidden one is skipped
    expect(await evaluate(value, { products })).toEqual([{ label: 'A' }, { label: '' }, { label: 'C' }])
  })

  test('where containing or is not mixed with the item condition', async () => {
    const value = each('p in products', when('p.b', liquid('p.id')), { where: 'p.a or p.c' })
    const products = [
      { id: 1, a: true, b: false },
      { id: 2, c: true, b: true },
    ]
    expect(await evaluate(value, { products })).toEqual([2])
  })

  test('nested each keeps separators apart', async () => {
    const value = each('row in rows', each('cell in row', liquid('cell'), { where: 'cell > 0' }), {
      where: 'row.size > 0',
    })
    expect(await evaluate(value, { rows: [[], [0, 1, 0, 2], [0], [3]] })).toEqual([[1, 2], [], [3]])
  })

  test('liquidString keeps any printed output inside a json string', async () => {
    // shopify prints filter errors inline instead of throwing
    engine.registerFilter('fake_image_url', (value: unknown) =>
      value ? `//cdn/${value}.jpg` : 'Liquid error (line 1): "invalid" url input',
    )
    const value = each('p in products', {
      image: liquidString('p.image | fake_image_url'),
      title: liquidString('p.title'),
      optional: when('p.image != blank', liquidString('p.image | fake_image_url')),
    })
    const products = [{ image: 'a', title: 'Line\n"quoted"' }, { title: 3 }]
    expect(await evaluate(value, { products })).toEqual([
      { image: '//cdn/a.jpg', title: 'Line\n"quoted"', optional: '//cdn/a.jpg' },
      { image: 'Liquid error (line 1): "invalid" url input', title: '3' },
    ])
  })

  test('raw', async () => {
    engine.registerTag('fake_render', {
      render: () => '{"from":"snippet"}',
    })
    const value = { items: each('p in products', raw('{% fake_render %}')) }
    expect(await evaluate(value, { products: [1, 2] })).toEqual({ items: [{ from: 'snippet' }, { from: 'snippet' }] })
  })
})

describe('LiquidJson', () => {
  test('renders script with untouched json', async () => {
    const output = await renderToString(
      <LiquidJson id="data" value={{ name: liquid('product.title'), amp: 'a &amp; b', tag: when('x', '<b>') }} />,
    )
    const json = output.trim().replace(/^<script[^>]*>|<\/script>$/g, '')
    expect(output.trim()).toMatch(/^<script type=['"]application\/json['"] id=['"]data['"]>/)
    expect(JSON.parse(await engine.parseAndRender(json, { product: { title: 'T' }, x: true }))).toEqual({
      name: 'T',
      amp: 'a &amp; b',
      tag: '<b>',
    })
  })

  test('ld+json type', async () => {
    const output = await renderToString(<LiquidJson type="application/ld+json" value={{ a: 1 }} />)
    expect(output).toMatch(/application\/ld\+json/)
  })
})
