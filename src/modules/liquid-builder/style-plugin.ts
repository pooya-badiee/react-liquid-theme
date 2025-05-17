import type { RolldownPluginOption } from 'rolldown'
import { createFilter } from '@rollup/pluginutils'

export function createStylePlugin(): RolldownPluginOption {
  const styleFilesFilter = createFilter(['**/*.css'])
  return {
    name: 'liquid-style',
    transform(code, id) {
      if (!styleFilesFilter(id)) return undefined
      return {
        code: `export default ${JSON.stringify(code)}`,
        moduleType: 'js',
        map: null,
        moduleSideEffects: false
      }
    },
  }
}
