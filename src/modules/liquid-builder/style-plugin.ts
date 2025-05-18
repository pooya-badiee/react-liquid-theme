import type { InputPluginOption } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import sass from 'sass'

export function createStylePlugin(): InputPluginOption {
  const cssFilter = createFilter(['**/*.css'])
  const scssFilter = createFilter(['**/*.scss'])
  return {
    name: 'liquid-style',

    transform(code, id) {
      const isCss = cssFilter(id)
      const isScss = scssFilter(id)
      if (!isCss && !isScss) return
      let compiledCode = code
      if (isScss) {
        compiledCode = sass.compileString(code).css
      }

      return {
        code: `export default ${JSON.stringify(compiledCode)}`,
        moduleType: 'js',
        map: null,
        moduleSideEffects: false,
      }
    },
  }
}
