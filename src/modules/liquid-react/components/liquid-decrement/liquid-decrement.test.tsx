import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidDecrement } from './liquid-decrement'

test('renders decrement', async () => {
  const output = await renderToString(<LiquidDecrement variableName="counter" />)
  expect(output.trim()).toBe('{% decrement counter %}')
})
