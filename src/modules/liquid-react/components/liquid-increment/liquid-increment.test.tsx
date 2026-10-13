import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidIncrement } from './liquid-increment'

test('renders increment', async () => {
  const output = await renderToString(<LiquidIncrement variableName="counter" />)
  expect(output.trim()).toBe('{% increment counter %}')
})
