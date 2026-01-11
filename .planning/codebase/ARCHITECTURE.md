# Architecture

**Analysis Date:** 2026-01-11

## Pattern Overview

**Overall:** Single Page Application (SPA) with Layered Architecture

**Key Characteristics:**
- Vue 3 client-side application with Composition API
- Feature-based layered architecture with clear separation of concerns
- No backend - fully client-side with localStorage persistence
- Multi-tab document editing with per-tab state
- Real-time AI streaming integration

## Layers

**Presentation Layer (`src/components/`):**
- Purpose: UI rendering and user interaction
- Contains: Vue components organized by feature domain
- Depends on: Stores, composables, types
- Used by: Views

**State Management Layer (`src/stores/`):**
- Purpose: Centralized reactive state with Pinia
- Contains: tabs, chat, ai, layout, persistence, editor, properties, diagram stores
- Depends on: Types, utils, composables
- Used by: Components, composables

**Service Layer (`src/services/`):**
- Purpose: Business logic and external API integration
- Contains: AI provider integrations, export services
- Depends on: Types
- Used by: Components (ChatPanel)

**Composables Layer (`src/composables/`):**
- Purpose: Reusable Vue 3 composition functions
- Contains: useMermaid, useAutoSave, useFileOperations, useLocalStorage, useResizeHandle
- Depends on: Stores, types
- Used by: Components, views

**Type Layer (`src/types/`):**
- Purpose: TypeScript interface definitions
- Contains: Diagram, AI, Chat, Layout, Editor, Properties, Export types
- Depends on: None (leaf module)
- Used by: All other layers

**Utility Layer (`src/utils/`):**
- Purpose: Constants and helper functions
- Contains: Constants, mermaid templates/validators/examples
- Depends on: Types
- Used by: Stores, components

## Data Flow

**Diagram Editing Flow:**

1. User types in CodeEditor component (`src/components/editor/CodeEditor.vue`)
2. CodeEditor calls `tabsStore.updateTabContent()` (`src/stores/tabs.ts`)
3. Store updates tab content, history, unsavedChanges flag
4. Watchers in EditorView detect changes
5. useAutoSave debounces (300ms) and triggers save (`src/composables/useAutoSave.ts`)
6. persistenceStore serializes to localStorage (`src/stores/persistence.ts`)

**Diagram Rendering Flow:**

1. Tab content changes trigger CenterPanel watch
2. CenterPanel calls `useMermaid.render()` (`src/composables/useMermaid.ts`)
3. Mermaid validates syntax via `validateMermaidSyntax()` (`src/utils/mermaid/validator.ts`)
4. Mermaid generates SVG
5. DiagramPreview displays with zoom/pan controls (`src/components/diagram/DiagramPreview.vue`)

**AI Chat Flow:**

1. User sends message via ChatInput (`src/components/chat/ChatInput.vue`)
2. ChatPanel handles message (`src/components/chat/ChatPanel.vue`)
3. chatStore adds user message (`src/stores/chat.ts`)
4. AIServiceFactory creates provider service (`src/services/ai/factory.ts`)
5. Service streams response via SSE to selected AI provider
6. onChunk callback updates message in real-time
7. Suggestion extracted from mermaid code blocks
8. chatStore adds assistant message with optional suggestion

**State Management:**
- Multi-tab: Map<tabId, DiagramTab> with diagram, history, viewState per tab
- Persistence: Debounced auto-save to localStorage
- Each command execution is independent (stateless between sessions)

## Key Abstractions

**Store:**
- Purpose: Centralized state management with Pinia Composition API
- Examples: `src/stores/tabs.ts`, `src/stores/ai.ts`, `src/stores/chat.ts`
- Pattern: defineStore with refs (state), computed (getters), functions (actions)

**Service:**
- Purpose: Encapsulate external API integration logic
- Examples: `src/services/ai/openai.ts`, `src/services/ai/anthropic.ts`
- Pattern: Abstract base class (AIServiceBase) with provider implementations

**Composable:**
- Purpose: Reusable composition functions with `use` prefix
- Examples: `src/composables/useMermaid.ts`, `src/composables/useAutoSave.ts`
- Pattern: Export function returning reactive state and methods

**DiagramTab:**
- Purpose: Per-tab document state
- Examples: Used in `src/stores/tabs.ts`
- Pattern: Object with diagram, history (undo/redo), viewState (zoom/pan)

## Entry Points

**Application Entry:**
- Location: `src/main.ts`
- Triggers: Browser loads application
- Responsibilities: Create Vue app, initialize Pinia, setup router, mount app

**Root Component:**
- Location: `src/App.vue`
- Triggers: Vue app mount
- Responsibilities: Render RouterView

**Main View:**
- Location: `src/views/EditorView.vue`
- Triggers: Router navigation (single route)
- Responsibilities: Initialize persistence, apply theme, setup auto-save, compose layout

**Router Configuration:**
- Location: `src/router/index.ts`
- Triggers: Application start
- Responsibilities: Single route to EditorView (SPA with minimal routing)

## Error Handling

**Strategy:** Custom error classes with typed error codes, catch at boundaries

**Patterns:**
- AIError class with AIErrorCode enum (`src/types/ai.ts`)
- try/catch at component level (ChatPanel)
- Error state in stores and composables (useMermaid.error)
- Console.error for development logging

**AI Errors:**
- INVALID_API_KEY, NETWORK_ERROR, RATE_LIMIT, INVALID_MODEL, STREAMING_ERROR, TIMEOUT, UNKNOWN

## Cross-Cutting Concerns

**Logging:**
- Console.log/error only (no logging framework)
- Error details logged before user-facing messages

**Validation:**
- Mermaid syntax validation (`src/utils/mermaid/validator.ts`)
- AI config validation in store (`src/stores/ai.ts` isConfigured getter)
- Type-level validation via TypeScript

**Theme Management:**
- Centralized in layout store (`src/stores/layout.ts`)
- Applied via data-theme attribute on HTML
- CSS variables switch between light/dark (`src/assets/styles/variables.css`)
- CodeMirror theme compartment updates
- Mermaid config updates

**Persistence:**
- Centralized in persistence store (`src/stores/persistence.ts`)
- localStorage for all state (tabs, layout, AI config, recent files)
- Migration logic for old data formats
- Debounced auto-save (300ms)

**State Synchronization:**
- Vue 3 reactivity with watchers
- Components auto-update when store state changes
- Tab switching syncs chat store active tab

---

*Architecture analysis: 2026-01-11*
*Update when major patterns change*
