export type RenderArgs = Record<string, string | number | boolean | undefined>

export interface StructuredRenderProps {
  /** Snippet name, without quotes */
  snippet: string
  /** Liquid expressions passed to the snippet; string literals need their own quotes. `undefined` is skipped. */
  args?: RenderArgs
  /** `with <expression>`: renders once with the value as `as` (or the snippet name) */
  with?: string
  /** `for <expression>`: renders once per item, as `as` (or the snippet name) */
  for?: string
  as?: string
}

/** `'name' with x as y, key: value`; also used by `LiquidInclude` */
export function getRenderStatement({ snippet, args = {}, with: withValue, for: forValue, as }: StructuredRenderProps) {
  let statement = `'${snippet}'`
  if (withValue !== undefined) statement += ` with ${withValue}`
  if (forValue !== undefined) statement += ` for ${forValue}`
  if (as !== undefined) statement += ` as ${as}`
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined) statement += `, ${key}: ${value}`
  }
  return statement
}
