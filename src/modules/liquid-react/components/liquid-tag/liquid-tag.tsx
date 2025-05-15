import type { ReactNode } from 'react'
import type { BaseLiquidTagProps } from './types'

export interface LiquidTagProps extends BaseLiquidTagProps {
  name: string
  statement?: string
  children?: ReactNode
}

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
      {`{%${leftTrim ? '-' : ''} ${name}${statement ? ` ${statement}` : ''} ${leftBeginTrim ? '-' : ''}%}`}
      {children}
      {`{%${rightTrim ? '-' : ''} end${name} ${rightBeginTrim ? '-' : ''}%}`}
    </>
  )
}
