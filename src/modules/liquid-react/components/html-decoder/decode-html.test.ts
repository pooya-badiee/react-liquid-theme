import { expect, test } from 'vitest'
import { decodeHtml } from './decode-html'

test('decodes HTML', () => {
  const input = '<decode-me>Some &quot; &quot; <b>bold</b> text</decode-me>'
  const expectedOutput = 'Some " " <b>bold</b> text'
  const result = decodeHtml(input, '<decode-me>', '</decode-me>')
  expect(result).toBe(expectedOutput)
})

test('decodes multiple', () => {
  const input = '<decode-me>Some &quot; &quot; <b>bold</b> text</decode-me><decode-me>Another &amp; test</decode-me>'
  const expectedOutput = 'Some " " <b>bold</b> textAnother & test'
  const result = decodeHtml(input, '<decode-me>', '</decode-me>')
  expect(result).toBe(expectedOutput)
})

test('does not have to be a tag start or finish', () => {
  const input = '--start--Some &quot; &quot; <b>bold</b> text--end--'
  const expectedOutput = 'Some " " <b>bold</b> text'
  const result = decodeHtml(input, '--start--', '--end--')
  expect(result).toBe(expectedOutput)
})

test('ignored unmarked areas', () => {
  const input = '--start--Some &quot; &quot; <b>bold</b> text--end--&quot;'
  const expectedOutput = 'Some " " <b>bold</b> text&quot;'
  const result = decodeHtml(input, '--start--', '--end--')
  expect(result).toBe(expectedOutput)
})

test('does not error when recursive', () => {
  const input = '<decode-me><decode-me>&quot;</decode-me></decode-me>'
  const expectedOutput = '"'
  const result = decodeHtml(input, '<decode-me>', '</decode-me>')
  expect(result).toBe(expectedOutput)
})