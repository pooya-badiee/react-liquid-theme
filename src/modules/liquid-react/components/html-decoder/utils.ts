import { DECODE_END_SIGN, DECODE_START_SIGN } from './constants'

/**
 * Marks a string to be output without HTML escaping. Use for Liquid with quotes in attributes,
 * which React would otherwise escape (`'` -> `&#x27;`).
 *
 * @example <img alt={makeDecodable("{{ 'products.image' | t }}")} />
 */
export function makeDecodable(expression: string) {
  return `${DECODE_START_SIGN}${expression}${DECODE_END_SIGN}`
}
