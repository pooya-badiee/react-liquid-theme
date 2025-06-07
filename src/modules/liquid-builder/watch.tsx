import { type RollupError, watch as rollupWatch } from 'rollup'
import * as path from 'node:path'
import { getConfig } from './config'
import type { BuildOptions } from './types'
import chokidar from 'chokidar'
import { throttle } from './utils'
import { cleanup, copyAssetFiles, generateLiquidFiles, getAllProcessableFiles } from './build'
import { PROCESSABLE_EXTENSIONS } from './constants'
import chalk from 'chalk'

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
function handleBundleError(error: Error | RollupError): void {
  console.error(chalk.red('❌ Bundle error:'), error.message)
}

export function watch(options: BuildOptions) {
  const rootPath = path.resolve(process.cwd())
  const distDir = path.join(rootPath, options.dist)

  cleanup({ distDir })

  let disposer: () => void = () => {}
  const startRollupWatcher = () => {
    let buildStartTime: number | null = null
    let isFirstBuild = true

    const allProcessableFiles = getAllProcessableFiles({ sourcePath: path.join(rootPath, options.source), rootPath })
    console.log(chalk.cyan(`📁 Found ${chalk.bold(allProcessableFiles.length)} snippet files`))

    const watcher = rollupWatch({
      ...getConfig(allProcessableFiles, { css: options.css, cwd: rootPath, envFile: options.envFile }),
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

  disposer = startRollupWatcher()

  const handleWatchEvent = throttle((filePath: string) => {
    if (!getIsPathProcessable(filePath)) return

    disposer()
    disposer = startRollupWatcher()
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
