import type { ReactNode } from 'react'
import { DECODE_END_SIGN, DECODE_START_SIGN } from './constants'

interface HtmlDecoderProps {
  children: ReactNode
}

export function HtmlDecoder({ children }: HtmlDecoderProps) {
  return (
    <>
      {DECODE_START_SIGN}
      {children}
      {DECODE_END_SIGN}
    </>
  )
}
