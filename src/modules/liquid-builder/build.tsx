import { rollup } from 'rollup'
import * as path from 'node:path'
import { glob, globSync } from 'glob'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import { renderToString } from './render-to-string'
import { getConfig } from './config'
import type { BuildOptions } from './types'
import chalk from 'chalk'
import { PROCESSABLE_EXTENSIONS } from './constants'
import { pathToFileURL } from 'node:url'

export async function build(options: BuildOptions) {
  const startTime = performance.now()
  console.log(chalk.blue.bold('🚀 Starting build process'))

  const rootPath = path.resolve(process.cwd())
  const allSnippetFiles = getAllSnippetFiles({ sourcePath: path.join(rootPath, options.source), rootPath })
  console.log(chalk.cyan(`📁 Found ${chalk.bold(allSnippetFiles.length)} snippet files`))

  const rollupBuild = await rollup(getConfig(allSnippetFiles, { css: options.css }))

  const distDir = path.join(rootPath, options.dist)
  cleanup({ distDir })

  console.log(chalk.magenta('📦 Building bundles'))
  const { output } = await rollupBuild.write({
    dir: distDir,
    format: 'esm',
    minifyInternalExports: true,
  })
  const buildTime = Math.round((performance.now() - startTime) * 100) / 100
  const formattedBuildTime = buildTime > 1000 ? `${Math.round(buildTime / 100) / 10}s` : `${buildTime}ms`

  console.log(
    chalk.green(`✅ Bundle creation complete in ${formattedBuildTime}, processing ${chalk.bold(output.length)} outputs`)
  )

  const processingStartTime = performance.now()

  try {
    await generateLiquidFiles({ distDir, allSnippetFiles, rootPath, options })
    await copyAssetFiles({ distDir, themeDir: path.join(rootPath, options.theme) })
    const processingTime = Math.round((performance.now() - processingStartTime) * 100) / 100
    const formattedProcessingTime =
      processingTime > 1000 ? `${Math.round(processingTime / 100) / 10}s` : `${processingTime}ms`
    console.log(
      chalk.green(`✅ Successfully generates ${chalk.bold(output.length)} snippets in ${formattedProcessingTime}`)
    )
    console.log('\n\n')
    console.log(chalk.bgGreen.black.bold(' BUILD COMPLETE '))
  } catch (error) {
    const assertedError = error as Error
    console.error(chalk.red('❌ Failed to generate Liquid files:'), assertedError.message)
  }
}

export function getAllSnippetFiles({ sourcePath, rootPath }: { sourcePath: string; rootPath: string }) {
  const relativeSource = path.relative(rootPath, sourcePath)
  const patterns = ['ts', 'tsx'].flatMap((ext) =>
    PROCESSABLE_EXTENSIONS.map((type) =>
      path.posix.join(relativeSource.split(path.sep).join('/'), `**/*.${type}.${ext}`)
    )
  )

  const allSnippetFiles = globSync(patterns, { cwd: rootPath, absolute: true })
  return allSnippetFiles
}
export function cleanup({ distDir }: { distDir: string }) {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true })
  }
}

export async function generateLiquidFiles({
  distDir,
  allSnippetFiles,
  rootPath,
  options,
}: {
  distDir: string
  allSnippetFiles: string[]
  rootPath: string
  options: BuildOptions
}) {
  for (const { filePath, targetFileName, targetFolder } of getAllToExecuteFiles({ distDir, allSnippetFiles })) {
    const module = await import(pathToFileURL(filePath).toString())
    const Component = module.default
    const reactOutputString = await renderToString(<Component />)

    const outputFilePath = path.join(rootPath, options.theme, targetFolder, targetFileName)
    const outputFileDir = path.dirname(outputFilePath)

    if (!fs.existsSync(outputFileDir)) {
      fs.mkdirSync(outputFileDir, { recursive: true })
    }

    fs.writeFileSync(outputFilePath, reactOutputString)
  }
}

function getAllToExecuteFiles({ distDir, allSnippetFiles }: { distDir: string; allSnippetFiles: string[] }) {
  const parsedSnippetFiles = allSnippetFiles.map((filePath) => parseProcessableFilePath(filePath))
  const allDistFiles = parsedSnippetFiles
    .filter((file) => !!file)
    .map((file) => ({
      filePath: path.join(distDir, `${file.fileName}.${file.fileSemiExtension}.js`),
      fileName: `${file.fileName}.${file.fileSemiExtension}.js`,
      targetFileName: `${file.fileName}.liquid`,
      targetFolder: `${file.fileSemiExtension}s`,
    }))

  return allDistFiles
}
export async function copyAssetFiles({ distDir, themeDir }: { distDir: string; themeDir: string }) {
  const assetFiles = await glob(path.join(distDir, 'assets/**/*'), { nodir: true })

  await Promise.all(
    assetFiles.map(async (assetFile) => {
      const relativePath = path.relative(distDir, assetFile)
      const targetPath = path.join(themeDir, relativePath)
      const targetDir = path.dirname(targetPath)

      await fsPromises.mkdir(targetDir, { recursive: true })
      await fsPromises.copyFile(assetFile, targetPath)
    })
  )
}

function parseProcessableFilePath(filepath: string) {
  const normalizedPath = path.normalize(filepath)
  const fileName = path.basename(normalizedPath)
  const fileParts = fileName.split('.')

  if (fileParts.length < 3) return null

  const fileExtension = fileParts[fileParts.length - 1]
  const fileSemiExtension = fileParts[fileParts.length - 2]

  if (!fileExtension || !fileSemiExtension) return null
  if (!PROCESSABLE_EXTENSIONS.includes(fileSemiExtension)) return null

  return {
    fileName: fileParts.slice(0, -2).join('.'),
    fileExtension,
    fileSemiExtension,
  }
}
