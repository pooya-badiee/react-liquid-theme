import { LiquidSelfClosingTag, type BaseSelfClosingLiquidTagProps } from '../liquid-tag'

export interface LiquidElseProps extends BaseSelfClosingLiquidTagProps {
  children?: React.ReactNode
}

export function LiquidElse({ children, ...otherProps }: LiquidElseProps) {
  return (
    <>
      <LiquidSelfClosingTag name="else" {...otherProps} />
      {children}
    </>
  )
}
