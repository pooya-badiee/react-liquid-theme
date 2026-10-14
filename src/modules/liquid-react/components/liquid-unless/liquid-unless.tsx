import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export interface LiquidUnless extends BaseLiquidTagProps {
  condition: string
}

/**
 * `{% unless condition %}children{% endunless %}`.
 */
export function LiquidUnless({ condition, ...otherProps }: LiquidUnless) {
  return <LiquidTag name="unless" statement={condition} {...otherProps} />
}
