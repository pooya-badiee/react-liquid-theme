import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export interface LiquidTablerowProps extends BaseLiquidTagProps {
  statement: string
}

/**
 * Must be wrapped in a `<table>` element.
 */
export function LiquidTablerow({ statement, ...otherProps }: LiquidTablerowProps) {
  return <LiquidTag name="tablerow" statement={statement} {...otherProps} />
}
