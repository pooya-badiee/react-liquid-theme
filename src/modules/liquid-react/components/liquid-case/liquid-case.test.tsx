import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidElse } from '../liquid-if'
import { LiquidCase } from './liquid-case'
import { LiquidWhen } from './liquid-when'

test('renders case with when and else', async () => {
  const output = await renderToString(
    <LiquidCase variable="product.color">
      <LiquidWhen value="'Red' or 'Blue'">Primary</LiquidWhen>
      <LiquidWhen value="'Green', 'Yellow'">Secondary</LiquidWhen>
      <LiquidElse>Unknown</LiquidElse>
    </LiquidCase>,
  )
  expect(output.trim()).toBe(
    [
      '{% case product.color %}',
      "  {% when 'Red', 'Blue' -%}",
      '    Primary',
      "  {% when 'Green', 'Yellow' -%}",
      '    Secondary',
      '  {% else -%}',
      '    Unknown',
      '{% endcase %}',
    ].join('\n'),
  )
})
