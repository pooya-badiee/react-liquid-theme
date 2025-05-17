import type { rolldown, RolldownPluginOption } from 'rolldown'
import swc from 'rollup-plugin-swc3'
import { createStylePlugin } from './style-plugin'

export function getConfig(files: string[]) {
  return {
    input: files,
    jsx: 'react-jsx',
    plugins: [
      createStylePlugin(),
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
      }) as RolldownPluginOption,
    ],
  } satisfies Parameters<typeof rolldown>[0]
}
