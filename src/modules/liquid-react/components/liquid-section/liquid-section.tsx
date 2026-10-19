import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidSectionProps extends BaseSelfClosingLiquidTagProps {
  /** Section file name, without quotes */
  name: string
}

/**
 * `{% section 'name' %}`, renders a section statically.
 *
 * @example <LiquidSection name="header" />
 */
export function LiquidSection({ name, ...otherProps }: LiquidSectionProps) {
  return <LiquidSelfClosingTag name="section" statement={`'${name}'`} {...otherProps} />
}

/**
 * `{% sections 'name' %}`, renders a section group.
 *
 * @example <LiquidSections name="header-group" />
 */
export function LiquidSections({ name, ...otherProps }: LiquidSectionProps) {
  return <LiquidSelfClosingTag name="sections" statement={`'${name}'`} {...otherProps} />
}
