import dedent from 'dedent'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export function setup() {
  const root = process.cwd()

  const packageJsonPath = path.join(root, 'package.json')
  const tsconfigPath = path.join(root, 'tsconfig.json')
  const srcDir = path.join(root, 'src')
  const snippetFile = path.join(srcDir, 'counter.snippet.tsx')
  const snippetStyle = path.join(srcDir, 'counter.snippet.module.scss')
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
    fs.writeFileSync(
      tsconfigPath,
      JSON.stringify(
        {
          compilerOptions: {
            jsx: 'preserve',
            module: 'preserve',
            moduleResolution: 'bundler',
            skipLibCheck: true,
            target: 'esnext',
          },
        },
        null,
        2,
      ),
    )
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
        import { LiquidBreak, LiquidFor, LiquidExpression } from 'react-liquid-theme'
        import classes from './counter.snippet.module.scss'
        import { defineJsxTag } from 'react-liquid-theme/utils'

        const AppCounter = defineJsxTag('app-counter')

        function CounterSnippet() {
          return (
            <ul>
              <LiquidFor statement="index in (1..5)">
                <li>
                  <LiquidExpression expression="index" />
                  <AppCounter className={classes.counter}>
                    <LiquidBreak />
                    <span className="count">
                      <LiquidExpression expression="index" />
                    </span>
                    <button className="increment" type="button">
                      Increment
                    </button>
                    <button className="decrement" type="button">
                      Decrement
                    </button>
                  </AppCounter>
                </li>
              </LiquidFor>
            </ul>
          )
        }

        export default CounterSnippet
      `,
    )
  }
  // snippet client file
  const snippetClientFile = path.join(srcDir, 'counter.client.snippet.ts')
  if (!fs.existsSync(snippetClientFile)) {
    fs.writeFileSync(
      snippetClientFile,
      dedent`
        class CounterElement extends HTMLElement {
          #count = 0

          connectedCallback() {
            this.#render()
            this.querySelector('.increment')!.addEventListener('click', () => this.#increment())
            this.querySelector('.decrement')!.addEventListener('click', () => this.#decrement())
          }

          #increment() {
            this.#count++
            this.#render()
          }

          #decrement() {
            this.#count--
            this.#render()
          }

          #render() {
            this.querySelector('.count')!.textContent = this.#count.toString()
          }
        }

        customElements.define('app-counter', CounterElement)
      `,
    )
  }

  // Create the snippet style file if it doesn't exist
  if (!fs.existsSync(snippetStyle)) {
    fs.writeFileSync(
      snippetStyle,
      dedent`
        .counter {
          display: flex;
        }`,
    )
  }
  // .gitignore file
  const gitignorePath = path.join(root, '.gitignore')
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(
      gitignorePath,
      dedent`
        node_modules
        .react-liquid
      `,
    )
  }

  // theme.config.js config file
  const configFilePath = path.join(root, 'theme.config.js')
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(
      configFilePath,
      dedent`
      import { defineOptions } from 'react-liquid-theme/config'

      export default defineOptions({})
      `,
    )
  }

  // Create global.d.ts file with reference if it doesn't exist
  if (!fs.existsSync(globalTypes)) {
    fs.writeFileSync(globalTypes, `/// <reference types="react-liquid-theme/declarations" />`)
  }
}
