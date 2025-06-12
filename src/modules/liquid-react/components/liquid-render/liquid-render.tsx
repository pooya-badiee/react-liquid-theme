import { LiquidSelfClosingTag, type BaseSelfClosingLiquidTagProps } from '../liquid-tag'

interface LiquidRenderProps extends BaseSelfClosingLiquidTagProps {
  statement: string
}

export function LiquidRender({ statement, ...otherProps }: LiquidRenderProps) {
  return <LiquidSelfClosingTag name="render" statement={statement} {...otherProps} />
}
