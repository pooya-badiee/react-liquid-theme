import parse from 'html-react-parser'

export interface LiquidRawProps {
  /** HTML/Liquid string to parse */
  liquid: string
}

/**
 * Parses an HTML/Liquid string into React elements. Text nodes are still HTML-escaped,
 * so quoted Liquid in text breaks; wrap the string in `HtmlDecoder` to output it verbatim instead.
 * Not to be confused with `LiquidRawTag` (`{% raw %}`).
 */
export function LiquidRaw({ liquid }: LiquidRawProps) {
  return <>{parse(liquid)}</>
}
