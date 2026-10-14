import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidElseIfProps extends BaseSelfClosingLiquidTagProps {
  condition: string
  children?: React.ReactNode
}

/**
 * `{% elsif condition %}` followed by children. Must be a child of `LiquidIf`, it has no closing tag.
 */
export function LiquidElseIf({ condition, children, ...otherProps }: LiquidElseIfProps) {
  return (
    <>
      <LiquidSelfClosingTag name="elsif" statement={condition} {...otherProps} />
      {children}
    </>
  )
}
