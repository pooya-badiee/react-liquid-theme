import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidTablerow } from './liquid-tablerow'

test('renders tablerow', async () => {
  const output = await renderToString(
    <table>
      <LiquidTablerow statement="product in collection.products cols: 2">{'{{ product.title }}'}</LiquidTablerow>
    </table>,
  )
  expect(output.trim()).toBe(
    [
      '<table>',
      '  {% tablerow product in collection.products cols: 2 %}',
      '    {{- product.title -}}',
      '  {% endtablerow %}',
      '</table>',
    ].join('\n'),
  )
})
