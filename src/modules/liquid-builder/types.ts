export type BuildOptions = {
  dist: string
  source: string
  theme: string
  css: string
  envFile: string
  jsFile: string
  sassSilenceDeprecations?: string[] | undefined
}
