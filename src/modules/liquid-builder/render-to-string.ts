import type { ReactNode } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { PassThrough } from 'node:stream'
import * as prettier from 'prettier'
import liquidPlugin from '@shopify/prettier-plugin-liquid/standalone.js'

export async function renderToString(reactNode: ReactNode): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const stream = new PassThrough()
    let html = ''

    stream.setEncoding('utf8')
    stream.on('data', (chunk: string) => {
      // removes dead html comments
      html += chunk.replace(/<!--\s*-->|\\x3C!--\s*-->/g, '')
    })
    stream.on('end', async () => {
      html = await prettier.format(html, {
        parser: 'liquid-html',
        plugins: [liquidPlugin],
        printWidth: 120,
        tabWidth: 2,
        singleQuote: true,
        trailingComma: 'all',
      })
      resolve(html)
    })
    stream.on('error', reject)

    const { pipe } = renderToPipeableStream(reactNode, {
      onAllReady() {
        pipe(stream)
      },
      onError(error) {
        console.error('Render error:', error)
      },
    })
  })
}
