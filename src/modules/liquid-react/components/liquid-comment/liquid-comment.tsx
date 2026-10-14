import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

/**
 * `{% comment %}children{% endcomment %}`.
 */
export function LiquidComment(props: BaseLiquidTagProps) {
  return <LiquidTag name="comment" {...props} />
}
