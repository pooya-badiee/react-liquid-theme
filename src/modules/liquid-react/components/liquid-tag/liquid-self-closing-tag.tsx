import { HtmlDecoder } from '../html-decoder/html-decoder'
import type { BaseSelfClosingLiquidTagProps } from './types'

export interface LiquidSelfClosingTagProps extends BaseSelfClosingLiquidTagProps {
  name: string
  statement?: string
}

/**
 * Any single tag: `{% name statement %}`, no closing tag. Use for tags without a dedicated component
 * (`section`, `sections`, `content_for`, `layout`, ...).
 *
 * @example <LiquidSelfClosingTag name="section" statement="'header'" />
 */
export function LiquidSelfClosingTag({ name, statement, leftTrim, rightTrim }: LiquidSelfClosingTagProps) {
  return (
    <HtmlDecoder>{`{%${leftTrim ? '-' : ''} ${name}${statement ? ` ${statement}` : ''} ${rightTrim ? '-' : ''}%}`}</HtmlDecoder>
  )
}
