import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

/**
 * Renders `{% raw %}...{% endraw %}`. Not to be confused with `LiquidRaw`, which parses a Liquid string.
 */
export function LiquidRawTag(props: BaseLiquidTagProps) {
  return <LiquidTag name="raw" {...props} />
}
