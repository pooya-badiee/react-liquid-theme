import dedent from 'dedent'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export function setup() {
  const root = process.cwd()

  const packageJsonPath = path.join(root, 'package.json')
  const tsconfigPath = path.join(root, 'tsconfig.json')
  const srcDir = path.join(root, 'src')
  const snippetFile = path.join(srcDir, 'example.snippet.tsx')
  const snippetStyle = path.join(srcDir, 'example.snippet.module.scss')
  const globalTypes = path.join(srcDir, 'global.d.ts')

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  // Ensure the scripts object exists and update
  packageJson.scripts = {
    ...packageJson.scripts,
    build: 'react-liquid-theme generate',
    watch: 'react-liquid-theme generate --watch',
  }
  packageJson.type = 'module'

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  // Install dependencies
  execSync('npm install sass typescript react react-dom @types/react @types/react-dom')

  // Create tsconfig.json if it doesn't exist
  if (!fs.existsSync(tsconfigPath)) {
    fs.writeFileSync(tsconfigPath, JSON.stringify({ compilerOptions: { jsx: 'preserve' } }, null, 2))
  }

  // Create src directory if it doesn't exist (with recursive option)
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true })
  }

  // Create the snippet file if it doesn't exist
  if (!fs.existsSync(snippetFile)) {
    fs.writeFileSync(
      snippetFile,
      dedent`
        import classes from './example.snippet.module.scss'

        function ExampleSnippet() {
          return (
            <div className={classes.example}>
              <h1>Hello World</h1>
              <p>This is an example snippet</p>
            </div>
          )
        }
          
        export default ExampleSnippet`,
    )
  }

  // Create the snippet style file if it doesn't exist
  if (!fs.existsSync(snippetStyle)) {
    fs.writeFileSync(
      snippetStyle,
      dedent`
        .example {
          color: red;
        }`,
    )
  }

  // Create global.d.ts file with reference if it doesn't exist
  if (!fs.existsSync(globalTypes)) {
    fs.writeFileSync(globalTypes, '/// <reference types="react-liquid-theme/declarations" />')
  }
}
