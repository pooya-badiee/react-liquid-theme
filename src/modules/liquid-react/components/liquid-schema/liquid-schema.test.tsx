import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { defineSectionSchema, LiquidSchema } from './liquid-schema'

test('renders the schema as json', async () => {
  const schema = defineSectionSchema({
    name: 'Hero & "friends"',
    settings: [
      { type: 'text', id: 'title', label: 'Title', default: '<b>Welcome</b>' },
      { type: 'range', id: 'margin', label: 'Margin', min: 0, max: 100, step: 4, default: 20 },
    ],
    presets: [{ name: 'Hero' }],
  })
  const output = await renderToString(<LiquidSchema schema={schema} />)
  const json = output.match(/\{% schema %\}([\s\S]*)\{% endschema %\}/)?.[1]
  expect(JSON.parse(json ?? '')).toEqual(schema)
})

test('types catch mistakes', () => {
  defineSectionSchema({
    name: 'x',
    settings: [
      // @ts-expect-error unknown setting type
      { type: 'txt', id: 'a', label: 'A' },
      // @ts-expect-error misspelled key
      { type: 'text', id: 'b', lable: 'B' },
      // @ts-expect-error range needs min, max and default
      { type: 'range', id: 'c', label: 'C' },
      { type: 'header', content: 'Layout' },
    ],
    blocks: [
      { type: '@app' },
      { type: 'slide', name: 'Slide', settings: [{ type: 'image_picker', id: 'image', label: 'Image' }] },
      // @ts-expect-error misspelled key
      { type: 'slide', nmae: 'Slide' },
    ],
    // @ts-expect-error unknown template
    enabled_on: { templates: ['prodcut'] },
  })
})
