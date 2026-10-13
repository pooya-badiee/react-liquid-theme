import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidRawTag } from './liquid-raw-tag'

test('renders raw tag', async () => {
  const output = await renderToString(<LiquidRawTag>{'{{ 2 | plus: 2 }}'}</LiquidRawTag>)
  expect(output.trim()).toBe('{% raw %}{{ 2 | plus: 2 }}{% endraw %}')
})
