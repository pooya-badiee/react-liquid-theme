interface LiquidExpressionProps {
  leftTrim?: boolean
  rightTrim?: boolean
  expression: string
}

function LiquidExpression({ leftTrim, rightTrim, expression }: LiquidExpressionProps) {
  return `{{${leftTrim ? '-' : ''} ${expression} ${rightTrim ? '-' : ''}}}`
}

export default LiquidExpression
