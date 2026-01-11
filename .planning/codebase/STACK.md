# Technology Stack

**Analysis Date:** 2026-01-11

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript - Build scripts, config files (`vite.config.ts` compiles to JS)
- HTML/CSS - Standard web components with CSS custom properties (`src/assets/styles/`)

## Runtime

**Environment:**
- Node.js ^20.19.0 || >=22.12.0 (`package.json` engines field)
- Browser Runtime - Client-side Vue 3 SPA with no backend requirements
- Nginx - Production web server (`Dockerfile`, `docker/nginx.conf`)

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Vue 3.5.26 - UI framework with Composition API (`package.json`)
- Vue Router 4.6.4 - Client-side routing (`src/router/index.ts`)
- Pinia 3.0.4 - State management (`src/stores/`)

**Testing:**
- Not configured - No test framework present

**Build/Dev:**
- Vite 7.3.0 - Build tool with HMR (`vite.config.ts`)
- TypeScript 5.9.3 - Compilation to JavaScript
- vue-tsc 3.2.1 - Vue TypeScript type checking

## Key Dependencies

**Critical:**
- mermaid 11.12.2 - Diagram syntax rendering (`src/composables/useMermaid.ts`)
- codemirror 6.0.2 - Code editor component (`src/components/editor/CodeEditor.vue`)
- splitpanes 4.0.4 - Resizable panel layout (`src/components/layout/EditorLayout.vue`)
- upng-js 2.1.0 - PNG encoding for exports (`src/services/export/chunkedPngExport.ts`)

**Infrastructure:**
- @codemirror/lang-javascript 6.2.4 - JavaScript/Mermaid syntax highlighting
- @codemirror/theme-one-dark 6.1.3 - Dark theme for CodeMirror
- @vueuse/core 14.1.0 - Vue composition utilities (`useDebounceFn`)
- file-saver 2.0.5 - File download functionality (`src/composables/useFileOperations.ts`)

## Configuration

**Environment:**
- No environment variables required
- Configuration via localStorage (AI API keys, layout preferences)
- All settings client-side only

**Build:**
- `vite.config.ts` - Vite configuration with Vue plugins
- `tsconfig.json` - TypeScript compiler options
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node tooling TypeScript config
- `.prettierrc.json` - Code formatting (no semicolons, single quotes, 100 char width)

## Platform Requirements

**Development:**
- Any platform with Node.js (macOS/Linux/Windows)
- No external dependencies

**Production:**
- Docker multi-stage build (Node.js 20-alpine builder + Nginx Alpine runner) - `Dockerfile`
- Docker Compose support - `docker-compose.yml`
- Port 80 (HTTP) exposed by default
- Environment: NODE_ENV=production
- Restart policy: unless-stopped

---

*Stack analysis: 2026-01-11*
*Update after major dependency changes*
