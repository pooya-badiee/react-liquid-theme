import { z } from 'zod/v4'

export const optionsSchema = z.object({
  dist: z.string().default('.react-liquid'),
  source: z.string().default('src'),
  theme: z.string().default('theme'),
  css: z.string().default('main.css'),
  env: z.string().default('.env'),
  js: z.string().default('main.js'),
  sassSilenceDeprecations: z.array(z.string()).optional(),
})
