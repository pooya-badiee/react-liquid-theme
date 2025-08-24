import { type BaseLiquidTagProps, LiquidTag } from '../liquid-tag'

export interface LiquidCaptureProps extends BaseLiquidTagProps {
  variableName: string
}

export function LiquidCapture({ variableName, ...otherProps }: LiquidCaptureProps) {
  return <LiquidTag name="capture" statement={variableName} {...otherProps} />
}
