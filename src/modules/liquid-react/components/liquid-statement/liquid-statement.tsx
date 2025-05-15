import dedent from 'dedent'

export interface LiquidStatementProps {
  statement: string
  leftTrim?: boolean
  rightTrim?: boolean
}

export function LiquidStatement({ statement, leftTrim, rightTrim }: LiquidStatementProps) {
  return dedent`
    {%${leftTrim ? '-' : ''} liquid
      ${statement}
    ${rightTrim ? '-' : ''}%}
  `
}
