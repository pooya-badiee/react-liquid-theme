import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

interface LiquidForProps extends BaseLiquidTagProps {
  statement: string
}

/**
 * `{% for statement %}children{% endfor %}`. Loops at request time; use JS `map` for build-time data.
 *
 * @example <LiquidFor statement="product in collection.products limit: 4">...</LiquidFor>
 */
export function LiquidFor({ statement, ...otherProps }: LiquidForProps) {
  return <LiquidTag name="for" statement={statement} {...otherProps} />
}
