import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

interface LiquidRenderProps extends BaseSelfClosingLiquidTagProps {
  statement: string
}

/**
 * `{% render statement %}`. The statement includes the quoted snippet name.
 *
 * @example <LiquidRender statement="'product-card', product: product" />
 */
export function LiquidRender({ statement, ...otherProps }: LiquidRenderProps) {
  return <LiquidSelfClosingTag name="render" statement={statement} {...otherProps} />
}
