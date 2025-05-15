import { LiquidTag, type BaseLiquidTagProps } from '../liquid-tag'

export interface LiquidIfProps extends BaseLiquidTagProps {
  condition: string
}

export function LiquidIf({ condition, ...otherProps }: LiquidIfProps) {
  return <LiquidTag name="if" statement={condition} {...otherProps} />
}
