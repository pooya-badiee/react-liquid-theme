import * as fs from 'node:fs'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { build } from './build'
import type { BuildOptions } from './types'

// inside the repo, so the bundled files resolve `react` from its node_modules
const projectDir = path.join(process.cwd(), '__tmp_build__')
const originalCwd = process.cwd()

const options: BuildOptions = {
  dist: '.react-liquid',
  source: 'src',
  theme: 'theme',
  css: 'main.css',
  envFile: '.env',
  jsFile: 'main.js',
}

function writeSource(relativePath: string, content: string) {
  const filePath = path.join(projectDir, 'src', relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}

function readTheme(relativePath: string) {
  return fs.readFileSync(path.join(projectDir, 'theme', relativePath), 'utf8')
}

beforeEach(() => {
  fs.rmSync(projectDir, { recursive: true, force: true })
  fs.mkdirSync(projectDir, { recursive: true })
  process.chdir(projectDir)
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  process.chdir(originalCwd)
  process.exitCode = undefined
  vi.restoreAllMocks()
  fs.rmSync(projectDir, { recursive: true, force: true })
})

describe('build', () => {
  test('section and snippet with the same name both get generated', async () => {
    writeSource('sections/program-perks.section.tsx', 'export default () => <section>the section</section>')
    writeSource('snippets/program-perks.snippet.tsx', 'export default () => <div>the snippet</div>')
    writeSource('sections/program-perks.section.client.ts', 'console.log("section client")')
    writeSource('snippets/program-perks.snippet.client.ts', 'console.log("snippet client")')

    await build(options)

    expect(readTheme('sections/program-perks.liquid')).toContain('the section')
    expect(readTheme('snippets/program-perks.liquid')).toContain('the snippet')
    expect(readTheme('sections/program-perks.liquid')).toContain(
      'Edit the source file instead:\n  src/sections/program-perks.section.tsx\n',
    )
    const js = readTheme('assets/main.js')
    expect(js).toContain('section client')
    expect(js).toContain('snippet client')
  })

  test('two sources with the same name and type are an error', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    writeSource('a/hero.section.tsx', 'export default () => <section>a</section>')
    writeSource('b/hero.section.tsx', 'export default () => <section>b</section>')

    await build(options)

    expect(process.exitCode).toBe(1)
    const message = errors.mock.calls.flat().join(' ')
    expect(message).toContain('Duplicate source name "hero.section"')
    expect(message).toContain('src/a/hero.section.tsx')
    expect(message).toContain('src/b/hero.section.tsx')
    expect(fs.existsSync(path.join(projectDir, 'theme', 'sections'))).toBe(false)
  })

  test('a multi-output file generates one theme file per key', async () => {
    writeSource(
      'showroom.sections.tsx',
      `
      const showroom = (city: string) => () => <section>{city}</section>
      export default { 'showroom-paris': showroom('Paris'), 'showroom-rome': showroom('Rome') }
      `,
    )

    await build(options)

    expect(readTheme('sections/showroom-paris.liquid')).toContain('Paris')
    expect(readTheme('sections/showroom-rome.liquid')).toContain('Rome')
    expect(readTheme('sections/showroom-rome.liquid')).toContain(
      'src/showroom.sections.tsx (key "showroom-rome" of the default export)',
    )
  })

  test('a multi-output key colliding with another source is an error', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    writeSource('hero.section.tsx', 'export default () => <section>single</section>')
    writeSource('heroes.sections.tsx', 'export default { hero: () => <section>multi</section> }')

    await build(options)

    expect(process.exitCode).toBe(1)
    expect(errors.mock.calls.flat().join(' ')).toMatch(/sections\/hero\.liquid <- src\/hero.section.tsx, src\/heroes/)
    expect(fs.existsSync(path.join(projectDir, 'theme', 'sections', 'hero.liquid'))).toBe(false)
  })
})
