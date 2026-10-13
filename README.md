# React Liquid Theme

A tool for building Shopify themes using React components.

---

## 📦 Installation

```bash
npm install react-liquid-theme
```

---

## 🚀 Usage

> ⚠️ **Note:** This package only supports ESM (ECMAScript Modules). It will **not** work with CommonJS.

Include this in a definition file (e.g., `src/declarations.d.ts`).

```ts
/// <reference types="react-liquid-theme/declarations" />
```

Then Run this command to generate the Shopify theme files:

```bash
# Generate liquid files from React components
npx react-liquid-theme generate
```

## Setting up an example project

```bash
mkdir my-theme
cd my-theme
npm install react-liquid-theme
npx react-liquid-theme setup

```

### `react-liquid-theme generate` Options

| Option     | Alias | Type    | Default         | Description                                    |
| ---------- | ----- | ------- | --------------- | ---------------------------------------------- |
| `--source` | `-s`  | string  | `src`           | Source directory for React components          |
| `--dist`   | `-d`  | string  | `.react-liquid` | Intermediate JS output dir (add to .gitignore) |
| `--theme`  | `-t`  | string  | `theme`         | Shopify theme output directory                 |
| `--watch`  | `-w`  | boolean | `false`         | Watch mode for development                     |
| `--env`    |       | string  | `.env`          | Environment file                               |
| `--css`    |       | string  | `main.css`      | Output CSS file name                           |
| `--js`     |       | string  | `main.js`       | Output JS file name                            |

---

## 📁 File Types

Use file suffixes to automatically route to Shopify theme folders,
the `.client.extension.ts` files will be compiled to a single `main.js` file in the `assets` directory.

| File Pattern                             | Output Directory  |
| ---------------------------------------- | ----------------- |
| `*.snippet.tsx`                          | `theme/snippets`  |
| `*.section.tsx`                          | `theme/sections`  |
| `*.template.tsx`                         | `theme/templates` |
| `*.{section,template,snippet}.client.ts` | `assets/main.js`  |

---

## 🎨 Style Support

React Liquid Theme supports:

- **CSS**
- **SCSS**
- **CSS/SCSS Modules**

Import styles into React components, and they will be bundled into `main.css` in the `theme/assets` directory.

---

## 🧹 Built-in Components

These React components map to Liquid tags or control flow logic:

| Component          | Description        |
| ------------------ | ------------------ |
| `LiquidAssign`     | `{% assign %}`     |
| `LiquidBreak`      | `{% break %}`      |
| `LiquidCapture`    | `{% capture %}`    |
| `LiquidContinue`   | `{% continue %}`   |
| `LiquidFor`        | `{% for %}`        |
| `LiquidIf`         | `{% if %}`         |
| `LiquidUnless`     | `{% unless %}`     |
| `LiquidStatement`  | `{% liquid %}`     |
| `LiquidExpression` | `{{ expression }}` |
| `LiquidTag`        | Can create any tag |

---

## 🧪 Requirements

- Node.js ^20.19 or ≥ 22.12
- Peer dependencies:
  - react ≥ 19
  - react-dom ≥ 19
  - typescript ≥ 5.8, < 7
  - sass >= 1

---

## 📝 License

MIT
