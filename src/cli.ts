import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { build, watch } from './modules/liquid-builder'
import { setup } from './modules/liquid-setup/setup'

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
          default: '.react-liquid',
          alias: 'd',
        })
        // where the react components are
        .option('source', {
          describe: 'Source directory containing React components',
          type: 'string',
          default: 'src',
          alias: 's',
        })
        // where the shopify theme is
        .option('theme', {
          describe: 'Shopify theme directory',
          type: 'string',
          default: 'theme',
          alias: 't',
        })
        // watch
        .option('watch', {
          describe: 'Watch for changes and rebuild',
          type: 'boolean',
          default: false,
          alias: 'w',
        }),
    (argv) => {
      if (argv.watch) {
        watch({
          dist: argv.dist,
          source: argv.source,
          theme: argv.theme,
        })
        return
      }
      build({
        dist: argv.dist,
        source: argv.source,
        theme: argv.theme,
      })
    },
  )
  .version('1.0.0')
  .strict()
  .parse()
