import type { rollup } from 'rollup'
import * as path from 'node:path'
import * as fs from 'node:fs'
import swc from 'rollup-plugin-swc3'
import tsconfigPathsPlugin from 'rollup-plugin-tsconfig-paths'
import { nodeResolve as nodeResolvePlugin } from '@rollup/plugin-node-resolve'
import commonjsPlugin from '@rollup/plugin-commonjs'
import replacePlugin from '@rollup/plugin-replace'
import { parse as parseEnv } from 'dotenv'
import { createStylePlugin } from './style-plugin'

export function getConfig(files: string[], options: { css: string; cwd: string; envFile: string }) {
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
      createEnvPlugin(options),
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
export function getClientConfig(files: string[], options: { css: string; cwd: string; envFile: string }) {
  return {
    input: files,
    jsx: 'react-jsx', // SWC still uses this keyword even for Preact
    external: ['preact', 'preact/jsx-runtime', 'preact/hooks', 'preact/compat'],
    plugins: [
      createEnvPlugin(options),
      tsconfigPathsPlugin({
        tsConfigPath: path.join(options.cwd, 'tsconfig.json'),
      }),
      nodeResolvePlugin({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        browser: true,
      }),
      commonjsPlugin(),
      createStylePlugin({ output: options.css }),
      swc({
        minify: true,
        jsc: {
          target: 'es2020',
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              development: false,
              runtime: 'automatic',
              importSource: 'preact',
            },
          },
        },
      }),
    ],
  } satisfies Parameters<typeof rollup>[0]
}

function createEnvPlugin(options: { cwd: string; envFile: string }) {
  const envPath = path.resolve(options.cwd, options.envFile)
  let env: Record<string, string> = {}
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    env = parseEnv(envContent)
  }

  const viteStyleEnv: Record<string, string> = {}
  for (const [key, value] of Object.entries(env)) {
    viteStyleEnv[`import.meta.env.${key}`] = value
  }

  return replacePlugin({
    preventAssignment: true,
    values: viteStyleEnv,
  })
}
