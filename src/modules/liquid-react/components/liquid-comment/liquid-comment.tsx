import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export function LiquidComment(props: BaseLiquidTagProps) {
  return <LiquidTag name="comment" {...props} />
}
