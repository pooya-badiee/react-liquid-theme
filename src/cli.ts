import yargs from 'yargs'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { hideBin } from 'yargs/helpers'
import { build, watch } from './modules/liquid-builder'
import { setup } from './modules/liquid-setup/setup'
import { z } from 'zod/v4'
import { pathToFileURL } from 'node:url'

yargs(hideBin(process.argv))
  .help()
  .command('setup', 'sets up the project for react-liquid-theme', () => {
    setup()
  })
  .command(
    'generate',
    'generates liquid files from react components',
    (yargs) =>
      yargs
        // where parsed src files will be saved
        .option('dist', {
          describe: 'Directory where compiled JS files (for liquid generation) are output',
          type: 'string',
          alias: 'd',
        })
        // where the react components are
        .option('source', {
          describe: 'Source directory containing React components',
          type: 'string',
          alias: 's',
        })
        // where the shopify theme is
        .option('theme', {
          describe: 'Shopify theme directory',
          type: 'string',
          alias: 't',
        })
        // watch
        .option('watch', {
          describe: 'Watch for changes and rebuild',
          type: 'boolean',
          default: false,
          alias: 'w',
        })
        .option('env', {
          describe: 'Path to the .env file for environment variables',
          type: 'string',
          default: '.env',
        })
        // css output
        .option('css', {
          describe: 'Output CSS file name',
          type: 'string',
          default: 'main.css',
        })
        // js output
        .option('js', {
          describe: 'Output JS file name',
          type: 'string',
          default: 'main.js',
        }),
    async (argv) => {
      const options = await loadSettings(argv)
      if (argv.watch) {
        watch({
          dist: options.dist,
          source: options.source,
          theme: options.theme,
          css: options.css,
          envFile: options.env,
          jsFile: options.js,
        })
        return
      }
      build({
        dist: options.dist,
        source: options.source,
        theme: options.theme,
        css: options.css,
        envFile: options.env,
        jsFile: options.js,
      })
    }
  )
  .version('0.5.0')
  .strict()
  .parse()

type ArgOptions = {
  dist?: string | undefined
  source?: string | undefined
  theme?: string | undefined
  css?: string | undefined
  env?: string | undefined
  js?: string | undefined
}

const optionsSchema = z.object({
  dist: z.string().default('.react-liquid'),
  source: z.string().default('src'),
  theme: z.string().default('theme'),
  css: z.string().default('main.css'),
  env: z.string().default('.env'),
  js: z.string().default('main.js'),
})

export async function loadSettings(options: ArgOptions) {
  const configFilePath = path.join(process.cwd(), 'react-liquid-theme.js')
  let configFileData: ArgOptions = {}

  if (fs.existsSync(configFilePath)) {
    const module = await import(pathToFileURL(configFilePath).toString())
    if (module.default) {
      configFileData = module.default as ArgOptions
    }
  }

  return optionsSchema.parse({
    ...configFileData,
    ...options,
  })
}
