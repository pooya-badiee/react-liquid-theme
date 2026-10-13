import * as fs from 'node:fs'
import * as path from 'node:path'
import { parseEnv } from 'node:util'
import type { InputOptions } from 'rolldown'
import { createStylePlugin } from './style-plugin'

interface ConfigOptions {
  css: string
  cwd: string
  envFile: string
  sassSilenceDeprecations?: string[] | undefined
}

export function getConfig(files: string[], options: ConfigOptions) {
  const env = getEnvFromPath(options.envFile)
  return {
    ...getBaseConfig(files, options, env),
    platform: 'node',
    resolve: {
      mainFields: ['module', 'main'],
      extensions: RESOLVE_EXTENSIONS,
    },
    external: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'react-dom/server',
    ],
    transform: {
      define: getEnvDefines(env),
      jsx: {
        runtime: 'automatic',
        development: false,
        importSource: 'react',
      },
    },
  } satisfies InputOptions
}
export function getClientConfig(files: string[], options: ConfigOptions) {
  const env = getEnvFromPath(options.envFile)
  return {
    ...getBaseConfig(files, options, env),
    platform: 'browser',
    resolve: {
      extensions: RESOLVE_EXTENSIONS,
    },
    external: ['preact', 'preact/jsx-runtime', 'preact/hooks', 'preact/compat'],
    transform: {
      target: 'es2020',
      define: getEnvDefines(env),
      jsx: {
        runtime: 'automatic',
        development: false,
        importSource: 'preact',
      },
    },
  } satisfies InputOptions
}

const RESOLVE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json']

function getBaseConfig(files: string[], options: ConfigOptions, env: Record<string, string>) {
  return {
    input: files,
    cwd: options.cwd,
    tsconfig: getTsconfig(options.cwd),
    // type-only re-exports (`export { Props } from './types'`) survive the per-file transform
    shimMissingExports: true,
    // tsconfig `jsx` (e.g. `preserve`) is intentionally overridden by `transform.jsx`
    checks: { configurationFieldConflict: false },
    plugins: [
      createStylePlugin({ output: options.css, env, sassSilenceDeprecations: options.sassSilenceDeprecations }),
    ],
  } satisfies InputOptions
}

function getTsconfig(cwd: string) {
  const tsconfigPath = path.join(cwd, 'tsconfig.json')
  // `true` lets rolldown look up the nearest tsconfig itself, if there is one
  return fs.existsSync(tsconfigPath) ? tsconfigPath : true
}

function getEnvFromPath(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) {
    return {}
  }
  const envContent = fs.readFileSync(envPath, 'utf-8')
  return parseEnv(envContent) as Record<string, string>
}
function getEnvDefines(env: Record<string, string>) {
  const viteStyleEnv: Record<string, string> = {}
  for (const [key, value] of Object.entries(env)) {
    // keys like `MY-KEY` can't be read as `import.meta.env.MY-KEY`, and rolldown rejects them
    if (!/^[A-Za-z_$][\w$]*$/.test(key)) continue
    viteStyleEnv[`import.meta.env.${key}`] = JSON.stringify(value)
  }
  return viteStyleEnv
}
