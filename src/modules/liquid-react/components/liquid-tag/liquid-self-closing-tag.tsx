interface LiquidSelfClosingTagProps {
  name: string
  leftTrim?: boolean
  rightTrim?: boolean
}

export function LiquidSelfClosingTag({ name, leftTrim, rightTrim }: LiquidSelfClosingTagProps) {
  return `{%${leftTrim ? '-' : ''} ${name} ${rightTrim ? '-' : ''}%}`
}
