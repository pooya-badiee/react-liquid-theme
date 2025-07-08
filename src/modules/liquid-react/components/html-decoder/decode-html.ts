import { decode } from 'html-entities'

/**
 * Extracts and decodes all segments between `startSign` and `endSign` in the input HTML string.
 * Handles nested/recursive segments by decoding the innermost first.
 * Unmarked areas are left unchanged.
 *
 * Example:
 *   decodeHtml('<decode>&quot;</decode>', '<decode>', '</decode>') → '"'
 */
export function decodeHtml(html: string, startSign: string, endSign: string): string {
  let remaining = html

  while (true) {
    const start = remaining.lastIndexOf(startSign)
    if (start === -1) break

    const end = remaining.indexOf(endSign, start + startSign.length)
    if (end === -1) break

    const inner = remaining.slice(start + startSign.length, end)
    const decoded = decode(inner)

    // Replace the matched section with the decoded text
    remaining =
      remaining.slice(0, start) +
      decoded +
      remaining.slice(end + endSign.length)
  }

  return remaining
}
