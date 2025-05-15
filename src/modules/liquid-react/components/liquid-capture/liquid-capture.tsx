import { LiquidTag, type BaseLiquidTagProps } from '../liquid-tag'

interface LiquidCaptureProps extends BaseLiquidTagProps {
  variableName: string
}

export function LiquidCapture({ variableName, ...otherProps }: LiquidCaptureProps) {
  return <LiquidTag name="capture" statement={variableName} {...otherProps} />
}
