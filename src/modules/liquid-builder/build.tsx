import { rolldown } from 'rolldown'
import * as path from 'node:path'
import { globSync } from 'glob'
import * as fs from 'node:fs'
import { renderToString } from './render-to-string'
import { getConfig } from './config'
import type { BuildOptions } from './types'
import { importModule } from './import-module'
import type { ReactNode } from 'react'
import chalk from 'chalk'
import { PROCESSABLE_EXTENSIONS, SNIPPET_FILE_PATH_PATTERN } from './constants'

export async function build(options: BuildOptions) {
  const startTime = performance.now()
  console.log(chalk.blue.bold('🚀 Starting build process'))

  const rootPath = path.resolve(process.cwd())
  const allSnippetFiles = getAllSnippetFiles({ sourceDir: path.join(rootPath, options.source) })
  console.log(chalk.cyan(`📁 Found ${chalk.bold(allSnippetFiles.length)} snippet files`))

  const rolldownBuild = await rolldown(getConfig(allSnippetFiles))

  const distDir = path.join(rootPath, options.dist)
  cleanup({ distDir })

  console.log(chalk.magenta('📦 Building bundles'))
  const { output } = await rolldownBuild.write({
    dir: distDir,
    minify: false,
    format: 'commonjs',
  })
  const buildTime = Math.round((performance.now() - startTime) * 100) / 100
  const formattedBuildTime = buildTime > 1000 ? `${Math.round(buildTime / 100) / 10}s` : `${buildTime}ms`

  console.log(
    chalk.green(
      `✅ Bundle creation complete in ${formattedBuildTime}, processing ${chalk.bold(output.length)} outputs`,
    ),
  )

  const processingStartTime = performance.now()

  try {
    await generateLiquidFiles({ distDir, allSnippetFiles, rootPath, options })
    const processingTime = Math.round((performance.now() - processingStartTime) * 100) / 100
    const formattedProcessingTime =
      processingTime > 1000 ? `${Math.round(processingTime / 100) / 10}s` : `${processingTime}ms`
    console.log(
      chalk.green(`✅ Successfully generates ${chalk.bold(output.length)} snippets in ${formattedProcessingTime}`),
    )
    console.log('\n\n')
    console.log(chalk.bgGreen.black.bold(' BUILD COMPLETE '))
  } catch (error) {
    const assertedError = error as Error
    console.error(chalk.red('❌ Failed to generate Liquid files:'), assertedError.message)
  }
}

export function getAllSnippetFiles({ sourceDir }: { sourceDir: string }) {
  const allSnippetFiles = globSync(path.resolve(sourceDir, SNIPPET_FILE_PATH_PATTERN))
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
    const module = await importModule<{ default: () => ReactNode }>(filePath)
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

function parseProcessableFilePath(path: string) {
  const splitPath = path.split('/')
  const fileName = splitPath[splitPath.length - 1]!
  const fileParts = fileName.split('.')
  // if it is less than 3 parts, it is not processable
  if (fileParts.length < 3) {
    return null
  }
  const fileExtension = fileParts[fileParts.length - 1]!
  const fileSemiExtension = fileParts[fileParts.length - 2]!
  const isPathProcessable = PROCESSABLE_EXTENSIONS.some((extension) => fileSemiExtension === extension)
  if (!isPathProcessable) {
    return null
  }
  return {
    fileName: fileParts.slice(0, fileParts.length - 2).join('.'),
    fileExtension,
    fileSemiExtension,
  }
}
