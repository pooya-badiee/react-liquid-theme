import type { rollup } from 'rollup'
import * as path from 'node:path'
import swc from 'rollup-plugin-swc3'
import tsconfigPathsPlugin from 'rollup-plugin-tsconfig-paths'
import { nodeResolve as nodeResolvePlugin } from '@rollup/plugin-node-resolve'
import commonjsPlugin from '@rollup/plugin-commonjs'
import { createStylePlugin } from './style-plugin'

export function getConfig(files: string[], options: { css: string, cwd: string }) {
  return {
    input: files,
    jsx: 'react-jsx',
    external: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'react-dom/server',
    ],
    plugins: [
      tsconfigPathsPlugin({
        tsConfigPath: path.join(options.cwd, 'tsconfig.json'),
      }),
      nodeResolvePlugin(),
      commonjsPlugin(),
      createStylePlugin({ output: options.css }),
      swc({
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              development: false,
              runtime: 'automatic',
              importSource: 'react',
            },
          },
        },
      }),
    ],
  } satisfies Parameters<typeof rollup>[0]
}
