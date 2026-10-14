import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export interface LiquidCaptureProps extends BaseLiquidTagProps {
  variableName: string
}

/**
 * `{% capture variableName %}children{% endcapture %}`.
 */
export function LiquidCapture({ variableName, ...otherProps }: LiquidCaptureProps) {
  return <LiquidTag name="capture" statement={variableName} {...otherProps} />
}
