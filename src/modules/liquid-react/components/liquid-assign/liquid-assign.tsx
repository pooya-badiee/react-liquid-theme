import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

interface LiquidAssignProps extends BaseSelfClosingLiquidTagProps {
  name: string
  value: string
}

export function LiquidAssign({ name, value, ...otherProps }: LiquidAssignProps) {
  return <LiquidSelfClosingTag name="assign" statement={`${name} = ${value}`} {...otherProps} />
}
