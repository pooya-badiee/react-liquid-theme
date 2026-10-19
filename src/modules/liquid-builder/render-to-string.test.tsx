import { Liquid } from 'liquidjs'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { LiquidIf } from '../liquid-react'
import { DECODE_END_SIGN, DECODE_START_SIGN } from '../liquid-react/components/html-decoder/constants'
import { decodeHtml } from '../liquid-react/components/html-decoder/decode-html'
import { renderToString } from './render-to-string'

const engine = new Liquid()

/** visible text of rendered html: inline tags dropped, whitespace runs collapsed like a browser would */
async function getVisibleText(liquid: string) {
  const html = await engine.parseAndRender(liquid, { x: true })
  return html
    .replace(/<\/?(div|p)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

test('output contains no trash comments', async () => {
  // biome-ignore lint/complexity/noUselessFragments: this is for testing
  const output = await renderToString(<>{'<!-- -->Hello<!-- -->'}</>)
  expect(output.includes('<!--')).toBe(false)
  expect(output.includes('\\x3C!--')).toBe(false)
})

test('inline element followed by punctuation keeps its rendered whitespace', async () => {
  const element = (
    <div>
      <p>
        By signing up you agree to our <a href="/terms">Terms</a>. This sentence is long enough to make the formatter
        wrap the line, which is where whitespace used to be added.
      </p>
      <p>
        <LiquidIf condition="x">
          <span>a</span>
        </LiquidIf>
        ,<strong>b</strong>
      </p>
    </div>
  )
  const output = await renderToString(element)
  expect(output).toContain('</a>.')
  const unformatted = decodeHtml(renderToStaticMarkup(element), DECODE_START_SIGN, DECODE_END_SIGN)
  expect(await getVisibleText(output)).toBe(await getVisibleText(unformatted))
})

test('whitespace sensitivity can be set to ignore', async () => {
  const output = await renderToString(
    <p>
      By signing up you agree to our <a href="/terms">Terms</a>. This sentence is long enough to make the formatter
      wrap.
    </p>,
    { htmlWhitespaceSensitivity: 'ignore' },
  )
  expect(output).not.toContain('</a>.')
})
