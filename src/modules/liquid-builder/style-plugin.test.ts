import * as fs from 'node:fs'
import * as path from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { findInNodeModules } from './style-plugin'

beforeAll(() => {
  // we add something to node_modules, then we delete it
  // we imagine it is called bootstrap
  const bootstrapPath = path.join(process.cwd(), 'node_modules', 'bootstrap')
  const bootstrapFilesPath = path.join(bootstrapPath, 'files')
  const bootstrapFile = path.join(bootstrapFilesPath, 'main.scss')
  // we create the bootstrap folder
  if (!fs.existsSync(bootstrapPath)) {
    fs.mkdirSync(bootstrapPath, { recursive: true })
  }
  // we create the bootstrap/files folder
  if (!fs.existsSync(bootstrapFilesPath)) {
    fs.mkdirSync(bootstrapFilesPath, { recursive: true })
  }
  // we create the bootstrap file
  if (!fs.existsSync(bootstrapFile)) {
    fs.writeFileSync(bootstrapFile, 'div { display: block; }')
  }
})
afterAll(() => {
  // we delete the bootstrap folder in node_modules
  fs.rmSync(path.join(process.cwd(), 'node_modules', 'bootstrap'), { recursive: true })
})

test('finds module in node_modules', () => {
  const modulePath = findInNodeModules('bootstrap')
  expect(modulePath).toBe(path.join(process.cwd(), 'node_modules', 'bootstrap'))
})
test('finds in node_modules', () => {
  const modulePath = findInNodeModules('bootstrap/files/main.scss')
  console.log(modulePath)
  expect(modulePath).toBe(path.join(process.cwd(), 'node_modules', 'bootstrap', 'files', 'main.scss'))
})
test('returns null if module not found', () => {
  const modulePath = findInNodeModules('nonexistent')
  expect(modulePath).toBeNull()
})
test('returns null if file not found', () => {
  const modulePath = findInNodeModules('bootstrap/nonexistent.scss')
  expect(modulePath).toBeNull()
})
