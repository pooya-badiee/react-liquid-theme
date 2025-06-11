import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidExpression } from './liquid-expression'

test('liquid expression matches the snapshot', async () => {
  const output = await renderToString(<LiquidExpression expression="user.name" />)
  expect(output.trim()).toMatchInlineSnapshot(`"{{ user.name }}"`)
})

test('liquid expression handles expression trims correctly', async () => {
  const leftTrimOutput = await renderToString(<LiquidExpression leftTrim expression="user.name" />)
  expect(leftTrimOutput.trim().startsWith('{{-')).toBeTruthy()
  const rightTrimOutput = await renderToString(<LiquidExpression rightTrim expression="user.name" />)
  expect(rightTrimOutput.trim().endsWith('-}}')).toBeTruthy()
  const bothTrimOutput = await renderToString(<LiquidExpression leftTrim rightTrim expression="user.name" />)
  expect(bothTrimOutput.trim()).toMatchInlineSnapshot(`"{{- user.name -}}"`)
  expect(bothTrimOutput.trim().startsWith('{{-')).toBeTruthy()
  expect(bothTrimOutput.trim().endsWith('-}}')).toBeTruthy()
})
