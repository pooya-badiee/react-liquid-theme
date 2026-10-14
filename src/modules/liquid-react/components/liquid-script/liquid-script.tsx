import { decode } from 'html-entities'
import type { ComponentProps, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DECODE_END_SIGN, DECODE_START_SIGN } from '../html-decoder/constants'

type ScriptProps = Omit<ComponentProps<'script'>, 'children' | 'dangerouslySetInnerHTML'>

export type LiquidScriptProps = ScriptProps &
  (
    | {
        /** Script content inserted as is, e.g. `` `window.product = {{ product | json }}` `` */
        value: string
        children?: never
      }
    | {
        /** Liquid components and text, rendered to a string. */
        children: ReactNode
        value?: never
      }
  )

/**
 * `<script>` with Liquid inside. React only allows a single string in `<script>`,
 * so nested components would otherwise render an empty tag.
 */
export function LiquidScript({ value, children, ...otherProps }: LiquidScriptProps) {
  return (
    <script
      {...otherProps}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: script content is authored liquid, not user input
      dangerouslySetInnerHTML={{ __html: value ?? renderChildren(children) }}
    />
  )
}

// React escapes all text exactly once, so drop the decode markers and unescape everything once
function renderChildren(children: ReactNode) {
  const markup = renderToStaticMarkup(children)
  return decode(markup.replaceAll(DECODE_START_SIGN, '').replaceAll(DECODE_END_SIGN, ''))
}
