import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidAssign } from './liquid-assign'

test('decodes properly', async () => {
  const output = await renderToString(<LiquidAssign name="foo" value={`'bar'`} />)
  expect(output.trim()).toBe("{% assign foo = 'bar' %}")
})
