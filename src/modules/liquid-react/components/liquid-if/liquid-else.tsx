import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidElseProps extends BaseSelfClosingLiquidTagProps {
  children?: React.ReactNode
}

/**
 * `{% else %}` followed by children. Must be a child of `LiquidIf`, `LiquidUnless` or `LiquidCase`.
 */
export function LiquidElse({ children, ...otherProps }: LiquidElseProps) {
  return (
    <>
      <LiquidSelfClosingTag name="else" {...otherProps} />
      {children}
    </>
  )
}
