import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidWhenProps extends BaseSelfClosingLiquidTagProps {
  value: string
  children?: React.ReactNode
}

export function LiquidWhen({ value, children, ...otherProps }: LiquidWhenProps) {
  return (
    <>
      <LiquidSelfClosingTag name="when" statement={value} {...otherProps} />
      {children}
    </>
  )
}
