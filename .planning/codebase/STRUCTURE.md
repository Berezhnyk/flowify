# Codebase Structure

**Analysis Date:** 2026-01-11

## Directory Layout

```
flowify/
├── .claude/              # Claude Code configuration
├── .github/              # GitHub Actions workflows
├── .planning/            # Planning documents (GSD workflow)
│   └── codebase/        # Codebase analysis documents
├── .vscode/             # VS Code settings
├── docker/              # Docker configuration files
├── docs/                # Documentation assets (screenshots)
├── public/              # Static assets (favicon, etc.)
├── src/                 # Application source code
│   ├── assets/         # Styles and static assets
│   ├── components/     # Vue components by feature
│   ├── composables/    # Reusable composition functions
│   ├── router/         # Vue Router configuration
│   ├── services/       # Business logic and API services
│   ├── stores/         # Pinia state management
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions and constants
│   └── views/          # Page-level view components
├── Dockerfile           # Docker build configuration
├── docker-compose.yml   # Docker Compose services
├── package.json         # Project manifest
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build configuration
```

## Directory Purposes

**src/assets/**
- Purpose: Global styles and static assets
- Contains: CSS files with custom properties for theming
- Key files: `styles/variables.css`, `styles/base.css`, `styles/layout.css`
- Subdirectories: `styles/` for CSS

**src/components/**
- Purpose: Vue components organized by feature domain
- Contains: `.vue` files using Composition API
- Key files: See feature directories below
- Subdirectories: toolbar, layout, editor, diagram, chat, tabs, diagrams, properties, settings

**src/components/toolbar/**
- Purpose: App toolbar UI components
- Contains: `AppToolbar.vue`, `DiagramTypeSelector.vue`, `FileOperations.vue`

**src/components/layout/**
- Purpose: Layout composition and panel management
- Contains: `EditorLayout.vue`, `LeftPanel.vue`, `CenterPanel.vue`, `RightPanel.vue`, `BottomPanel.vue`, `OverlayPanel.vue`

**src/components/editor/**
- Purpose: Code editing functionality
- Contains: `CodeEditor.vue` (CodeMirror integration)

**src/components/diagram/**
- Purpose: Diagram rendering and export
- Contains: `DiagramPreview.vue` (Mermaid renderer with zoom/pan/export)

**src/components/chat/**
- Purpose: AI chat interface
- Contains: `ChatPanel.vue`, `ChatMessage.vue`, `ChatInput.vue`

**src/components/tabs/**
- Purpose: Multi-tab document management
- Contains: `DiagramTabs.vue`

**src/components/diagrams/**
- Purpose: Diagram creation modals
- Contains: `NewDiagramModal.vue`

**src/components/properties/**
- Purpose: Diagram metadata editing
- Contains: `PropertiesPanel.vue`, `PropertyGroup.vue`, `PropertyField.vue`

**src/components/settings/**
- Purpose: Application settings UI
- Contains: `SettingsPanel.vue`, `AISettingsPanel.vue`

**src/composables/**
- Purpose: Reusable Vue 3 composition functions
- Contains: `use*.ts` files
- Key files: `useMermaid.ts`, `useAutoSave.ts`, `useFileOperations.ts`, `useLocalStorage.ts`, `useResizeHandle.ts`

**src/router/**
- Purpose: Vue Router configuration
- Contains: `index.ts` (single route to EditorView)

**src/services/**
- Purpose: Business logic and external API integration
- Contains: Service classes and utilities
- Key files: See subdirectories
- Subdirectories: `ai/`, `export/`

**src/services/ai/**
- Purpose: AI provider integrations
- Contains: `base.ts`, `factory.ts`, `openai.ts`, `anthropic.ts`, `lmstudio.ts`, `index.ts`

**src/services/export/**
- Purpose: Diagram export functionality
- Contains: `chunkedPngExport.ts`, `index.ts`

**src/stores/**
- Purpose: Pinia state management stores
- Contains: `*.ts` files using Composition API pattern
- Key files: `tabs.ts`, `chat.ts`, `ai.ts`, `layout.ts`, `persistence.ts`, `editor.ts`, `properties.ts`, `diagram.ts`

**src/types/**
- Purpose: TypeScript type definitions
- Contains: Interface and enum definitions
- Key files: `diagram.ts`, `ai.ts`, `chat.ts`, `layout.ts`, `editor.ts`, `properties.ts`, `export.ts`, `index.ts`, `upng.d.ts`

**src/utils/**
- Purpose: Utility functions and constants
- Contains: Helper functions and configuration
- Key files: `constants.ts`
- Subdirectories: `mermaid/`

**src/utils/mermaid/**
- Purpose: Mermaid-specific utilities
- Contains: `templates.ts`, `validator.ts`, `examples.ts`

**src/views/**
- Purpose: Page-level view components
- Contains: `EditorView.vue` (main and only view)

## Key File Locations

**Entry Points:**
- `src/main.ts` - Application bootstrap, Pinia/Router setup
- `src/App.vue` - Root component with RouterView
- `src/views/EditorView.vue` - Main editor view composition

**Configuration:**
- `vite.config.ts` - Vite build configuration with Vue plugins
- `tsconfig.json` - TypeScript base configuration
- `tsconfig.app.json` - App-specific TypeScript config
- `.prettierrc.json` - Prettier formatting (no semicolons, single quotes)
- `package.json` - Dependencies and scripts

**Core Logic:**
- `src/stores/tabs.ts` - Multi-tab document management (main state)
- `src/stores/persistence.ts` - localStorage save/load with migration
- `src/services/ai/` - AI provider integrations
- `src/composables/useMermaid.ts` - Mermaid initialization and rendering

**Testing:**
- Not configured (no test files present)

**Documentation:**
- `README.md` - User-facing installation and usage guide
- `CLAUDE.md` - Instructions for Claude Code
- `CONTRIBUTING.md` - Contribution guidelines
- `AGENTS.md` - AI agent configuration

## Naming Conventions

**Files:**
- PascalCase.vue - Vue components (e.g., `ChatPanel.vue`, `DiagramPreview.vue`)
- camelCase.ts - TypeScript files (e.g., `tabs.ts`, `constants.ts`)
- use*.ts - Composables (e.g., `useMermaid.ts`, `useAutoSave.ts`)
- *.test.ts - Test files (pattern defined, none present)

**Directories:**
- kebab-case - All directories (e.g., `services/ai/`, `utils/mermaid/`)
- Plural for collections - `components/`, `stores/`, `services/`, `types/`
- Feature-based - Component directories by domain

**Special Patterns:**
- index.ts - Barrel exports for modules
- *.d.ts - Type declaration files (e.g., `upng.d.ts`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/components/{feature}/` or `src/services/{feature}/`
- State: `src/stores/{feature}.ts`
- Types: `src/types/{feature}.ts`
- Tests: `src/components/{feature}/__tests__/` or `src/{feature}/*.test.ts`

**New Component:**
- Implementation: `src/components/{domain}/{ComponentName}.vue`
- Types: `src/types/{domain}.ts` (add to existing or create new)
- Styles: Scoped within component or `src/assets/styles/`

**New AI Provider:**
- Implementation: `src/services/ai/{provider}.ts`
- Factory update: `src/services/ai/factory.ts`
- Types: Add to `src/types/ai.ts` (AIProvider enum, model definitions)
- Store update: `src/stores/ai.ts` (AVAILABLE_MODELS)

**New Store:**
- Implementation: `src/stores/{name}.ts`
- Export: Add to any barrel files if needed

**Utilities:**
- Shared helpers: `src/utils/{name}.ts`
- Type definitions: `src/types/{name}.ts`
- Composables: `src/composables/use{Name}.ts`

## Special Directories

**docker/**
- Purpose: Docker deployment configuration
- Contains: `nginx.conf` for production web server
- Committed: Yes

**.planning/**
- Purpose: GSD workflow planning documents
- Contains: Codebase analysis, project planning
- Committed: Yes (planning artifacts)

**.github/workflows/**
- Purpose: CI/CD automation
- Contains: Build and deploy workflows
- Committed: Yes

**dist/** (generated)
- Purpose: Production build output
- Source: Generated by `npm run build`
- Committed: No (in .gitignore)

**node_modules/** (generated)
- Purpose: Installed dependencies
- Source: Generated by `npm install`
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-01-11*
*Update when directory structure changes*
