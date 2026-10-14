import type { ComponentProps } from 'react'
import { type LiquidJsonValue, toLiquidJson } from './to-liquid-json'

export interface LiquidJsonProps extends Omit<ComponentProps<'script'>, 'children' | 'dangerouslySetInnerHTML'> {
  value: LiquidJsonValue
  /** @default 'application/json' */
  type?: 'application/json' | 'application/ld+json' | (string & {})
}

/**
 * Renders a `<script>` whose content is Liquid that outputs valid JSON at runtime.
 * Build the value with `liquid()`, `when()`, `each()` and `raw()`.
 */
export function LiquidJson({ value, type = 'application/json', ...otherProps }: LiquidJsonProps) {
  return (
    <script
      type={type}
      {...otherProps}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time strings are escaped by toLiquidJson
      dangerouslySetInnerHTML={{ __html: toLiquidJson(value) }}
    />
  )
}
