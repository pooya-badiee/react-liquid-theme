import { LiquidSelfClosingTag, type BaseLiquidTagProps } from '../liquid-tag'

interface LiquidAssignProps extends BaseLiquidTagProps {
  name: string
}

export function LiquidAssign({ name, ...otherProps }: LiquidAssignProps) {
  return <LiquidSelfClosingTag name="assign" statement={name} {...otherProps} />
}
