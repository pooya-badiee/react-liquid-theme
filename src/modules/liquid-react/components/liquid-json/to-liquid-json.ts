import dedent from 'dedent'

const NODE = Symbol('liquid-json-node')

interface LiquidNode {
  [NODE]: 'liquid'
  expression: string
}
interface RawNode {
  [NODE]: 'raw'
  liquid: string
}
interface WhenNode {
  [NODE]: 'when'
  condition: string
  then: LiquidJsonValue
  otherwise?: LiquidJsonValue
}
interface EachNode {
  [NODE]: 'each'
  statement: string
  setup?: string
  where?: string
  item: LiquidJsonValue
}
type LiquidJsonNode = LiquidNode | RawNode | WhenNode | EachNode

export type LiquidJsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | LiquidJsonNode
  | LiquidJsonValue[]
  | { [key: string]: LiquidJsonValue }

export interface EachOptions {
  /** Liquid statements (as inside `{% liquid %}`) run at the start of every iteration. */
  setup?: string
  /** Liquid condition; iterations where it is falsy are skipped. */
  where?: string
}

/** A Liquid expression, output as `{{ expression | json }}`. */
export function liquid(expression: string): LiquidNode {
  return { [NODE]: 'liquid', expression }
}

/** Liquid that already outputs valid JSON, inserted as is (e.g. a `{% render %}` of a JSON snippet). */
export function raw(liquid: string): RawNode {
  return { [NODE]: 'raw', liquid }
}

/**
 * Conditional value. Without `otherwise`, the key (or array element) is omitted when `condition` is falsy;
 * as a standalone value it falls back to `null`.
 */
export function when(condition: string, then: LiquidJsonValue, otherwise?: LiquidJsonValue): WhenNode {
  return otherwise === undefined ? { [NODE]: 'when', condition, then } : { [NODE]: 'when', condition, then, otherwise }
}

/** An array built by `{% for statement %}`. Commas are handled, including when `where` skips iterations. */
export function each(statement: string, item: LiquidJsonValue, { setup, where }: EachOptions = {}): EachNode {
  return {
    [NODE]: 'each',
    statement,
    item,
    ...(setup !== undefined && { setup }),
    ...(where !== undefined && { where }),
  }
}

/** Serializes a value into a Liquid template that outputs valid JSON at runtime. */
export function toLiquidJson(value: LiquidJsonValue): string {
  return serialize(value, { separatorCount: 0 })
}

interface Context {
  separatorCount: number
}

interface Entry {
  condition?: string
  text: string
}

function serialize(value: LiquidJsonValue, ctx: Context): string {
  if (value === undefined) return 'null'
  if (isNode(value)) {
    switch (value[NODE]) {
      case 'liquid':
        return `{{ ${value.expression} | json }}`
      case 'raw':
        return value.liquid
      case 'when':
        return `{% if ${value.condition} %}${serialize(value.then, ctx)}{% else %}${serialize(value.otherwise ?? null, ctx)}{% endif %}`
      case 'each':
        return serializeEach(value, ctx)
    }
  }
  if (Array.isArray(value)) {
    return `[${joinEntries(
      value.map((item) => toEntry(item, (text) => text, ctx)),
      ctx,
    )}]`
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => toEntry(item, (text) => `${escapeStatic(key)}:${text}`, ctx))
    // key order is irrelevant in JSON, unconditional keys first avoids separator flags
    entries.sort((a, b) => Number(a.condition !== undefined) - Number(b.condition !== undefined))
    // `{{%` would be read as a liquid output tag, so pad braces next to liquid
    const content = joinEntries(entries, ctx)
    return `{${content.startsWith('{') ? ' ' : ''}${content}${content.endsWith('}') ? ' ' : ''}}`
  }
  return escapeStatic(value)
}

function toEntry(value: LiquidJsonValue, wrap: (text: string) => string, ctx: Context): Entry {
  if (isNode(value) && value[NODE] === 'when' && value.otherwise === undefined) {
    return { condition: value.condition, text: wrap(serialize(value.then, ctx)) }
  }
  return { text: wrap(serialize(value, ctx)) }
}

/**
 * Joins entries with commas. Once an unconditional entry is out, later conditional entries carry a leading comma.
 * Before that, a runtime flag tracks whether anything was output yet.
 */
function joinEntries(entries: Entry[], ctx: Context): string {
  let output = ''
  let flag: string | null = null
  let hasCertain = false
  let hasPossible = false

  for (const { condition, text } of entries) {
    let piece: string
    if (hasCertain) {
      piece = `,${text}`
    } else if (!hasPossible) {
      piece = text
    } else {
      flag ??= nextFlag(ctx)
      piece = `{% if ${flag} %},{% endif %}${text}`
    }

    if (condition === undefined) {
      output += piece
      hasCertain = true
    } else {
      if (!hasCertain) {
        flag ??= nextFlag(ctx)
        piece += `{% assign ${flag} = true %}`
      }
      output += `{% if ${condition} %}${piece}{% endif %}`
      hasPossible = true
    }
  }

  return flag ? `{% assign ${flag} = false %}${output}` : output
}

function serializeEach(node: EachNode, ctx: Context): string {
  const conditions = node.where ? [node.where] : []
  let item = node.item
  if (isNode(item) && item[NODE] === 'when' && item.otherwise === undefined) {
    conditions.push(item.condition)
    item = item.then
  }

  const setup = node.setup ? `{% liquid\n${dedent(node.setup)}\n%}` : ''
  const itemText = serialize(item, ctx)

  if (!conditions.length) {
    return `[{% for ${node.statement} %}${setup}${itemText}{% unless forloop.last %},{% endunless %}{% endfor %}]`
  }

  // nested rather than joined with `and`, Liquid has no parentheses
  const flag = nextFlag(ctx)
  const open = conditions.map((condition) => `{% if ${condition} %}`).join('')
  const close = '{% endif %}'.repeat(conditions.length)
  return (
    `[{% assign ${flag} = false %}{% for ${node.statement} %}${setup}` +
    `${open}{% if ${flag} %},{% endif %}{% assign ${flag} = true %}${itemText}${close}` +
    '{% endfor %}]'
  )
}

function nextFlag(ctx: Context) {
  ctx.separatorCount += 1
  return `_json_sep_${ctx.separatorCount}`
}

/**
 * JSON for build-time values, made safe to inline: `<` cannot close the script tag,
 * and `{{` / `{%` are not picked up by Liquid.
 */
function escapeStatic(value: string | number | boolean | null) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\{(?=[{%])/g, '\\u007b')
}

function isNode(value: unknown): value is LiquidJsonNode {
  return typeof value === 'object' && value !== null && NODE in value
}
