import { rollup } from 'rollup'
import * as path from 'node:path'
import { glob, globSync } from 'glob'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import { renderToString } from './render-to-string'
import { getClientConfig, getConfig } from './config'
import type { BuildOptions } from './types'
import chalk from 'chalk'
import { PROCESSABLE_EXTENSIONS } from './constants'
import { pathToFileURL } from 'node:url'
import { getOneFileThatImportsAllFiles } from './utils'

export async function build(options: BuildOptions) {
  const startTime = performance.now()
  console.log(chalk.blue.bold('🚀 Starting build process'))

  const rootPath = path.resolve(process.cwd())
  const allSnippetFiles = getAllProcessableFiles({ sourcePath: path.join(rootPath, options.source), rootPath })
  console.log(chalk.cyan(`📁 Found ${chalk.bold(allSnippetFiles.length)} snippet files`))

  const rollupBuild = await rollup(
    getConfig(allSnippetFiles, {
      css: options.css,
      cwd: rootPath,
      envFile: options.envFile,
      sassSilenceDeprecations: options.sassSilenceDeprecations,
    }),
  )

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
    chalk.green(
      `✅ Bundle creation complete in ${formattedBuildTime}, processing ${chalk.bold(output.length)} outputs`,
    ),
  )

  const processingStartTime = performance.now()

  try {
    await generateLiquidFiles({
      distDir,
      allProcessableFiles: allSnippetFiles,
      rootPath,
      options,
      sourcePath: options.source,
      jsOutputFile: options.jsFile,
    })
    await copyAssetFiles({ distDir, themeDir: path.join(rootPath, options.theme), rootPath })
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

export function getAllProcessableFiles({ sourcePath, rootPath }: { sourcePath: string; rootPath: string }) {
  const relativeSource = path.relative(rootPath, sourcePath)
  const unixPath = relativeSource.split(path.sep).join('/')
  const patterns = ['ts', 'tsx'].flatMap((ext) =>
    PROCESSABLE_EXTENSIONS.flatMap((type) => [
      `${unixPath}/**/*.${type}.${ext}`,
      `${unixPath}/**/*.${type}.client.${ext}`,
    ]),
  )

  const allProcessableFiles = globSync(patterns, { cwd: rootPath, absolute: true })
  return allProcessableFiles
}
export function cleanup({ distDir }: { distDir: string }) {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true })
  }
}

export async function generateLiquidFiles({
  distDir,
  allProcessableFiles,
  rootPath,
  options,
  sourcePath,
  jsOutputFile,
}: {
  distDir: string
  allProcessableFiles: string[]
  rootPath: string
  options: BuildOptions
  sourcePath: string
  jsOutputFile: string
  sassSilenceDeprecations?: string[]
}) {
  const filesToExecute = getAllToExecuteFiles({ distDir, allProcessableFiles })
  const clientFiles: string[] = []
  for (const { filePath, targetFileNameWithoutExtension, targetFolder, clientFilePath } of filesToExecute) {
    if (clientFilePath) {
      clientFiles.push(clientFilePath)
    }
    const module = await import(pathToFileURL(filePath).toString())
    const fileInfo = {
      extension: 'liquid',
      renderType: 'jsx',
      ...(module.fileInfo ?? {}),
    }

    let outputString = ''
    if (fileInfo.renderType === 'jsx') {
      const Component = module.default
      outputString = await renderToString(<Component />, { leaveComment: true })
    } else {
      // string render
      outputString = module.default()
    }

    const outputFilePath = path.join(
      rootPath,
      options.theme,
      targetFolder,
      `${targetFileNameWithoutExtension}.${fileInfo.extension}`,
    )
    const outputFileDir = path.dirname(outputFilePath)

    if (!fs.existsSync(outputFileDir)) {
      fs.mkdirSync(outputFileDir, { recursive: true })
    }

    fs.writeFileSync(outputFilePath, outputString)
  }
  console.log('------------', clientFiles)
  if (clientFiles.length) {
    const { cleanup, tempFilePath } = getOneFileThatImportsAllFiles(clientFiles, sourcePath)
    const rollupClientBuild = await rollup(
      getClientConfig([tempFilePath], {
        css: options.css,
        cwd: rootPath,
        envFile: options.envFile,
        sassSilenceDeprecations: options.sassSilenceDeprecations,
      }),
    )
    await rollupClientBuild.write({
      format: 'module',
      file: path.join(distDir, 'assets', jsOutputFile),
    })
    cleanup()
  }
}

function getAllToExecuteFiles({ distDir, allProcessableFiles }: { distDir: string; allProcessableFiles: string[] }) {
  const parsedSnippetFiles = allProcessableFiles.map((filePath) => parseProcessableFilePath(filePath))
  const groupedFiles: Record<
    string,
    {
      client?: (typeof parsedSnippetFiles)[0]
      server?: (typeof parsedSnippetFiles)[0]
    }
  > = {}

  for (const file of parsedSnippetFiles) {
    if (!file) continue
    const key = file.fileName
    groupedFiles[key] ??= {}
    groupedFiles[key][file.isClient ? 'client' : 'server'] ??= file
  }

  type FileInfo = {
    filePath: string
    fileName: string
    targetFileNameWithoutExtension: string
    targetFolder: string
    clientFilePath: string | null
  }
  const fileInfos: FileInfo[] = []
  for (const { client, server } of Object.values(groupedFiles)) {
    if (!server) continue // Skip if no server file
    fileInfos.push({
      filePath: path.join(distDir, `${server.fileName}.${server.fileSemiExtension}.js`),
      fileName: `${server.fileName}.${server.fileSemiExtension}.js`,
      targetFileNameWithoutExtension: server.fileName,
      targetFolder: getTargetFolder(server.fileSemiExtension),
      clientFilePath: client?.sourceFilePath || null,
    })
  }

  return fileInfos
}

export async function copyAssetFiles({
  distDir,
  themeDir,
  rootPath,
}: {
  distDir: string
  themeDir: string
  rootPath: string
}) {
  const assetFiles = await glob(path.posix.join(distDir, 'assets/**/*'), {
    nodir: true,
    absolute: true,
    cwd: rootPath,
  })

  await Promise.all(
    assetFiles.map(async (assetFile) => {
      const relativePath = path.relative(distDir, assetFile)
      const targetPath = path.join(themeDir, relativePath)
      const targetDir = path.dirname(targetPath)

      await fsPromises.mkdir(targetDir, { recursive: true })
      await fsPromises.copyFile(assetFile, targetPath)
    }),
  )
}

export function parseProcessableFilePath(filepath: string) {
  const normalizedPath = path.normalize(filepath)
  const parts = path.basename(normalizedPath).split('.')

  if (parts.length < 3) return null

  // is it file.client.snippet.tsx or file.snippet.tsx
  const isClient = parts[parts.length - 2] === 'client'
  const fileExtension = parts[parts.length - 1]
  const fileSemiExtension = isClient ? parts[parts.length - 3] : parts[parts.length - 2]

  if (!fileExtension || !fileSemiExtension) return null
  if (!PROCESSABLE_EXTENSIONS.includes(fileSemiExtension)) return null

  const fileName = parts.slice(0,isClient ? -3 : -2).join('.')
  return {
    fileName: fileName.replace(/\.client$/, ''), // Remove .client if present
    fileExtension,
    fileSemiExtension,
    isClient,
    sourceFilePath: normalizedPath,
  }
}

function getTargetFolder(fileSemiExtension: string) {
  if (fileSemiExtension === 'config' || fileSemiExtension === 'layout') {
    return fileSemiExtension
  }
  return `${fileSemiExtension}s`
}
