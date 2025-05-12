import dedent from 'dedent'
import type { BaseLiquidProps } from '../../types'

export interface LiquidStatementProps extends BaseLiquidProps {
  statement: string
}

export function LiquidStatement({ statement, leftTrim, rightTrim }: LiquidStatementProps) {
  return dedent`
    {%${leftTrim ? '-' : ''} liquid
      ${statement}
    ${rightTrim ? '-' : ''}%}
  `
}
