import { createHash } from 'node:crypto'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import { styleText } from 'node:util'
import type { ReactNode } from 'react'
import { rolldown } from 'rolldown'
import { getClientConfig, getConfig } from './config'
import { ALL_PROCESSABLE_EXTENSIONS, MULTI_OUTPUT_EXTENSIONS } from './constants'
import { renderToString } from './render-to-string'
import type { BuildOptions } from './types'
import { getOneFileThatImportsAllFiles } from './utils'

export async function build(options: BuildOptions) {
  const startTime = performance.now()
  console.log(styleText(['blue', 'bold'], '🚀 Starting build process'))

  const rootPath = path.resolve(process.cwd())
  const allSnippetFiles = getAllProcessableFiles({ sourcePath: path.join(rootPath, options.source), rootPath })
  console.log(styleText('cyan', `📁 Found ${styleText('bold', String(allSnippetFiles.length))} snippet files`))

  let inputEntries: Record<string, string>
  try {
    inputEntries = getInputEntries(allSnippetFiles, rootPath)
  } catch (error) {
    console.error(styleText('red', '❌'), (error as Error).message)
    process.exitCode = 1
    return
  }

  const bundle = await rolldown(
    getConfig(inputEntries, {
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
    process.exitCode = 1
  }
}

export function getAllProcessableFiles({ sourcePath, rootPath }: { sourcePath: string; rootPath: string }) {
  const relativeSource = path.relative(rootPath, sourcePath)
  const unixPath = relativeSource.split(path.sep).join('/')
  const patterns = ['ts', 'tsx'].flatMap((ext) =>
    ALL_PROCESSABLE_EXTENSIONS.flatMap((type) => [
      `${unixPath}/**/*.${type}.${ext}`,
      `${unixPath}/**/*.${type}.client.${ext}`,
    ]),
  )

  return fs.globSync(patterns, { cwd: rootPath }).map((file) => path.resolve(rootPath, file))
}

/** `<name>.<type>` or `<name>.<type>.client`, the name of the bundled file in the dist dir */
function getEntryName(file: ParsedFile) {
  return `${file.fileName}.${file.fileSemiExtension}${file.isClient ? '.client' : ''}`
}

/**
 * Rolldown input keyed by entry name, so every source gets a predictable dist file.
 * Subfolders are flattened, so two sources with the same name and type would overwrite each other.
 */
export function getInputEntries(files: string[], rootPath: string) {
  const entries: Record<string, string> = {}
  for (const filePath of files) {
    const parsed = parseProcessableFilePath(filePath)
    if (!parsed) continue
    const entryName = getEntryName(parsed)
    const existing = entries[entryName]
    if (existing) {
      throw new Error(
        `Duplicate source name "${entryName}", subfolders are flattened so names must be unique per type:\n` +
          `  ${path.relative(rootPath, existing)}\n  ${path.relative(rootPath, filePath)}`,
      )
    }
    entries[entryName] = filePath
  }
  return entries
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
  cache,
}: {
  distDir: string
  allProcessableFiles: string[]
  rootPath: string
  options: BuildOptions
  sourcePath: string
  jsOutputFile: string
  sassSilenceDeprecations?: string[]
  /** when given, only files whose bundled output changed since the last call are regenerated */
  cache?: GenerationCache
}): Promise<{ generatedCount: number }> {
  const filesToExecute = getAllToExecuteFiles({ distDir, allProcessableFiles })
  const clientFiles = filesToExecute.flatMap(({ clientFilePath }) => (clientFilePath ? [clientFilePath] : []))

  // chunk file names contain a content hash, so an entry's own content changes whenever anything it imports changes
  const nextHashes = new Map<string, string>()
  const getIsChanged = (distFilePath: string) => {
    const hash = hashFile(distFilePath)
    nextHashes.set(distFilePath, hash)
    return cache?.hashes.get(distFilePath) !== hash
  }
  const changedFiles = filesToExecute.filter(({ filePath }) => getIsChanged(filePath))
  // the server bundle includes the client files too, so their output tells whether the client bundle is stale
  const changedClientFiles = filesToExecute.filter(
    ({ clientDistFilePath }) => clientDistFilePath && getIsChanged(clientDistFilePath),
  )
  const clientFilesKey = clientFiles.join('\n')
  const isClientBundleStale = !cache || changedClientFiles.length > 0 || cache.clientFilesKey !== clientFilesKey

  const renderedFiles = await Promise.all(
    changedFiles.map(async (file) => {
      const fileUrl = pathToFileURL(file.filePath).toString()
      // a new hash means new content, so the module cache has to be bypassed
      const module = await import(`${fileUrl}?hash=${nextHashes.get(file.filePath)}`)
      const outputs = await renderModule(module, file, { options, rootPath })
      return { file, outputs }
    }),
  )

  // all outputs are known before anything is written, so a collision never leaves a half-written theme
  const outputPaths = new Map(cache?.outputPaths)
  for (const { file, outputs } of renderedFiles) {
    outputPaths.set(
      file.sourceFilePath,
      outputs.map(({ outputPath }) => outputPath),
    )
  }
  const currentSources = new Set(filesToExecute.map((file) => file.sourceFilePath))
  for (const sourceFilePath of outputPaths.keys()) {
    if (!currentSources.has(sourceFilePath)) outputPaths.delete(sourceFilePath)
  }
  assertNoOutputCollisions(outputPaths, rootPath)

  await Promise.all(
    renderedFiles.flatMap(({ outputs }) =>
      outputs.map(({ outputPath, content }) =>
        writeFileIfChanged(path.join(rootPath, options.theme, outputPath), content),
      ),
    ),
  )

  if (clientFiles.length && isClientBundleStale) {
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

  // only stored after everything succeeded, so failed files are retried on the next call
  if (cache) {
    for (const [distFilePath, hash] of nextHashes) cache.hashes.set(distFilePath, hash)
    cache.clientFilesKey = clientFilesKey
    cache.outputPaths = outputPaths
  }

  return { generatedCount: renderedFiles.reduce((count, { outputs }) => count + outputs.length, 0) }
}

export type GenerationCache = {
  /** dist file path -> content hash of the output that was last generated from it */
  hashes: Map<string, string>
  clientFilesKey?: string
  /** source file path -> theme-relative paths it generated, to detect collisions with unchanged files */
  outputPaths?: Map<string, string[]>
}

type ExecutableFile = ReturnType<typeof getAllToExecuteFiles>[number]

interface FileInfo {
  extension: string
  renderType: 'jsx' | 'string'
}

/** Renders one bundled source file into its theme outputs (several for `*.sections.tsx` and friends). */
async function renderModule(
  module: { default: unknown; fileInfo?: Partial<FileInfo> },
  file: ExecutableFile,
  { options, rootPath }: { options: BuildOptions; rootPath: string },
) {
  const sourceFile = path.relative(rootPath, file.sourceFilePath).split(path.sep).join('/')
  const fileInfo: FileInfo = { extension: 'liquid', renderType: 'jsx', ...module.fileInfo }
  const render = async (exported: unknown, label: string, exportName?: string) => {
    if (typeof exported !== 'function') {
      throw new Error(`${label} must be a ${fileInfo.renderType === 'jsx' ? 'component' : 'function'}`)
    }
    if (fileInfo.renderType === 'string') return String(exported())
    const Component = exported as () => ReactNode
    return renderToString(<Component />, {
      leaveComment: true,
      sourceFile: exportName ? `${sourceFile} (key "${exportName}" of the default export)` : sourceFile,
      htmlWhitespaceSensitivity: options.htmlWhitespaceSensitivity,
    })
  }

  const sourceLabel = path.basename(file.sourceFilePath)
  if (!file.isMultiOutput) {
    const content = await render(module.default, `The default export of ${sourceLabel}`)
    return [
      { outputPath: `${file.targetFolder}/${file.targetFileNameWithoutExtension}.${fileInfo.extension}`, content },
    ]
  }

  const exported = module.default
  if (typeof exported !== 'object' || exported === null) {
    throw new Error(`The default export of ${sourceLabel} must be an object of { outputName: component }`)
  }
  return Promise.all(
    Object.entries(exported).map(async ([outputName, value]) => {
      if (!/^[\w.-]+$/.test(outputName)) {
        throw new Error(`Invalid output name "${outputName}" in ${sourceLabel}, use letters, digits, "-", "_" and "."`)
      }
      const content = await render(value, `"${outputName}" in ${sourceLabel}`, outputName)
      return { outputPath: `${file.targetFolder}/${outputName}.${fileInfo.extension}`, content }
    }),
  )
}

function assertNoOutputCollisions(outputPaths: Map<string, string[]>, rootPath: string) {
  const sourcesByOutput = new Map<string, string[]>()
  for (const [sourceFilePath, paths] of outputPaths) {
    for (const outputPath of paths) {
      sourcesByOutput.set(outputPath, [...(sourcesByOutput.get(outputPath) ?? []), sourceFilePath])
    }
  }
  const collisions = [...sourcesByOutput].filter(([, sources]) => sources.length > 1)
  if (!collisions.length) return
  const details = collisions.map(
    ([outputPath, sources]) =>
      `  ${outputPath} <- ${sources.map((source) => path.relative(rootPath, source)).join(', ')}`,
  )
  throw new Error(`Several sources generate the same theme file:\n${details.join('\n')}`)
}

function hashFile(filePath: string) {
  if (!fs.existsSync(filePath)) return ''
  return createHash('sha1').update(fs.readFileSync(filePath)).digest('hex')
}

// unchanged files are not touched, so theme file watchers (e.g. `shopify theme dev`) only see real changes
async function writeFileIfChanged(filePath: string, content: string | Buffer) {
  const existing = await fsPromises.readFile(filePath).catch(() => null)
  if (existing?.equals(Buffer.from(content))) return
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true })
  await fsPromises.writeFile(filePath, content)
}

