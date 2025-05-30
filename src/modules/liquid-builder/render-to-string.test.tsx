import { expect, test } from 'vitest'
import { renderToString } from './render-to-string'

test('output contains no trash comments', async () => {
  // biome-ignore lint/complexity/noUselessFragments: this is for testing
  const output = await renderToString(<>{'<!-- -->Hello<!-- -->'}</>)
  expect(output.includes('<!--')).toBe(false)
  expect(output.includes('\\x3C!--')).toBe(false)
})
