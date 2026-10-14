import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidDecrementProps extends BaseSelfClosingLiquidTagProps {
  variableName: string
}

/**
 * `{% decrement variableName %}`.
 */
export function LiquidDecrement({ variableName, ...otherProps }: LiquidDecrementProps) {
  return <LiquidSelfClosingTag name="decrement" statement={variableName} {...otherProps} />
}
