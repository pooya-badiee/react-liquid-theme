import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidCycle } from './liquid-cycle'

test('renders cycle', async () => {
  const output = await renderToString(<LiquidCycle values={["'one'", "'two'"]} />)
  expect(output.trim()).toBe("{% cycle 'one', 'two' %}")
})

test('renders cycle with group', async () => {
  const output = await renderToString(<LiquidCycle group="'g1'" values={["'one'", "'two'"]} />)
  expect(output.trim()).toBe("{% cycle 'g1': 'one', 'two' %}")
})
