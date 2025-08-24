import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

const testProjectPath = path.resolve(process.cwd(), '..', 'react-liquid-theme-test')
const testProjectPackageJsonPath = path.join(testProjectPath, 'package.json')
// we first delete the test project if it exists
fs.rmSync(testProjectPath, { recursive: true, force: true })
// then we create the test project
fs.mkdirSync(testProjectPath)
// we create the package.json file
const packageJson = {
  name: 'react-liquid-theme-test',
  version: '1.0.0',
  private: true,
  type: 'module',
  dependencies: {
    react: '^19',
    'react-dom': '^19',
    typescript: 'latest',
    '@types/react': 'latest',
    '@types/react-dom': 'latest',
    'react-liquid-theme': 'file:../react-liquid-theme',
  },
  scripts: {
    build: 'node ./node_modules/react-liquid-theme/dist/cli.js generate',
    watch: 'node ./node_modules/react-liquid-theme/dist/cli.js generate --watch',
    setup: 'node ./node_modules/react-liquid-theme/dist/cli.js setup',
  },
}
// write the package.json file
fs.writeFileSync(testProjectPackageJsonPath, JSON.stringify(packageJson, null, 2))
// we now install
execSync('npm install', {
  cwd: testProjectPath,
  stdio: 'inherit',
})

// now we create the src directory
const srcPath = path.join(testProjectPath, 'src')
fs.mkdirSync(srcPath)
// now the global.d.ts file
const GLOBAL_D_TS_CONTENT = `/// <reference types="react-liquid-theme/declarations" />`
fs.writeFileSync(path.join(srcPath, 'global.d.ts'), GLOBAL_D_TS_CONTENT)
// now we create the file.snippet.tsx files
for (let index = 1; index <= 100; index++) {
  const fileSnippetPath = path.join(srcPath, `file.${index}.snippet.tsx`)
  const fileSnippetContent = `
  import classes from './file.${index}.module.scss'
  export default function File${index}Snippet() {
    return <div className={classes.root}>File ${index} Snippet</div>
  }
  `
  // we also create a corresponding SCSS module file
  const scssModulePath = path.join(srcPath, `file.${index}.module.scss`)
  const scssModuleContent = `
  .root {
    color: var(--liquid-color-text);
    background-color: var(--liquid-color-background);
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
  }
  `
  fs.writeFileSync(scssModulePath, scssModuleContent)
  fs.writeFileSync(fileSnippetPath, fileSnippetContent)
}

// now we create the tsconfig.json file
const tsconfigPath = path.join(testProjectPath, 'tsconfig.json')
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
