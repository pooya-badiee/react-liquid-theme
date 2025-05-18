# React Liquid Theme

A tool for building Shopify themes using React components.

## Installation

```bash
npm install react-liquid-theme
```

## Requirements

- Node.js >= 20
- Peer dependencies:

  - react >= 19
  - react-dom >= 19
  - typescript >= 5.8

## Usage

```bash
# Generate liquid files
npx react-liquid-theme generate
```

### Options

| Option     | Alias | Type      | Default         | Description                                                |
| ---------- | ----- | --------- | --------------- | ---------------------------------------------------------- |
| `--source` | `-s`  | `string`  | `src`           | Source directory containing React components               |
| `--dist`   | `-d`  | `string`  | `.react-liquid` | Directory where compiled JS files for liquid generation go |
| `--theme`  | `-t`  | `string`  | `theme`         | Shopify theme output directory                             |
| `--watch`  | `-w`  | `boolean` | `false`         | Watch for changes and rebuild automatically                |

## File Types

Use specific file extensions to generate different Shopify theme files:

- `src/**/*.snippet.tsx` → `theme/snippets`
- `src/**/*.section.tsx` → `theme/sections`
- `src/**/*.template.tsx` → `theme/templates`

## License

MIT
