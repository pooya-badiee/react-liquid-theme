import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidIncrementProps extends BaseSelfClosingLiquidTagProps {
  variableName: string
}

/**
 * `{% increment variableName %}`.
 */
export function LiquidIncrement({ variableName, ...otherProps }: LiquidIncrementProps) {
  return <LiquidSelfClosingTag name="increment" statement={variableName} {...otherProps} />
}
