import { type BaseSelfClosingLiquidTagProps, LiquidSelfClosingTag } from '../liquid-tag'

export interface LiquidInlineCommentProps extends BaseSelfClosingLiquidTagProps {
  comment: string
}

/**
 * Renders `{% # comment %}`. Every line of a multi-line comment must start with `#`, so lines are prefixed.
 */
export function LiquidInlineComment({ comment, ...otherProps }: LiquidInlineCommentProps) {
  return <LiquidSelfClosingTag name="#" statement={comment.split('\n').join('\n# ')} {...otherProps} />
}
