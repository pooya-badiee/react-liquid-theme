// Shopify section schema, see https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema

interface BaseInputSetting {
  id: string
  label: string
  info?: string
  /** Liquid condition, e.g. `{{ section.settings.show_image }}` */
  visible_if?: string
}

interface SettingOption {
  value: string
  label: string
  group?: string
}

export interface CheckboxSetting extends BaseInputSetting {
  type: 'checkbox'
  default?: boolean
}
export interface NumberSetting extends BaseInputSetting {
  type: 'number'
  default?: number
  placeholder?: string
}
export interface RadioSetting extends BaseInputSetting {
  type: 'radio'
  options: Omit<SettingOption, 'group'>[]
  default?: string
}
export interface RangeSetting extends BaseInputSetting {
  type: 'range'
  min: number
  max: number
  step?: number
  unit?: string
  default: number
}
export interface SelectSetting extends BaseInputSetting {
  type: 'select'
  options: SettingOption[]
  default?: string
}
export interface TextSetting extends BaseInputSetting {
  type: 'text' | 'textarea' | 'html' | 'liquid'
  default?: string
  placeholder?: string
}
export interface RichtextSetting extends BaseInputSetting {
  type: 'richtext' | 'inline_richtext'
  default?: string
}
export interface ColorSetting extends BaseInputSetting {
  type: 'color' | 'color_background' | 'color_scheme'
  default?: string
}
export interface FontPickerSetting extends BaseInputSetting {
  type: 'font_picker'
  default: string
}
export interface LinkListSetting extends BaseInputSetting {
  type: 'link_list'
  default?: string
}
export interface TextAlignmentSetting extends BaseInputSetting {
  type: 'text_alignment'
  default?: 'left' | 'center' | 'right'
}
export interface UrlSetting extends BaseInputSetting {
  type: 'url'
  default?: '/collections' | '/collections/all'
}
export interface VideoUrlSetting extends BaseInputSetting {
  type: 'video_url'
  accept: ('youtube' | 'vimeo')[]
  default?: string
  placeholder?: string
}
export interface ResourceSetting extends BaseInputSetting {
  type: 'article' | 'blog' | 'collection' | 'page' | 'product' | 'image_picker' | 'video'
}
export interface ResourceListSetting extends BaseInputSetting {
  type: 'article_list' | 'collection_list' | 'product_list'
  limit?: number
}
export interface MetaobjectSetting extends BaseInputSetting {
  type: 'metaobject'
  metaobject_type: string
}
export interface MetaobjectListSetting extends BaseInputSetting {
  type: 'metaobject_list'
  metaobject_type: string
  limit?: number
}
/** Sidebar settings, only shown in the editor */
export interface SidebarSetting {
  type: 'header' | 'paragraph'
  content: string
  info?: string
  visible_if?: string
}

export type InputSetting =
  | CheckboxSetting
  | NumberSetting
  | RadioSetting
  | RangeSetting
  | SelectSetting
  | TextSetting
  | RichtextSetting
  | ColorSetting
  | FontPickerSetting
  | LinkListSetting
  | TextAlignmentSetting
  | UrlSetting
  | VideoUrlSetting
  | ResourceSetting
  | ResourceListSetting
  | MetaobjectSetting
  | MetaobjectListSetting

export type Setting = InputSetting | SidebarSetting
export type SettingType = Setting['type']

export type SettingValue = string | number | boolean | null | string[]
export type SettingValues = Record<string, SettingValue>

/** `@app`, `@theme`, or the name of a theme block (`blocks/<name>.liquid`) */
export interface BlockReference {
  type: string
  name?: never
  settings?: never
  limit?: never
}
/** A block defined in the section itself */
export interface SectionLocalBlock {
  type: string
  name: string
  limit?: number
  settings?: Setting[]
}
export type SectionBlock = BlockReference | SectionLocalBlock

export interface PresetBlock {
  type: string
  name?: string
  id?: string
  static?: boolean
  settings?: SettingValues
  blocks?: PresetBlock[] | Record<string, PresetBlock>
  block_order?: string[]
}

export interface SchemaPreset {
  name: string
  category?: string
  settings?: SettingValues
  blocks?: PresetBlock[] | Record<string, PresetBlock>
  block_order?: string[]
}

type TemplateName =
  | '*'
  | '404'
  | 'article'
  | 'blog'
  | 'captcha'
  | 'cart'
  | 'collection'
  | 'gift_card'
  | 'index'
  | 'list-collections'
  | 'page'
  | 'password'
  | 'policy'
  | 'product'
  | 'search'
  | `customers/${string}`
  | `metaobject/${string}`

export interface SectionAvailability {
  templates?: TemplateName[]
  groups?: ('*' | 'header' | 'footer' | 'aside' | `custom.${string}`)[]
}

export interface SectionSchema {
  name: string
  tag?: 'article' | 'aside' | 'div' | 'footer' | 'header' | 'section'
  class?: string
  limit?: number
  settings?: Setting[]
  blocks?: SectionBlock[]
  max_blocks?: number
  presets?: SchemaPreset[]
  /** Default content for sections rendered statically with `{% section %}` */
  default?: { settings?: SettingValues; blocks?: { type: string; settings?: SettingValues }[] }
  locales?: Record<string, Record<string, string>>
  enabled_on?: SectionAvailability
  disabled_on?: SectionAvailability
}

/** Schema of a theme block (`*.block.tsx` -> `blocks/<name>.liquid`) */
export interface ThemeBlockSchema {
  name: string
  tag?: SectionSchema['tag'] | null
  class?: string
  settings?: Setting[]
  blocks?: BlockReference[]
  presets?: SchemaPreset[]
}
