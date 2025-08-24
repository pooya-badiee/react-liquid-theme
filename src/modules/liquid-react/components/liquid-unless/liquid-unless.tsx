import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export interface LiquidUnless extends BaseLiquidTagProps {
  condition: string
}

export function LiquidUnless({ condition, ...otherProps }: LiquidUnless) {
  return <LiquidTag name="unless" statement={condition} {...otherProps} />
}
