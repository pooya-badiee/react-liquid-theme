import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'

test('css custom properties are typed and rendered', () => {
  const html = renderToStaticMarkup(<div style={{ '--background-color': '{{ x }}', '--gap': 4, color: 'red' }} />)
  expect(html).toBe('<div style="--background-color:{{ x }};--gap:4;color:red"></div>')
  // @ts-expect-error still only custom properties and known ones
  ;<div style={{ colr: 'red' }} />
})
