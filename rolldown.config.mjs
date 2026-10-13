import * as fs from 'node:fs'
import * as path from 'node:path'
import { defineConfig } from 'rolldown'

// clean up dist folder first
try {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true })
  }
} catch (error) {
  console.error('Error while deleting dist folder:', error)
}

/** @type {import('rolldown').TransformOptions} */
const transform = {
  jsx: {
    runtime: 'automatic',
    development: false,
  },
}

export default defineConfig([
  // esm build
  {
    input: ['src/index.ts', 'src/utils.ts', 'src/config.ts'],
    platform: 'node',
    external: handleExternal,
    transform,
    // src modules are side-effect free; avoids emitting re-export-only barrel files
    treeshake: { moduleSideEffects: [{ test: /[\\/]src[\\/].*[\\/]index\.tsx?$/, sideEffects: false }] },
    plugins: [copyPlugin([{ from: 'src/declarations.d.ts', to: 'dist/declarations.d.ts' }])],
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
    platform: 'node',
    external: handleExternal,
    transform,
    output: {
      format: 'esm',
      file: 'dist/cli.js',
      banner: '#!/usr/bin/env node',
    },
  },
])

function copyPlugin(files) {
  return {
    name: 'rolldown-plugin-copy',
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
