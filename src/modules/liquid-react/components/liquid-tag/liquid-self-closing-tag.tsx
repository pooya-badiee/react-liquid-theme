import { HtmlDecoder } from '../html-decoder/html-decoder'
import type { BaseSelfClosingLiquidTagProps } from './types'

export interface LiquidSelfClosingTagProps extends BaseSelfClosingLiquidTagProps {
  name: string
  statement?: string
}

export function LiquidSelfClosingTag({ name, statement, leftTrim, rightTrim }: LiquidSelfClosingTagProps) {
  return (
    <HtmlDecoder>{`{%${leftTrim ? '-' : ''} ${name}${statement ? ` ${statement}` : ''} ${rightTrim ? '-' : ''}%}`}</HtmlDecoder>
  )
}
