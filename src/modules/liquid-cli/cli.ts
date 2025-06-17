import yargs from 'yargs'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { hideBin } from 'yargs/helpers'
import { build, watch } from '../liquid-builder'
import { setup } from '../liquid-setup/setup'
import { pathToFileURL } from 'node:url'
import { optionsSchema } from './schema'
import type { ArgOptions, ConfigFileOptions } from './types'

async function loadSettings(options: ArgOptions) {
  const configFilePath = path.join(process.cwd(), 'theme.config.js')
  let configFileData: ConfigFileOptions = {}

  if (fs.existsSync(configFilePath)) {
    const module = await import(pathToFileURL(configFilePath).toString())
    if (module.default) {
      configFileData = module.default as ConfigFileOptions
    }
  }
  return optionsSchema.parse({
    ...configFileData,
    ...options,
  })
}

export function setupCli() {
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
          })
          // css output
          .option('css', {
            describe: 'Output CSS file name',
            type: 'string',
          })
          // js output
          .option('js', {
            describe: 'Output JS file name',
            type: 'string',
          }),
      async (argv) => {
        const options = await await loadSettings(argv)
        if (argv.watch) {
          watch({
            dist: options.dist,
            source: options.source,
            theme: options.theme,
            css: options.css,
            envFile: options.env,
            jsFile: options.js,
            sassSilenceDeprecations: options.sassSilenceDeprecations,
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
          sassSilenceDeprecations: options.sassSilenceDeprecations,
        })
      },
    )
    .version('0.10.9')
    .strict()
    .parse()
}
