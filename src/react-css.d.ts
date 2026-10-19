// a module file, so this augments React's types instead of replacing them
import 'react'

declare module 'react' {
  interface CSSProperties {
    /** CSS custom properties, e.g. `style={{ '--gap': '1rem' }}` */
    [key: `--${string}`]: string | number | undefined
  }
}
