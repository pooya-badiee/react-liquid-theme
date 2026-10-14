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

| Component             | Description                       |
| --------------------- | --------------------------------- |
| `LiquidAssign`        | `{% assign %}`                    |
| `LiquidBreak`         | `{% break %}`                     |
| `LiquidCapture`       | `{% capture %}`                   |
| `LiquidCase`          | `{% case %}`                      |
| `LiquidWhen`          | `{% when %}`                      |
| `LiquidComment`       | `{% comment %}`                   |
| `LiquidInlineComment` | `{% # comment %}`                 |
| `LiquidContinue`      | `{% continue %}`                  |
| `LiquidCycle`         | `{% cycle %}`                     |
| `LiquidDecrement`     | `{% decrement %}`                 |
| `LiquidEcho`          | `{% echo %}`                      |
| `LiquidFor`           | `{% for %}`                       |
| `LiquidIf`            | `{% if %}`                        |
| `LiquidElseIf`        | `{% elsif %}`                     |
| `LiquidElse`          | `{% else %}`                      |
| `LiquidIncrement`     | `{% increment %}`                 |
| `LiquidRawTag`        | `{% raw %}`                       |
| `LiquidTablerow`      | `{% tablerow %}`                  |
| `LiquidUnless`        | `{% unless %}`                    |
| `LiquidStatement`     | `{% liquid %}`                    |
| `LiquidRender`        | `{% render %}`                    |
| `LiquidExpression`    | `{{ expression }}`                |
| `LiquidRaw`           | Parses a Liquid string into React |
| `LiquidTag`           | Can create any tag                |
| `LiquidJson`          | `<script>` with Liquid-built JSON |
| `LiquidScript`        | `<script>` with Liquid inside     |

---

## 🧾 JSON Scripts

React only allows a single string inside `<script>`, so Liquid components cannot be nested there.
Use `LiquidJson` to build `application/json` or `application/ld+json` scripts from a plain object:

```tsx
import { each, LiquidJson, liquid, when } from 'react-liquid-theme'

<LiquidJson
  type="application/ld+json"
  value={{
    '@type': 'Product',
    name: liquid('product.title'), // {{ product.title | json }}
    availability: when('product.available', 'InStock', 'OutOfStock'),
    sku: when(
      'product.selected_or_first_available_variant.sku != blank',
      liquid('product.selected_or_first_available_variant.sku'),
    ),
    offers: each(
      'variant in product.variants',
      { price: liquid('variant.price | divided_by: 100.0') },
      {
        setup: 'assign is_visible = variant.available',
        where: 'is_visible',
      },
    ),
  }}
/>
```

| Helper                                    | Output                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| plain JS values                           | JSON, escaped at build time                                                  |
| `liquid(expression)`                      | `{{ expression \| json }}`                                                   |
| `when(condition, value)`                  | key or array element only present when `condition` is truthy                 |
| `when(condition, value, otherwise)`       | `value` or `otherwise`                                                       |
| `each(statement, item, { setup, where })` | array from `{% for statement %}`, `where` skips iterations                   |
| `raw(liquid)`                             | inserted as is, for Liquid that already outputs JSON (e.g. a `{% render %}`) |

Commas are handled for you, and `toLiquidJson(value)` returns the same Liquid as a string.

For any other script, use `LiquidScript` with either a string `value` or Liquid component children:

```tsx
<LiquidScript value={`window.product = {{ product | json }}`} />
<LiquidScript value={`window.data = ${toLiquidJson({ id: liquid('product.id') })}`} />
<LiquidScript>
  {'window.ids = ['}
  <LiquidFor statement="p in products">
    <LiquidExpression expression="p.id" />
    <LiquidUnless condition="forloop.last">,</LiquidUnless>
  </LiquidFor>
  {']'}
</LiquidScript>
```

---

## 🤖 AI Assistants

The package ships an AI-oriented guide at `node_modules/react-liquid-theme/llms.txt`.
Point your assistant at it, e.g. in your project's `CLAUDE.md` / `AGENTS.md`:

```md
This project uses react-liquid-theme. Read node_modules/react-liquid-theme/llms.txt before editing src/.
```

---

## 🧪 Requirements

- Node.js ≥ 24
- Peer dependencies:
  - react ≥ 19
  - react-dom ≥ 19
  - typescript ≥ 6, < 7
  - sass >= 1

---

## 📝 License

MIT
