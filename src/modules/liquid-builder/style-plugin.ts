import type { InputPluginOption } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import { compileString as compileSass } from 'sass'
import postcss from 'postcss'
import postCssModules from 'postcss-modules'

interface Options {
  output?: string
  env?: Record<string, string>
}

export function createStylePlugin({ output = 'main.css', env = {} }: Options = {}) {
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
  const collectedCss: string[] = []

  return {
    name: 'rollup-plugin-liquid-style',
    transform: async (code, id) => {
      const isCss = cssFilter(id)
      const isScss = scssFilter(id)
      if (!isCss && !isScss) return
      const isModule = id.includes('.module.')
      let compiledCode = code
      if (isScss) {
        // Inject env variables into SCSS code
        compiledCode = compileSass(`${SASS_ENV_STRING}${code}`).css
      }
      const result = await (isModule ? modulesProcessor : processor).process(compiledCode, { from: id })
      collectedCss.push(result.css)
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
      if (!collectedCss.length) return
      const finalCss = collectedCss.join('\n')
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
