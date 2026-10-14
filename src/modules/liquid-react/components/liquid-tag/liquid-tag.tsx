import { HtmlDecoder } from '../html-decoder/html-decoder'
import type { BaseLiquidTagProps } from './types'

export interface LiquidTagProps extends BaseLiquidTagProps {
  name: string
  statement?: string
}

/**
 * Any block tag: `{% name statement %}children{% endname %}`. Use for tags without a dedicated
 * component (`form`, `paginate`, `style`, `schema`, ...).
 *
 * @example <LiquidTag name="form" statement="'product', product">...</LiquidTag>
 */
export function LiquidTag({
  name,
  statement,
  children,
  leftTrim,
  rightTrim,
  leftBeginTrim,
  rightBeginTrim,
}: LiquidTagProps) {
  return (
    <>
      <HtmlDecoder>{`{%${leftTrim ? '-' : ''} ${name}${statement ? ` ${statement}` : ''} ${leftBeginTrim ? '-' : ''}%}`}</HtmlDecoder>
      {children}
      <HtmlDecoder>{`{%${rightTrim ? '-' : ''} end${name} ${rightBeginTrim ? '-' : ''}%}`}</HtmlDecoder>
    </>
  )
}
