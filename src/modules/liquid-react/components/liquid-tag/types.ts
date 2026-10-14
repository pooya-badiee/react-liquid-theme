import type { ReactNode } from 'react'

export interface BaseLiquidTagProps {
  /** `{%-` on the opening tag */
  leftTrim?: boolean
  /** `{%-` on the closing tag */
  rightTrim?: boolean
  /** `-%}` on the opening tag */
  leftBeginTrim?: boolean
  /** `-%}` on the closing tag */
  rightBeginTrim?: boolean
  children?: ReactNode
}
export interface BaseSelfClosingLiquidTagProps {
  /** `{%-` */
  leftTrim?: boolean
  /** `-%}` */
  rightTrim?: boolean
}
