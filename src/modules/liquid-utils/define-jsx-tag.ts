/**
 * Prevents TypeScript errors for custom JSX tags.
 * Use `data-*` attributes for custom props to avoid conflicts.
 *
 * Example:
 * const MyTag = defineJsxTag('my-element')
 * <MyTag data-value="123" />
 */
export function defineJsxTag(tagName: string) {
  return tagName as 'div'
}
