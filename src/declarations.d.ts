type CSSModuleClasses = { readonly [key: string]: string }
declare module '*.module.scss' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.module.css' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.scss' {
  const content: string
  export default content
}
declare module '*.css' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
