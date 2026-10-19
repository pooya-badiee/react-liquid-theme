import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidInclude } from '../liquid-include'
import { LiquidSection, LiquidSections } from '../liquid-section'
import { LiquidRender } from './liquid-render'

async function render(element: React.ReactElement) {
  return (await renderToString(element)).trim()
}

test('raw statement', async () => {
  expect(await render(<LiquidRender statement="'card', product: product" />)).toBe(
    "{% render 'card', product: product %}",
  )
})

test('snippet with args, skipping undefined', async () => {
  const args = {
    image1: 'section.settings.image1',
    margin: 'section.settings.margin',
    size: "'large'",
    skip: undefined,
  }
  expect(await render(<LiquidRender snippet="image-group" args={args} />)).toBe(
    "{% render 'image-group', image1: section.settings.image1, margin: section.settings.margin, size: 'large' %}",
  )
})

test('with and for', async () => {
  expect(await render(<LiquidRender snippet="card" with="product" as="item" args={{ a: 1 }} />)).toBe(
    "{% render 'card' with product as item, a: 1 %}",
  )
  expect(await render(<LiquidRender snippet="card" for="collection.products" as="product" />)).toBe(
    "{% render 'card' for collection.products as product %}",
  )
})

test('trims', async () => {
  expect(await render(<LiquidRender snippet="card" leftTrim rightTrim />)).toBe("{%- render 'card' -%}")
})

test('include', async () => {
  expect(await render(<LiquidInclude snippet="blocks" />)).toBe("{% include 'blocks' %}")
  expect(await render(<LiquidInclude statement="'icon', name: 'cart'" />)).toBe("{% include 'icon', name: 'cart' %}")
})

test('section and sections', async () => {
  expect(await render(<LiquidSection name="header" />)).toBe("{% section 'header' %}")
  expect(await render(<LiquidSections name="header-group" />)).toBe("{% sections 'header-group' %}")
})

test('prop types', () => {
  // @ts-expect-error with and for together
  ;<LiquidRender snippet="a" with="x" for="y" />
  // @ts-expect-error statement and snippet together
  ;<LiquidRender snippet="a" statement="'b'" />
})
