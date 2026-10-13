import * as path from 'node:path'
import chalk from 'chalk'
import chokidar from 'chokidar'
import { type RolldownError, watch as rolldownWatch } from 'rolldown'
import { cleanup, copyAssetFiles, generateLiquidFiles, getAllProcessableFiles } from './build'
import { getConfig } from './config'
import { PROCESSABLE_EXTENSIONS } from './constants'
import type { BuildOptions } from './types'
import { throttle } from './utils'

function handleBundleStart(isFirstBuild: boolean): number {
  const buildStartTime = performance.now()
  console.log(chalk.yellow(isFirstBuild ? '🔄 Building...' : '🔄 Change detected, rebuilding...'))
  return buildStartTime
}

async function handleBundleEnd({
  buildStartTime,
  isFirstBuild,
  allProcessableFiles,
  distDir,
  rootPath,
  options,
}: {
  buildStartTime: number
  isFirstBuild: boolean
  allProcessableFiles: string[]
  distDir: string
  rootPath: string
  options: BuildOptions
}): Promise<boolean> {
  try {
    await generateLiquidFiles({
      allProcessableFiles,
      distDir,
      rootPath,
      options,
      sourcePath: options.source,
      jsOutputFile: options.jsFile,
    })
    await copyAssetFiles({
      rootPath,
      distDir,
      themeDir: path.join(rootPath, options.theme),
    })

    const buildTime = Math.round((performance.now() - buildStartTime) * 100) / 100
    const formattedTime = buildTime > 1000 ? `${(buildTime / 1000).toFixed(1)}s` : `${buildTime}ms`
    console.log(chalk.green(`✅ Successfully ${isFirstBuild ? 'built' : 'rebuilt'} in ${formattedTime}`))

    return false // isFirstBuild = false
  } catch (error) {
    console.error(chalk.red('❌ Failed to generate Liquid files:'), (error as Error).message)
    return isFirstBuild
  }
}

// Handle error event
function handleBundleError(error: Error | RolldownError): void {
  console.error(chalk.red('❌ Bundle error:'), error.message)
}

export function watch(options: BuildOptions) {
  const rootPath = path.resolve(process.cwd())
  const distDir = path.join(rootPath, options.dist)

  cleanup({ distDir })

  let disposer: () => void = () => {}
  const startRolldownWatcher = () => {
    let buildStartTime: number | null = null
    let isFirstBuild = true

    const allProcessableFiles = getAllProcessableFiles({ sourcePath: path.join(rootPath, options.source), rootPath })
    console.log(chalk.cyan(`📁 Found ${chalk.bold(allProcessableFiles.length)} snippet files`))

    const watcher = rolldownWatch({
      ...getConfig(allProcessableFiles, {
        css: options.css,
        cwd: rootPath,
        envFile: options.envFile,
        sassSilenceDeprecations: options.sassSilenceDeprecations,
      }),
      output: {
        dir: path.join(rootPath, options.dist),
        format: 'esm',
      },
    })

    console.log(chalk.magenta('👀 Watching for changes...'))

    watcher.on('event', async (event) => {
      if (event.code === 'BUNDLE_START') {
        buildStartTime = handleBundleStart(isFirstBuild)
      }

      if (event.code === 'BUNDLE_END' || event.code === 'ERROR') {
        await event.result.close()
      }

      if (event.code === 'BUNDLE_END' && buildStartTime !== null) {
        isFirstBuild = await handleBundleEnd({
          buildStartTime,
          isFirstBuild,
          allProcessableFiles,
          distDir,
          rootPath,
          options,
        })
        buildStartTime = null
      }

      if (event.code === 'ERROR') {
        handleBundleError(event.error)
        buildStartTime = null
      }
    })

    return () => watcher.close()
  }

  disposer = startRolldownWatcher()

  const handleWatchEvent = throttle((filePath: string) => {
    if (!getIsPathProcessable(filePath)) return

    disposer()
    disposer = startRolldownWatcher()
  }, 100)

  const watcher = chokidar
    .watch(path.resolve(rootPath, options.source), {
      ignoreInitial: true,
    })
    .on('add', handleWatchEvent)
    .on('unlink', handleWatchEvent)
    .on('error', (error) => {
      console.error(chalk.red('❌ Watcher error:'), (error as Error).message)
    })

  // Clean shutdown handling
  process.on('SIGINT', () => {
    console.log(chalk.blue('👋 Shutting down watchers...'))
    disposer()
    watcher.close()
    process.exit(0)
  })
}

function getIsPathProcessable(path: string) {
  return PROCESSABLE_EXTENSIONS.some((ext) => path.includes(`.${ext}.`))
}
