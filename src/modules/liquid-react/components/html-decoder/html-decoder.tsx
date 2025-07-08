import type { ReactNode } from 'react'
import { DECODE_START_SIGN, DECODE_END_SIGN } from './constants'

interface HtmlDecoderProps {
  children: ReactNode
}

function HtmlDecoder({ children }: HtmlDecoderProps) {
  return (
    <>
      {DECODE_START_SIGN}
      {children}
      {DECODE_END_SIGN}
    </>
  )
}

export default HtmlDecoder
