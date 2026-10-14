import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidEchoProps extends BaseSelfClosingLiquidTagProps {
  expression: string
}

/**
 * `{% echo expression %}`.
 */
export function LiquidEcho({ expression, ...otherProps }: LiquidEchoProps) {
  return <LiquidSelfClosingTag name="echo" statement={expression} {...otherProps} />
}
