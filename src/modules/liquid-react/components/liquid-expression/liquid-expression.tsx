import HtmlDecoder from '../html-decoder/html-decoder'

export interface LiquidExpressionProps {
  leftTrim?: boolean
  rightTrim?: boolean
  expression: string
}

export function LiquidExpression({ leftTrim, rightTrim, expression }: LiquidExpressionProps) {
  return <HtmlDecoder>{`{{${leftTrim ? '-' : ''} ${expression} ${rightTrim ? '-' : ''}}}`}</HtmlDecoder>
}
