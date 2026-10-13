import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidComment } from './liquid-comment'
import { LiquidInlineComment } from './liquid-inline-comment'

test('renders block comment', async () => {
  const output = await renderToString(<LiquidComment>hidden</LiquidComment>)
  expect(output.trim()).toBe('{% comment %}hidden{% endcomment %}')
})

test('renders inline comment', async () => {
  const output = await renderToString(<LiquidInlineComment comment="note" />)
  expect(output.trim()).toBe('{% # note %}')
})

test('prefixes every line of multi-line inline comment', async () => {
  const output = await renderToString(<LiquidInlineComment comment={'one\ntwo'} />)
  expect(output.trim()).toBe('{%\n  # one\n  # two\n%}')
})
