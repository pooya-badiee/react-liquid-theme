import type { ReactNode } from 'react'

export interface BaseLiquidTagProps {
  leftTrim?: boolean
  rightTrim?: boolean
  leftBeginTrim?: boolean
  rightBeginTrim?: boolean
  children?: ReactNode
}
