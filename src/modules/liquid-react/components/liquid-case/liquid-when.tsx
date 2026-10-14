import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidWhenProps extends BaseSelfClosingLiquidTagProps {
  value: string
  children?: React.ReactNode
}

/**
 * `{% when value %}` followed by children. Must be a child of `LiquidCase`, it has no closing tag.
 * `value` is Liquid source: `"'a'"`, `"'a', 'b'"`.
 */
export function LiquidWhen({ value, children, ...otherProps }: LiquidWhenProps) {
  return (
    <>
      <LiquidSelfClosingTag name="when" statement={value} {...otherProps} />
      {children}
    </>
  )
}
