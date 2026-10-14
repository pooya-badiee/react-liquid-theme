import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

interface LiquidAssignProps extends BaseSelfClosingLiquidTagProps {
  name: string
  value: string
}

/**
 * `{% assign name = value %}`. `value` is Liquid source, so string literals need quotes.
 *
 * @example <LiquidAssign name="title" value="product.title | upcase" />
 */
export function LiquidAssign({ name, value, ...otherProps }: LiquidAssignProps) {
  return <LiquidSelfClosingTag name="assign" statement={`${name} = ${value}`} {...otherProps} />
}
