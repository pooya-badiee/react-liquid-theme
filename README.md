# React Liquid Theme

A tool for building Shopify themes using React components.

---

## 📦 Installation

```bash
npm install react-liquid-theme
```

---

## 🚀 Usage

```bash
# Generate liquid files from React components
npx react-liquid-theme generate
```

### Options

| Option     | Alias | Type    | Default         | Description                                       |
| ---------- | ----- | ------- | --------------- | ------------------------------------------------- |
| `--source` | `-s`  | string  | `src`           | Source directory for React components             |
| `--dist`   | `-d`  | string  | `.react-liquid` | Intermediate JS output dir (add it to .gitignore) |
| `--theme`  | `-t`  | string  | `theme`         | Shopify theme output directory                    |
| `--watch`  | `-w`  | boolean | `false`         | Watch mode for development                        |

---

## 📁 File Types

Use file suffixes to automatically route to Shopify theme folders:

| File Pattern     | Output Directory  |
| ---------------- | ----------------- |
| `*.snippet.tsx`  | `theme/snippets`  |
| `*.section.tsx`  | `theme/sections`  |
| `*.template.tsx` | `theme/templates` |

---

## 🧹 Built-in Components

These React components map to Liquid tags or control flow logic:

| Component         | Description          |
| ----------------- | -------------------- |
| `LiquidAssign`    | `{% assign %}`       |
| `LiquidBreak`     | `{% break %}`        |
| `LiquidCapture`   | `{% capture %}`      |
| `LiquidContinue`  | `{% continue %}`     |
| `LiquidFor`       | `{% for %}`          |
| `LiquidIf`        | `{% if %}`           |
| `LiquidUnless`    | `{% unless %}`       |
| `LiquidStatement` | `{% liquid %}`       |
| `LiquidTag`       | `can create any tag` |

---

## 🧪 Requirements

- Node.js ≥ 20
- Peer dependencies:
  - react ≥ 19
  - react-dom ≥ 19
  - typescript ≥ 5.8

---

## 📝 License

MIT
