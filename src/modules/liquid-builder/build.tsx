import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import { styleText } from 'node:util'
import { rolldown } from 'rolldown'
import { getClientConfig, getConfig } from './config'
import { PROCESSABLE_EXTENSIONS } from './constants'
import { renderToString } from './render-to-string'
import type { BuildOptions } from './types'
import { getOneFileThatImportsAllFiles } from './utils'

export async function build(options: BuildOptions) {
  const startTime = performance.now()
  console.log(styleText(['blue', 'bold'], '🚀 Starting build process'))

  const rootPath = path.resolve(process.cwd())
  const allSnippetFiles = getAllProcessableFiles({ sourcePath: path.join(rootPath, options.source), rootPath })
  console.log(styleText('cyan', `📁 Found ${styleText('bold', String(allSnippetFiles.length))} snippet files`))

  const bundle = await rolldown(
    getConfig(allSnippetFiles, {
      css: options.css,
      cwd: rootPath,
      envFile: options.envFile,
      sassSilenceDeprecations: options.sassSilenceDeprecations,
    }),
  )

  const distDir = path.join(rootPath, options.dist)
  cleanup({ distDir })

  console.log(styleText('magenta', '📦 Building bundles'))
  const { output } = await bundle.write({
    dir: distDir,
    format: 'esm',
    minifyInternalExports: true,
  })
  await bundle.close()
  const buildTime = Math.round((performance.now() - startTime) * 100) / 100
  const formattedBuildTime = buildTime > 1000 ? `${Math.round(buildTime / 100) / 10}s` : `${buildTime}ms`

  console.log(
    styleText(
      'green',
      `✅ Bundle creation complete in ${formattedBuildTime}, processing ${styleText('bold', String(output.length))} outputs`,
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
    await copyAssetFiles({ distDir, themeDir: path.join(rootPath, options.theme) })
    const processingTime = Math.round((performance.now() - processingStartTime) * 100) / 100
    const formattedProcessingTime =
      processingTime > 1000 ? `${Math.round(processingTime / 100) / 10}s` : `${processingTime}ms`
    console.log(
      styleText(
        'green',
        `✅ Successfully generates ${styleText('bold', String(output.length))} snippets in ${formattedProcessingTime}`,
      ),
    )
    console.log('\n\n')
    console.log(styleText(['bgGreen', 'black', 'bold'], ' BUILD COMPLETE '))
  } catch (error) {
    const assertedError = error as Error
    console.error(styleText('red', '❌ Failed to generate Liquid files:'), assertedError.message)
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

  return fs.globSync(patterns, { cwd: rootPath }).map((file) => path.resolve(rootPath, file))
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
    const fileUrl = pathToFileURL(filePath).toString()
    // preventing caching
    const noCacheUrl = `${fileUrl}?update=${Date.now()}`
    const module = await import(noCacheUrl)
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
  if (clientFiles.length) {
    const { cleanup, tempFilePath } = getOneFileThatImportsAllFiles(clientFiles, sourcePath)
    const clientBundle = await rolldown(
      getClientConfig([tempFilePath], {
        css: options.css,
        cwd: rootPath,
        envFile: options.envFile,
        sassSilenceDeprecations: options.sassSilenceDeprecations,
      }),
    )
    await clientBundle.write({
      format: 'esm',
      file: path.join(distDir, 'assets', jsOutputFile),
      minify: true,
    })
    await clientBundle.close()
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

export async function copyAssetFiles({ distDir, themeDir }: { distDir: string; themeDir: string }) {
  const copies: Promise<void>[] = []

  for await (const dirent of fsPromises.glob('assets/**/*', { cwd: distDir, withFileTypes: true })) {
    if (!dirent.isFile()) continue
    const assetFile = path.join(dirent.parentPath, dirent.name)
    const targetPath = path.join(themeDir, path.relative(distDir, assetFile))
    copies.push(
      fsPromises
        .mkdir(path.dirname(targetPath), { recursive: true })
        .then(() => fsPromises.copyFile(assetFile, targetPath)),
    )
  }

  await Promise.all(copies)
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

  const fileName = parts.slice(0, isClient ? -3 : -2).join('.')
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
