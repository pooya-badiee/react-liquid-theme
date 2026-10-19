import * as fs from 'node:fs'
import * as path from 'node:path'
import { styleText } from 'node:util'
import { type RolldownError, watch as rolldownWatch } from 'rolldown'
import {
  cleanup,
  copyAssetFiles,
  type GenerationCache,
  generateLiquidFiles,
  getAllProcessableFiles,
  getInputEntries,
} from './build'
import { getConfig } from './config'
import { ALL_PROCESSABLE_EXTENSIONS } from './constants'
import type { BuildOptions } from './types'
import { throttle } from './utils'

function handleBundleStart(isFirstBuild: boolean): number {
  const buildStartTime = performance.now()
  console.log(styleText('yellow', isFirstBuild ? '🔄 Building...' : '🔄 Change detected, rebuilding...'))
  return buildStartTime
}

async function handleBundleEnd({
  buildStartTime,
  isFirstBuild,
  allProcessableFiles,
  distDir,
  rootPath,
  options,
  cache,
}: {
  buildStartTime: number
  isFirstBuild: boolean
  allProcessableFiles: string[]
  distDir: string
  rootPath: string
  options: BuildOptions
  cache: GenerationCache
}): Promise<boolean> {
  try {
    const { generatedCount } = await generateLiquidFiles({
      allProcessableFiles,
      distDir,
      rootPath,
      options,
      sourcePath: options.source,
      jsOutputFile: options.jsFile,
      cache,
    })
    await copyAssetFiles({
      distDir,
      themeDir: path.join(rootPath, options.theme),
    })

    const buildTime = Math.round((performance.now() - buildStartTime) * 100) / 100
    const formattedTime = buildTime > 1000 ? `${(buildTime / 1000).toFixed(1)}s` : `${buildTime}ms`
    const fileCount = `${generatedCount} ${generatedCount === 1 ? 'file' : 'files'}`
    console.log(
      styleText('green', `✅ Successfully ${isFirstBuild ? 'built' : 'rebuilt'} ${fileCount} in ${formattedTime}`),
    )

    return false // isFirstBuild = false
  } catch (error) {
    console.error(styleText('red', '❌ Failed to generate Liquid files:'), (error as Error).message)
    return isFirstBuild
  }
}

// Handle error event
function handleBundleError(error: Error | RolldownError): void {
  console.error(styleText('red', '❌ Bundle error:'), error.message)
}

export function watch(options: BuildOptions) {
  const rootPath = path.resolve(process.cwd())
  const distDir = path.join(rootPath, options.dist)

  cleanup({ distDir })

  // kept across watcher restarts, so adding or removing a file doesn't regenerate everything
  const cache: GenerationCache = { hashes: new Map() }
  let disposer: () => void = () => {}
  const startRolldownWatcher = () => {
    let buildStartTime: number | null = null
    let isFirstBuild = true

    const allProcessableFiles = getAllProcessableFiles({ sourcePath: path.join(rootPath, options.source), rootPath })
    console.log(styleText('cyan', `📁 Found ${styleText('bold', String(allProcessableFiles.length))} snippet files`))

    let inputEntries: Record<string, string>
    try {
      inputEntries = getInputEntries(allProcessableFiles, rootPath)
    } catch (error) {
      // the source watcher below restarts this once files are renamed
      console.error(styleText('red', '❌'), (error as Error).message)
      return () => {}
    }

    const watcher = rolldownWatch({
      ...getConfig(inputEntries, {
        css: options.css,
        cwd: rootPath,
        envFile: options.envFile,
        sassSilenceDeprecations: options.sassSilenceDeprecations,
      }),
      output: {
        dir: path.join(rootPath, options.dist),
        format: 'esm',
        // change detection in `generateLiquidFiles` relies on chunk names changing with their content
        chunkFileNames: '[name]-[hash].js',
      },
    })

    console.log(styleText('magenta', '👀 Watching for changes...'))

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
          cache,
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

  const restartRolldownWatcher = throttle(() => {
    disposer()
    disposer = startRolldownWatcher()
  }, 100)

  const sourceDir = path.resolve(rootPath, options.source)
  // `rename` fires when files are added or removed
  const watcher = fs
    .watch(sourceDir, { recursive: true }, (eventType, fileName) => {
      // filtered before throttling, so an unrelated file (e.g. the client temp file) can't swallow a real change
      if (eventType === 'rename' && fileName && getIsPathProcessable(fileName)) restartRolldownWatcher()
    })
    .on('error', (error) => {
      console.error(styleText('red', '❌ Watcher error:'), error.message)
    })

  // Clean shutdown handling
  process.on('SIGINT', () => {
    console.log(styleText('blue', '👋 Shutting down watchers...'))
    disposer()
    watcher.close()
    process.exit(0)
  })
}

function getIsPathProcessable(path: string) {
  return ALL_PROCESSABLE_EXTENSIONS.some((ext) => path.includes(`.${ext}.`))
}
