import { LiquidTag, type BaseLiquidTagProps } from '../liquid-tag'

interface LiquidForProps extends BaseLiquidTagProps {
  statement: string
}

export function LiquidFor({ statement, ...otherProps }: LiquidForProps) {
  return <LiquidTag name="for" statement={statement} {...otherProps} />
}
