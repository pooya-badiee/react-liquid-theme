import * as path from 'node:path'
import * as fs from 'node:fs'

export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timeout) return

    timeout = setTimeout(() => {
      fn.apply(this, args)
      timeout = null
    }, delay)
  }
}

export function getOneFileThatImportsAllFiles(files: string[], srcPath: string) {
  if (files.length === 0) throw new Error('No files provided to getOneFileThatImportsAllFiles')
  const tempFilePath = path.join(srcPath, '.temp.all-imports.js')
  const tsFileLines = []
  for (const file of files) {
    let relativePath = path.relative(srcPath, file).replace(/\\/g, '/')
    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`
    }
    tsFileLines.push(`import '${relativePath}';`)
  }

  fs.writeFileSync(tempFilePath, tsFileLines.join('\n'), 'utf8')
  return {
    tempFilePath,
    cleanup() {
      fs.unlinkSync(tempFilePath)
    },
  }
}