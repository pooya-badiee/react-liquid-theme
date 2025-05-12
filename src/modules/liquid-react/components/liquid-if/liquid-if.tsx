import type { BaseLiquidProps } from '../../types'
import type { ReactNode } from 'react'

interface LiquidIfProps extends BaseLiquidProps {
  condition: string
  children: ReactNode
}

export function LiquidIf({ condition, children, leftTrim, rightTrim, leftBeginTrim, rightBeginTrim }: LiquidIfProps) {
  return (
    <>
      {`{%${leftTrim ? '-' : ''} if ${condition} ${leftBeginTrim ? '-' : ''}%}`}
      {children}
      {`{%${rightTrim ? '-' : ''} endif ${rightBeginTrim ? '-' : ''}%}`}
    </>
  )
}
