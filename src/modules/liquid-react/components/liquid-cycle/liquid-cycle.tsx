import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidCycleProps extends BaseSelfClosingLiquidTagProps {
  values: string[]
  group?: string
}

export function LiquidCycle({ values, group, ...otherProps }: LiquidCycleProps) {
  return (
    <LiquidSelfClosingTag name="cycle" statement={`${group ? `${group}: ` : ''}${values.join(', ')}`} {...otherProps} />
  )
}
