# Quality Setup Skill

## Purpose

Set up code quality infrastructure for new projects: ESLint, Prettier, Husky, strict TypeScript.

## When to Use

- After `/create` generates a new project
- When upgrading an existing project to strict quality standards

## Setup Steps

### 1. Install Dependencies

```bash
npm install --save-dev \
  eslint \
  @eslint/js \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-security \
  eslint-plugin-sonarjs \
  prettier \
  prettier-plugin-tailwindcss \
  husky \
  lint-staged
```

**Plugins included:**
- `eslint-plugin-security` - Security vulnerability patterns
- `eslint-plugin-sonarjs` - Code smell and complexity detection

### 2. Copy Config Templates

From `tob-claude-internal/.claude/templates/shared/quality/`:

```bash
cp eslint.config.template.js PROJECT/eslint.config.js
cp prettier.config.template.js PROJECT/prettier.config.js
```

### 3. Merge TypeScript Config

Merge `tsconfig.strict.json` settings into project's existing `tsconfig.json`.

### 4. Setup Husky

```bash
cd PROJECT
npx husky init
```

Create `.husky/pre-commit`:
```bash
#!/bin/sh
npx lint-staged
```

### 5. Add Scripts to package.json

```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### 6. Verify Setup

```bash
npm run lint
npm run format:check
npm run typecheck
```

## Quality Gates

After setup, CI should enforce:
- `npm run lint` passes
- `npm run format:check` passes
- `npm run typecheck` passes

## Do Not

- Skip any of the strict TypeScript flags
- Disable security rules without justification
- Allow `any` types (use `unknown` if needed)
