import type { BuildOptions } from '../liquid-builder/types'

export type ArgOptions = {
  dist?: string | undefined
  source?: string | undefined
  theme?: string | undefined
  css?: string | undefined
  env?: string | undefined
  js?: string | undefined
}

export type ConfigFileOptions = ArgOptions & {
  sassSilenceDeprecations?: BuildOptions['sassSilenceDeprecations']
}
