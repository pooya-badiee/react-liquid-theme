import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidRaw } from './liquid-raw'

test('liquid raw matches the snapshot', async () => {
  const htmlContent = '{{ user.age }}<div><p>Hello, World!</p></div>'
  const output = await renderToString(<LiquidRaw liquid={htmlContent} />)
  expect(output.trim()).toMatchInlineSnapshot(`
    "{{ user.age }}
    <div><p>Hello, World!</p></div>"
  `)
})

test('renders empty string', async () => {
  const output = await renderToString(<LiquidRaw liquid={''} />)
  expect(output.trim()).toBe('')
})
