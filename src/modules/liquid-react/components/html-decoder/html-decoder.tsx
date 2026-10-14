import type { ReactNode } from 'react'
import { DECODE_END_SIGN, DECODE_START_SIGN } from './constants'

interface HtmlDecoderProps {
  children: ReactNode
}

/**
 * Outputs its text children without HTML escaping, so quotes and `<`/`>` in Liquid survive.
 *
 * @example
 * <LiquidTag name="schema">
 *   <HtmlDecoder>{JSON.stringify(schema, null, 2)}</HtmlDecoder>
 * </LiquidTag>
 */
export function HtmlDecoder({ children }: HtmlDecoderProps) {
  return (
    <>
      {DECODE_START_SIGN}
      {children}
      {DECODE_END_SIGN}
    </>
  )
}
