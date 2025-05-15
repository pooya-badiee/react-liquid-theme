export interface LiquidSelfClosingTagProps {
  name: string
  leftTrim?: boolean
  rightTrim?: boolean
  statement?: string
}

export function LiquidSelfClosingTag({ name, statement, leftTrim, rightTrim }: LiquidSelfClosingTagProps) {
  return `{%${leftTrim ? '-' : ''} ${name}${statement ? ` ${statement}` : ''} ${rightTrim ? '-' : ''}%}`
}
