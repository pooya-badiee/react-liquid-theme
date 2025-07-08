import dedent from 'dedent'
import { HtmlDecoder } from '../html-decoder'

export interface LiquidStatementProps {
  statement: string
  leftTrim?: boolean
  rightTrim?: boolean
}

export function LiquidStatement({ statement, leftTrim, rightTrim }: LiquidStatementProps) {
  return (
    <HtmlDecoder>{dedent`
    {%${leftTrim ? '-' : ''} liquid
      ${statement}
    ${rightTrim ? '-' : ''}%}
  `}</HtmlDecoder>
  )
}
