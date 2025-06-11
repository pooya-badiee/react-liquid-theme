import parse from 'html-react-parser'

/**
 * @property {string} content - The HTML string to be parsed and rendered.
 */
export interface LiquidRawProps {
  liquid: string
}

/**
 * React component that takes an Liquid string and renders it as React elements.
 *
 * @param {LiquidRawProps} props - The props containing the HTML content.
 */
export function LiquidRaw({ liquid }: LiquidRawProps) {
  return <>{parse(liquid)}</>
}
