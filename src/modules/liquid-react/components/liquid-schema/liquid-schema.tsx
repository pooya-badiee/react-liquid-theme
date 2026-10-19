import { HtmlDecoder } from '../html-decoder/html-decoder'
import { LiquidTag } from '../liquid-tag'
import type { SectionSchema, ThemeBlockSchema } from './types'

export interface LiquidSchemaProps {
  /** Build it with `defineSectionSchema` / `defineBlockSchema` to get type checking */
  schema: SectionSchema | ThemeBlockSchema | Record<string, unknown>
}

/**
 * `{% schema %}` with the schema as JSON.
 *
 * @example <LiquidSchema schema={schema} />
 */
export function LiquidSchema({ schema }: LiquidSchemaProps) {
  return (
    <LiquidTag name="schema">
      <HtmlDecoder>{JSON.stringify(schema, null, 2)}</HtmlDecoder>
    </LiquidTag>
  )
}

/** Returns the schema as is; only there for type checking (setting types, misspelled keys). */
export function defineSectionSchema(schema: SectionSchema): SectionSchema {
  return schema
}

/** Returns the schema as is; only there for type checking (setting types, misspelled keys). */
export function defineBlockSchema(schema: ThemeBlockSchema): ThemeBlockSchema {
  return schema
}
