import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidElseIfProps extends BaseSelfClosingLiquidTagProps {
  condition: string
  children?: React.ReactNode
}

export function LiquidElseIf({ condition, children, ...otherProps }: LiquidElseIfProps) {
  return (
    <>
      <LiquidSelfClosingTag name="elsif" statement={condition} {...otherProps} />
      {children}
    </>
  )
}
