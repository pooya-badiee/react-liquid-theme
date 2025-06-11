export interface LiquidExpressionProps {
  leftTrim?: boolean
  rightTrim?: boolean
  expression: string
}

export function LiquidExpression({ leftTrim, rightTrim, expression }: LiquidExpressionProps) {
  return `{{${leftTrim ? '-' : ''} ${expression} ${rightTrim ? '-' : ''}}}`
}
