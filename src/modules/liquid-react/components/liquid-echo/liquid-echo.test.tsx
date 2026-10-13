import { expect, test } from 'vitest'
import { renderToString } from '../../../liquid-builder/render-to-string'
import { LiquidEcho } from './liquid-echo'

test('renders echo', async () => {
  const output = await renderToString(<LiquidEcho expression="product.price | money" />)
  expect(output.trim()).toBe('{% echo product.price | money %}')
})
