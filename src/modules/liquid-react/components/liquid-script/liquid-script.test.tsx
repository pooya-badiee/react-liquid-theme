import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidExpression } from '../liquid-expression'
import { LiquidFor } from '../liquid-for'
import { LiquidIf } from '../liquid-if'
import { toLiquidJson, when } from '../liquid-json'
import { LiquidScript } from './liquid-script'

test('value is inserted as is', async () => {
  const output = await renderToString(
    <LiquidScript value={`window.product = {{ product | json }}; if (a < b && c) { log("&amp;") }`} />,
  )
  expect(output).toContain(`window.product = {{ product | json }}; if (a < b && c) { log("&amp;") }`)
})

test('value works with toLiquidJson', async () => {
  const output = await renderToString(
    <LiquidScript value={`window.data = ${toLiquidJson({ brand: when('is_hetta', 'Hetta', 'Sundays') })}`} />,
  )
  expect(output).toContain(`window.data = {"brand":{% if is_hetta %}"Hetta"{% else %}"Sundays"{% endif %} }`)
})

test('children with liquid components are not dropped', async () => {
  const output = await renderToString(
    <LiquidScript type="text/javascript" id="data">
      {'window.ids = ['}
      <LiquidFor statement="p in products">
        <LiquidExpression expression="p.id" />
        <LiquidIf condition="forloop.last == false">,</LiquidIf>
      </LiquidFor>
      {'];'}
    </LiquidScript>,
  )
  expect(output).toMatch(/<script type=['"]text\/javascript['"] id=['"]data['"]>/)
  expect(output.replace(/\s+/g, ' ')).toContain(
    'window.ids = [{% for p in products %}{{ p.id }}{% if forloop.last == false %},{% endif %}{% endfor %}];',
  )
})

test('children text is unescaped exactly once', async () => {
  const output = await renderToString(
    <LiquidScript>
      {`const s = "a & b" + '<x>' + "&amp;";`}
      <LiquidExpression expression={"'it' | append: &quot;s&quot;"} />
    </LiquidScript>,
  )
  expect(output).toContain(`const s = "a & b" + '<x>' + "&amp;";`)
  expect(output).toContain(`{{ 'it' | append: &quot;s&quot; }}`)
})
