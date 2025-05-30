import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidSelfClosingTag } from './liquid-self-closing-tag'

// adding trim since prettier will add newline at the end

test('renders the name', async () => {
  const output = await renderToString(<LiquidSelfClosingTag name="break" />)
  expect(output.trim()).toBe('{% break %}')
})

test('renders left trim', async () => {
  const output = await renderToString(<LiquidSelfClosingTag name="break" leftTrim />)
  expect(output.trim()).toBe('{%- break %}')
})
test('renders right trim', async () => {
  const output = await renderToString(<LiquidSelfClosingTag name="break" rightTrim />)
  expect(output.trim()).toBe('{% break -%}')
})
test('renders both trims', async () => {
  const output = await renderToString(<LiquidSelfClosingTag name="break" leftTrim rightTrim />)
  expect(output.trim()).toBe('{%- break -%}')
})
test('renders with statement', async () => {
  const output = await renderToString(<LiquidSelfClosingTag name="render" statement="statement" />)
  expect(output.trim()).toBe('{% render statement %}')
})
