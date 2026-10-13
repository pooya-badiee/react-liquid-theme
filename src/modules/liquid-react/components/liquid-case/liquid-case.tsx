import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export interface LiquidCaseProps extends BaseLiquidTagProps {
  variable: string
}

export function LiquidCase({ variable, ...otherProps }: LiquidCaseProps) {
  return <LiquidTag name="case" statement={variable} {...otherProps} />
}
