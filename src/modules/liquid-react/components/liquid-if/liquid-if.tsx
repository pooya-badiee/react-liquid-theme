import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export interface LiquidIfProps extends BaseLiquidTagProps {
  condition: string
}

/**
 * `{% if condition %}children{% endif %}`. Put `LiquidElseIf` / `LiquidElse` inside as children.
 *
 * @example
 * <LiquidIf condition="product.available">
 *   In stock
 *   <LiquidElse>Sold out</LiquidElse>
 * </LiquidIf>
 */
export function LiquidIf({ condition, ...otherProps }: LiquidIfProps) {
  return <LiquidTag name="if" statement={condition} {...otherProps} />
}
