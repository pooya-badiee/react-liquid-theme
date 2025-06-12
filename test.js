import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve('../react-liquid-theme')
const test = resolve('../liquid-theme-test2')

// STEP1: build react-liquid-theme
execSync('npm run build', { cwd: root, stdio: 'inherit' })

// STEP2: create test directory, we delete it if it exists
if (existsSync(test)) {
  execSync(`rm -rf ${test}`, { stdio: 'inherit' })
}
mkdirSync(test)

// STEP3: create package.json
writeFileSync(
  `${test}/package.json`,
  JSON.stringify(
    {
      name: 'liquid-theme-test2',
      version: '1.0.0',
      dependencies: { 'react-liquid-theme': 'file:../react-liquid-theme' },
    },
    null,
    2,
  ),
)

// STEP4: install dependencies
execSync('npm install', { cwd: test, stdio: 'inherit' })

// STEP5: run setup
execSync('npx react-liquid-theme setup', { cwd: test, stdio: 'inherit' })

// STEP6: build liquid theme
execSync('npm run build', { cwd: test, stdio: 'inherit' })