type ParsedFile = NonNullable<ReturnType<typeof parseProcessableFilePath>>

export function getAllToExecuteFiles({
  distDir,
  allProcessableFiles,
}: {
  distDir: string
  allProcessableFiles: string[]
}) {
  const groupedFiles: Record<string, { client?: ParsedFile; server?: ParsedFile }> = {}

  for (const filePath of allProcessableFiles) {
    const file = parseProcessableFilePath(filePath)
    if (!file) continue
    // the type is part of the key, `perks.section.tsx` and `perks.snippet.tsx` are different outputs
    const key = `${file.fileName}.${file.fileSemiExtension}`
    groupedFiles[key] ??= {}
    groupedFiles[key][file.isClient ? 'client' : 'server'] ??= file
  }

  const fileInfos: {
    filePath: string
    fileName: string
    sourceFilePath: string
    isMultiOutput: boolean
    targetFileNameWithoutExtension: string
    targetFolder: string
    clientFilePath: string | null
    clientDistFilePath: string | null
  }[] = []
  for (const { client, server } of Object.values(groupedFiles)) {
    if (!server) continue // Skip if no server file
    const multiOutputType = MULTI_OUTPUT_EXTENSIONS[server.fileSemiExtension]
    fileInfos.push({
      filePath: path.join(distDir, `${getEntryName(server)}.js`),
      fileName: `${getEntryName(server)}.js`,
      sourceFilePath: server.sourceFilePath,
      isMultiOutput: multiOutputType !== undefined,
      targetFileNameWithoutExtension: server.fileName,
      targetFolder: getTargetFolder(multiOutputType ?? server.fileSemiExtension),
      clientFilePath: client?.sourceFilePath || null,
      clientDistFilePath: client ? path.join(distDir, `${getEntryName(client)}.js`) : null,
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
    copies.push(fsPromises.readFile(assetFile).then((content) => writeFileIfChanged(targetPath, content)))
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
  if (!ALL_PROCESSABLE_EXTENSIONS.includes(fileSemiExtension)) return null

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
