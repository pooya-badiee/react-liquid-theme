import * as fs from 'node:fs'
import * as path from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, getAllProcessableFiles, parseProcessableFilePath } from './build'

const tmpDir = path.join(process.cwd(), '__tmp__')

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true })
  const snippetsDir = path.join(tmpDir, 'src', 'snippets')
  fs.mkdirSync(snippetsDir, { recursive: true })

  fs.writeFileSync(path.join(snippetsDir, 'button.snippet.tsx'), '')
  fs.writeFileSync(path.join(snippetsDir, 'button.section.tsx'), '')
  fs.writeFileSync(path.join(snippetsDir, 'header.random.ts'), '')
  fs.writeFileSync(path.join(snippetsDir, 'button.client.snippet.tsx'), '')
  fs.writeFileSync(path.join(snippetsDir, 'ignore.txt'), '')
  fs.writeFileSync(path.join(snippetsDir, 'other.tsx'), '') // Missing semi-extension
})

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('parseProcessableFilePath', () => {
  test('returns only files matching processable extensions', () => {
    const files = getAllProcessableFiles({
      sourcePath: path.join(tmpDir, 'src', 'snippets'),
      rootPath: tmpDir,
    })

    const fileNames = files.map((f) => path.basename(f))

    expect(fileNames).toEqual(expect.arrayContaining(['button.snippet.tsx', 'button.section.tsx']))
    expect(fileNames).not.toContain('ignore.txt')
    expect(fileNames).not.toContain('other.tsx')
  })
})

describe('parseProcessableFilePath', () => {
  test('parses valid processable file path', () => {
    const parsed = parseProcessableFilePath('button.snippet.tsx')
    expect(parsed).toEqual({
      fileName: 'button',
      fileExtension: 'tsx',
      fileSemiExtension: 'snippet',
      isClient: false,
      sourceFilePath: 'button.snippet.tsx',
    })
  })

  test('returns null on invalid extension', () => {
    expect(parseProcessableFilePath('invalid.file.js')).toBeNull()
  })

  test('determines client-side files correctly', () => {
    const parsed = parseProcessableFilePath('button.snippet.client.tsx')
    console.log(parsed)
    expect(parsed).toEqual({
      fileName: 'button',
      fileExtension: 'tsx',
      fileSemiExtension: 'snippet',
      isClient: true,
      sourceFilePath: 'button.snippet.client.tsx',
    })
  })
})

describe('getAllProcessableFiles', () => {
  test('cleans up existing dist folder', () => {
    const distDir = path.join(process.cwd(), 'test-dist')
    fs.mkdirSync(distDir, { recursive: true })
    fs.writeFileSync(path.join(distDir, 'temp.txt'), 'dummy')

    cleanup({ distDir })
    expect(fs.existsSync(distDir)).toBe(false)
  })
})
