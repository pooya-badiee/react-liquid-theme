import { defineConfig } from 'rollup'
import typescriptPlugin from '@rollup/plugin-typescript'
import swcPlugin from 'rollup-plugin-swc3'
import * as fs from 'node:fs'
import commonjsPlugin from '@rollup/plugin-commonjs'
import nodeResolvePlugin from '@rollup/plugin-node-resolve'

// Why not rolldown?
// Because at this moment rolldown adds extra runtime to the bundle
// see bellow:
// https://github.com/rolldown/rolldown/discussions/4490

export default defineConfig([
  // commonjs build
  {
    input: 'src/index.ts',
    external: handleExternal,
    plugins: [
      cleanupPlugin('dist'),
      nodeResolvePlugin(),
      commonjsPlugin(),
      typescriptPlugin({
        declaration: true,
        declarationDir: 'dist/types',
        outDir: 'dist',
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/cli.ts', 'src/modules/liquid-builder/**/*.ts', 'src/modules/liquid-builder/**/*.tsx'],
      }),
      createSwcPlugin(),
    ],
    output: {
      format: 'cjs',
      dir: 'dist',
      entryFileNames: '[name].js',
    },
  },
  // esm build
  {
    input: 'src/index.ts',
    external: handleExternal,
    plugins: [nodeResolvePlugin(), commonjsPlugin(), createSwcPlugin()],
    output: {
      format: 'esm',
      dir: 'dist',
      entryFileNames: '[name].mjs',
    },
  },
  // cli app
  {
    input: 'src/cli.ts',
    external: handleExternal,
    output: {
      format: 'cjs',
      file: 'bin/cli.js',
      banner: '#!/usr/bin/env node',
      interop: 'auto',
    },
    plugins: [cleanupPlugin('bin'), nodeResolvePlugin(), commonjsPlugin(), createSwcPlugin()],
  },
])

/**
 * @param {string} distDir
 */
function cleanupPlugin(distDir) {
  let didClean = false
  return {
    name: 'cleanup',
    buildStart() {
      if (didClean) return
      if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true })
      }
      didClean = true
    },
  }
}

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

/**
 * @param {string} id
 */
function handleExternal(id) {
  if (id.startsWith('./') || id.startsWith('../') || id.startsWith('/') || id.startsWith('src')) return false
  return true
}
