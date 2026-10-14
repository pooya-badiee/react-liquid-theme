import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidCycleProps extends BaseSelfClosingLiquidTagProps {
  values: string[]
  group?: string
}

/**
 * `{% cycle group: v1, v2 %}`. Values are Liquid source, e.g. `values={["'odd'", "'even'"]}`.
 */
export function LiquidCycle({ values, group, ...otherProps }: LiquidCycleProps) {
  return (
    <LiquidSelfClosingTag name="cycle" statement={`${group ? `${group}: ` : ''}${values.join(', ')}`} {...otherProps} />
  )
}
