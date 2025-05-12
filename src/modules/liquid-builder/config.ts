import type { rolldown, RolldownPluginOption } from 'rolldown'
import swc from 'rollup-plugin-swc3'

export function getConfig(files: string[]) {
  return {
    input: files,
    jsx: 'react-jsx',
    plugins: [
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
