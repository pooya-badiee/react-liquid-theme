import type { InputPluginOption } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import { compileString as compileSass, type DeprecationOrId } from 'sass'
import postcss from 'postcss'
import postCssModules from 'postcss-modules'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface Options {
  output?: string
  env?: Record<string, string>
  sassSilenceDeprecations?: string[] | undefined
}

export function createStylePlugin({ output = 'main.css', sassSilenceDeprecations, env = {} }: Options = {}) {
  const SASS_ENV_STRING = `$env: (${Object.entries(env)
    .map(([key, value]) => `${key}: "${String(value).replace(/"/g, '\\"')}"`)
    .join(', ')});`

  const cssFilter = createFilter(['**/*.css'])
  const scssFilter = createFilter(['**/*.scss'])
  const processor = postcss([])
  const postCssMap = new Map<string, Record<string, string>>()
  const modulesProcessor = postcss([
    postCssModules({
      getJSON(filename, json) {
        postCssMap.set(filename, json)
      },
      generateScopedName(name, filename, _css) {
        const cssFilenameId = createIdForFile(filename, name)
        return `${name}__${cssFilenameId}`
      },
    }),
  ])

  let globalCss: string[] = []
  let moduleCss: string[] = []

  return {
    name: 'rollup-plugin-liquid-style',
    buildStart() {
      globalCss = []
      moduleCss = []
      postCssMap.clear()
    },
    transform: async function(code, id) {
      const isCss = cssFilter(id)
      const isScss = scssFilter(id)
      if (!isCss && !isScss) return
      const isModule = id.includes('.module.')
      let compiledCode = code
      if (isScss) {
        const compiled = compileSass(`${SASS_ENV_STRING}${code}`, {
          url: pathToFileURL(id),
          silenceDeprecations: sassSilenceDeprecations as DeprecationOrId[],
          importers: [
            {
              findFileUrl(url) {
                if (url.startsWith('~')) {
                  const moduleName = url.slice(1)
                  const modulePath = findInNodeModules(moduleName)
                  if (modulePath) {
                    return pathToFileURL(modulePath)
                  }
                }
                return null
              },
            },
          ],
        })
        for (const loadedUrl of compiled.loadedUrls) {
          this.addWatchFile(fileURLToPath(loadedUrl))
        }
        compiledCode = compiled.css
      }
      const result = await (isModule ? modulesProcessor : processor).process(compiledCode, {
        from: id,
      })

      if (isModule) {
        moduleCss.push(result.css)
      } else {
        globalCss.push(result.css)
      }

      if (!isModule) {
        return {
          code: `export default ${JSON.stringify(result.css)}`,
          moduleType: 'js',
          map: null,
          moduleSideEffects: false,
        }
      }
      const json = postCssMap.get(id)
      return {
        code: `export default ${JSON.stringify(json)}; export const css = ${JSON.stringify(result.css)}`,
        moduleType: 'js',
        map: null,
        moduleSideEffects: false,
      }
    },
    generateBundle() {
      const finalCss = [...globalCss, ...moduleCss].join('\n')
      if (!finalCss) return

      this.emitFile({
        type: 'asset',
        fileName: `assets/${output}`,
        source: finalCss,
      })
    },
  } as const satisfies InputPluginOption
}

const idMap = new Map<string, number>()
// id is a number, starting from 1
function createIdForFile(filepath: string, name: string) {
  const keyId = `${filepath}__${name}`
  const valueId = idMap.get(keyId)
  if (valueId) return valueId

  const newId = idMap.size + 1
  idMap.set(keyId, newId)
  return newId
}

function findInNodeModules(moduleName: string) {
  const maxSearchDepth = 10
  let currentDir = process.cwd()
  for (let i = 0; i < maxSearchDepth; i++) {
    const modulePath = path.join(currentDir, 'node_modules', moduleName)
    if (fs.existsSync(modulePath)) {
      return modulePath
    }
    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      break // Reached the root directory, stop searching
    }
    currentDir = parentDir
  }
  return null
}
