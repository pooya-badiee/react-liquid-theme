export const PROCESSABLE_EXTENSIONS = ['snippet', 'template', 'section', 'block', 'layout', 'config', 'locale', 'asset']

/**
 * `<name>.sections.tsx` etc. export `Record<outputName, Component>` as default, one theme file per key.
 * Maps the plural type to the type whose folder the outputs go to.
 */
export const MULTI_OUTPUT_EXTENSIONS: Record<string, string> = {
  snippets: 'snippet',
  sections: 'section',
  blocks: 'block',
  templates: 'template',
}

export const ALL_PROCESSABLE_EXTENSIONS = [...PROCESSABLE_EXTENSIONS, ...Object.keys(MULTI_OUTPUT_EXTENSIONS)]
