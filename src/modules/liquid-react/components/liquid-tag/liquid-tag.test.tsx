import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidTag } from './liquid-tag'

test('renders basic tag with children', async () => {
  const output = await renderToString(<LiquidTag name="if">true</LiquidTag>)
  expect(output.trim()).toBe('{% if %}true{% endif %}')
})

test('renders tag with statement', async () => {
  const output = await renderToString(
    <LiquidTag name="if" statement="true">
      Yes
    </LiquidTag>
  )
  expect(output.trim()).toBe('{% if true %}Yes{% endif %}')
})

test('renders with leftTrim', async () => {
  const output = await renderToString(
    <LiquidTag name="if" leftTrim>
      Cond
    </LiquidTag>
  )
  expect(output.trim()).toBe('{%- if %}Cond{% endif %}')
})

test('renders with rightTrim', async () => {
  const output = await renderToString(
    <LiquidTag name="if" rightTrim>
      Block
    </LiquidTag>
  )
  expect(output.trim()).toBe('{% if %}Block{%- endif %}')
})

test('renders with leftBeginTrim', async () => {
  const output = await renderToString(
    <LiquidTag name="if" leftBeginTrim>
      Value
    </LiquidTag>
  )
  expect(output.trim()).toBe('{% if -%}Value{% endif %}')
})

test('renders with rightBeginTrim', async () => {
  const output = await renderToString(
    <LiquidTag name="if" rightBeginTrim>
      Val
    </LiquidTag>
  )
  expect(output.trim()).toBe('{% if %}Val{% endif -%}')
})

test('renders with all trims', async () => {
  const output = await renderToString(
    <LiquidTag name="if" statement="x" leftTrim rightTrim leftBeginTrim rightBeginTrim>
      Yes
    </LiquidTag>
  )
  expect(output.trim()).toBe('{%- if x -%}Yes{%- endif -%}')
})

test('renders without children', async () => {
  const output = await renderToString(<LiquidTag name="if" />)
  expect(output.trim()).toBe('{% if %}{% endif %}')
})
