import type { InputPluginOption } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import { compileString as complieSass } from 'sass'
import postcss from 'postcss'

interface Options {
  output?: string
}

export function createStylePlugin({ output = 'main.css' }: Options = {}): InputPluginOption {
  const cssFilter = createFilter(['**/*.css'])
  const scssFilter = createFilter(['**/*.scss'])
  const processor = postcss([])
  const collectedCss: string[] = []

  return {
    name: 'liquid-style',
    transform: async (code, id) => {
      const isCss = cssFilter(id)
      const isScss = scssFilter(id)
      if (!isCss && !isScss) return
      let compiledCode = code
      if (isScss) {
        compiledCode = complieSass(code).css
      }
      const result = await processor.process(compiledCode)
      collectedCss.push(result.css)
      return {
        code: `export default ${JSON.stringify(result.css)}`,
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
        fileName: output,
        source: finalCss,
      })
    }
  }
}
