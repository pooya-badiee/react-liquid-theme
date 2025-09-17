import { DECODE_END_SIGN, DECODE_START_SIGN } from './constants'

// not used in component, exposed for external usage
export function makeDecodable(expression: string) {
  return `${DECODE_START_SIGN}${expression}${DECODE_END_SIGN}`
}