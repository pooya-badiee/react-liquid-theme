import type { BaseSelfClosingLiquidTagProps } from './types'

export interface LiquidSelfClosingTagProps extends BaseSelfClosingLiquidTagProps {
  name: string
  statement?: string
}

export function LiquidSelfClosingTag({ name, statement, leftTrim, rightTrim }: LiquidSelfClosingTagProps) {
  return `{%${leftTrim ? '-' : ''} ${name}${statement ? ` ${statement}` : ''} ${rightTrim ? '-' : ''}%}`
}
