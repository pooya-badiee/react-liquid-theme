import type { rollup } from 'rollup'
import swc from 'rollup-plugin-swc3'
import { nodeResolve as nodeResolvePlugin } from '@rollup/plugin-node-resolve'
import commonjsPlugin from '@rollup/plugin-commonjs'

export function getConfig(files: string[]) {
  return {
    input: files,
    jsx: 'react-jsx',
    plugins: [
      nodeResolvePlugin(),
      commonjsPlugin(),
      swc({
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              development: true,
              runtime: 'automatic',
              importSource: 'react',
            },
          },
        },
      }),
    ],
  } satisfies Parameters<typeof rollup>[0]
}
