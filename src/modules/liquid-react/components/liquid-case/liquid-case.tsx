import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export interface LiquidCaseProps extends BaseLiquidTagProps {
  variable: string
}

/**
 * `{% case variable %}...{% endcase %}`. Put `LiquidWhen` (and optionally `LiquidElse`) inside as children.
 *
 * @example
 * <LiquidCase variable="section.settings.layout">
 *   <LiquidWhen value="'grid'"><Grid /></LiquidWhen>
 *   <LiquidElse><List /></LiquidElse>
 * </LiquidCase>
 */
export function LiquidCase({ variable, ...otherProps }: LiquidCaseProps) {
  return <LiquidTag name="case" statement={variable} {...otherProps} />
}
