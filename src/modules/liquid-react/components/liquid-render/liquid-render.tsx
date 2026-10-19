import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'
import { getRenderStatement, type StructuredRenderProps } from './render-statement'

export type LiquidRenderProps = BaseSelfClosingLiquidTagProps &
  (
    | { statement: string }
    | (StructuredRenderProps &
        ({ with?: string; for?: never } | { with?: never; for?: string }) & { statement?: never })
  )

/**
 * `{% render ... %}`, from a raw `statement` (including the quoted snippet name) or from `snippet` + `args`.
 *
 * @example <LiquidRender statement="'product-card', product: product" />
 * @example <LiquidRender snippet="image-group" args={{ image: 'section.settings.image', size: "'large'" }} />
 * @example <LiquidRender snippet="product-card" for="collection.products" as="product" />
 */
export function LiquidRender(props: LiquidRenderProps) {
  const statement = props.statement ?? getRenderStatement(props as StructuredRenderProps)
  return (
    <LiquidSelfClosingTag
      name="render"
      statement={statement}
      leftTrim={!!props.leftTrim}
      rightTrim={!!props.rightTrim}
    />
  )
}
