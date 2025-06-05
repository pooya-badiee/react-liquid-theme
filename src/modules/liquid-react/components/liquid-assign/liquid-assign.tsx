import { LiquidSelfClosingTag, type BaseSelfClosingLiquidTagProps } from '../liquid-tag'

interface LiquidAssignProps extends BaseSelfClosingLiquidTagProps {
  name: string
}

export function LiquidAssign({ name, ...otherProps }: LiquidAssignProps) {
  return <LiquidSelfClosingTag name="assign" statement={name} {...otherProps} />
}
