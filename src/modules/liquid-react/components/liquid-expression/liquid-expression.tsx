import { HtmlDecoder } from '../html-decoder/html-decoder'

export interface LiquidExpressionProps {
  /** `{{-` */
  leftTrim?: boolean
  /** `-}}` */
  rightTrim?: boolean
  /** Liquid source without the braces, e.g. `product.title | escape` */
  expression: string
}

/**
 * `{{ expression }}`. Use this for Liquid output in text: plain JSX strings get HTML-escaped,
 * so `{"{{ 'x' | t }}"}` would break. For attributes, use `makeDecodable`.
 *
 * @example <LiquidExpression expression="'general.title' | t" />
 */
export function LiquidExpression({ leftTrim, rightTrim, expression }: LiquidExpressionProps) {
  return <HtmlDecoder>{`{{${leftTrim ? '-' : ''} ${expression} ${rightTrim ? '-' : ''}}}`}</HtmlDecoder>
}
