import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { build, watch } from './modules/liquid-builder'

yargs(hideBin(process.argv))
  .help()
  .command(
    'generate',
    'generates liquid files from react components',
    (yargs) =>
      yargs
        // where parsed src files will be saved
        .option('dist', {
          describe: 'Output directory for generated files',
          type: 'string',
          default: 'dist',
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
