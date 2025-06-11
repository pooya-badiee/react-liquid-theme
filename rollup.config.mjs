import { defineConfig } from 'rollup'
import typescriptPlugin from '@rollup/plugin-typescript'
import swcPlugin from 'rollup-plugin-swc3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import commonjsPlugin from '@rollup/plugin-commonjs'
import nodeResolvePlugin from '@rollup/plugin-node-resolve'

// clean up dist folder first
try {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true })
  }
} catch (error) {
  console.error('Error while deleting dist folder:', error)
}

export default defineConfig([
  // esm build
  {
    input: ['src/index.ts', 'src/utils.ts', 'src/config.ts'],
    external: handleExternal,
    plugins: [
      nodeResolvePlugin(),
      commonjsPlugin(),
      typescriptPlugin({
        declaration: true,
        outDir: 'dist',
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/cli.ts', 'src/modules/liquid-builder/**/*.ts', 'src/modules/liquid-builder/**/*.tsx'],
      }),
      createSwcPlugin(),
      copyPlugin([{ from: 'src/declarations.d.ts', to: 'dist/declarations.d.ts' }]),
    ],
    output: {
      format: 'esm',
      dir: 'dist',
      entryFileNames: '[name].js',
      preserveModules: true,
    },
  },
  // cli app
  {
    input: 'src/cli.ts',
    external: handleExternal,
    output: {
      format: 'esm',
      file: 'dist/cli.js',
      banner: '#!/usr/bin/env node',
      interop: 'auto',
    },
    plugins: [nodeResolvePlugin(), commonjsPlugin(), createSwcPlugin()],
  },
])

function createSwcPlugin() {
  return swcPlugin({
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
          development: false,
        },
      },
    },
  })
}

function copyPlugin(files) {
  return {
    name: 'rollup-plugin-copy',
    writeBundle() {
      for (const file of files) {
        const source = file.from
        const dest = file.to
        fs.copyFileSync(source, dest)
      }
    },
  }
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function handleExternal(id) {
  if (id.startsWith('src')) return false
  // Handle bare module imports like "react", "@package/core"
  const isBare = !id.startsWith('.') && !path.isAbsolute(id)
  if (isBare) return true
  return false
}
