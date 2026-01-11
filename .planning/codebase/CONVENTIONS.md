# Coding Conventions

**Analysis Date:** 2026-01-11

## Naming Patterns

**Files:**
- PascalCase for Vue components (`ChatPanel.vue`, `DiagramPreview.vue`, `CodeEditor.vue`)
- camelCase for TypeScript files (`diagram.ts`, `constants.ts`, `validator.ts`)
- `use` prefix for composables (`useMermaid.ts`, `useAutoSave.ts`, `useFileOperations.ts`)
- `*.test.ts` for test files (pattern defined, none present)

**Functions:**
- camelCase for all functions (`setContent`, `createTab`, `debouncedSave`)
- No special prefix for async functions
- `handle` prefix for event handlers (`handleSendMessage`, `handleRetry`, `handleStopGeneration`)

**Variables:**
- camelCase for variables (`editorRef`, `lastSaveTime`, `copySuccess`)
- UPPER_SNAKE_CASE for constants (`AUTO_SAVE_DELAY`, `DEFAULT_DIAGRAM_CONTENT`, `AVAILABLE_MODELS`)
- No underscore prefix for private (TypeScript private/protected used instead)

**Types:**
- PascalCase for interfaces, no I prefix (`Diagram`, `AIConfig`, `ChatMessage`)
- PascalCase for type aliases (`DiagramType`, `AIProvider`)
- PascalCase for enums, UPPER_SNAKE_CASE values (`AIProvider.OPENAI`, `DiagramType.CLASS`)
- PascalCase for classes (`AIError`, `AIServiceBase`, `OpenAIService`)

## Code Style

**Formatting:**
- Prettier with `.prettierrc.json`
- 100 character line length (`printWidth: 100`)
- Single quotes for strings (`singleQuote: true`)
- No semicolons (`semi: false`)
- 2 space indentation (Prettier default)

**Linting:**
- No ESLint configured
- TypeScript strict mode via vue-tsc
- Run: `npm run type-check`

## Import Organization

**Order:**
1. Vue/framework imports (`vue`, `vue-router`, `pinia`)
2. External packages (`mermaid`, `codemirror`, `file-saver`)
3. Internal modules with `@/` alias (`@/stores`, `@/types`, `@/services`)
4. Relative imports (`./`, `../`)
5. Type imports (`import type { }`)

**Grouping:**
- No enforced blank lines between groups (not configured)
- Alphabetical sorting not enforced

**Path Aliases:**
- `@/` maps to `src/` (configured in `tsconfig.app.json`)
- Always use `@/` for imports from src directory
- Example: `import { useTabsStore } from '@/stores/tabs'`

## Error Handling

**Patterns:**
- Custom error classes with typed codes (`AIError` with `AIErrorCode`)
- try/catch at component boundaries (ChatPanel)
- Error state in composables (`useMermaid.error`)
- Console.error for development logging

**Error Types:**
- Throw on: invalid API key, network failures, rate limits
- Return null on: file import failures, localStorage parse failures
- Store errors in: reactive refs for UI display

**Error Logging:**
- Console.error with context before user-facing messages
- Include original error when wrapping (`originalError` property)

## Logging

**Framework:**
- Console.log/error only (no logging framework)
- No structured logging

**Patterns:**
- Console.error for errors with context
- Console.log sparingly for debugging
- No production log management

**When:**
- AI API errors
- localStorage parse failures
- Streaming errors

## Comments

**When to Comment:**
- Explain "why" not "what"
- Document complex algorithms and workarounds
- Avoid obvious comments

**JSDoc/TSDoc:**
- Used for store function documentation (`src/stores/tabs.ts`)
- Multi-line comments for complex function behavior
- Not required for all functions

**TODO Comments:**
- Pattern: `// TODO: description` (no username prefix)
- None currently present in codebase

## Function Design

**Size:**
- No strict limit enforced
- ChatPanel has large functions (handleSendMessage ~145 lines) - see CONCERNS.md

**Parameters:**
- Destructure objects in parameter list: `function process({ id, name })`
- Use options object for 4+ parameters
- Type all parameters explicitly

**Return Values:**
- Explicit return types recommended
- Return early for guard clauses
- Async functions return Promise

## Module Design

**Exports:**
- Named exports preferred throughout
- No default exports used
- Barrel exports via `index.ts` in some modules (`src/types/index.ts`, `src/services/ai/index.ts`)

**Barrel Files:**
- `index.ts` re-exports public API
- Used in types, services/ai, services/export

## Vue Component Patterns

**Script Setup:**
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTabsStore } from '@/stores/tabs'

// Props and emits
const props = defineProps<{ tabId: string }>()
const emit = defineEmits<{ close: [] }>()

// Store access
const tabsStore = useTabsStore()

// Reactive state
const isOpen = ref(false)
const derived = computed(() => props.tabId.toUpperCase())

// Watchers
watch(() => props.tabId, (newValue) => { /* ... */ })

// Methods
function handleClick() { /* ... */ }
</script>
```

**Template:**
- Use `v-if` over `v-show` for conditional rendering
- Use `v-for` with `:key` for lists
- Use `@event` shorthand for event handlers
- Use `:prop` shorthand for dynamic props

**Style:**
- Always use `<style scoped>`
- BEM-like class naming (`.code-editor`, `.copy-button`, `.copied`)
- CSS variables for theming: `color: var(--color-text-primary)`

## Pinia Store Patterns

**Composition API Style:**
```typescript
export const useStoreName = defineStore('storeName', () => {
  // State - using refs
  const value = ref<Type>(initialValue)

  // Getters - using computed
  const derived = computed(() => value.value * 2)

  // Actions - regular functions
  function setValue(newValue: Type) {
    value.value = newValue
  }

  return { value, derived, setValue }
})
```

**Naming:**
- Store name: camelCase with `use` prefix and `Store` suffix
- Internal state: camelCase refs
- Getters: camelCase computed
- Actions: camelCase functions

## CSS Variable Patterns

**Usage:**
```css
.my-component {
  color: var(--color-text-primary);
  background: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  transition: var(--transition-fast);
}
```

**Categories:**
- Colors: `--color-*` (background, surface, text, primary, success, etc.)
- Spacing: `--spacing-*` (xs, sm, md, lg, xl)
- Typography: `--font-*`, `--font-size-*`, `--font-weight-*`
- Layout: `--toolbar-height`, `--panel-min-*`
- Borders: `--border-radius-*`, `--border-width`
- Shadows: `--shadow-*`
- Transitions: `--transition-*`
- Z-index: `--z-*`

---

*Convention analysis: 2026-01-11*
*Update when patterns change*
