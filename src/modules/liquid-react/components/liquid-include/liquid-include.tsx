import { getRenderStatement, type StructuredRenderProps } from '../liquid-render/render-statement'
import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export type LiquidIncludeProps = BaseSelfClosingLiquidTagProps &
  ({ statement: string } | (Omit<StructuredRenderProps, 'for'> & { statement?: never }))

/**
 * `{% include ... %}`. Deprecated in Shopify (prefer `LiquidRender`), but common in legacy themes.
 *
 * @example <LiquidInclude snippet="blocks" />
 * @example <LiquidInclude statement="'icon', name: 'cart'" />
 */
export function LiquidInclude(props: LiquidIncludeProps) {
  const statement = props.statement ?? getRenderStatement(props as StructuredRenderProps)
  return (
    <LiquidSelfClosingTag
      name="include"
      statement={statement}
      leftTrim={!!props.leftTrim}
      rightTrim={!!props.rightTrim}
    />
  )
}
