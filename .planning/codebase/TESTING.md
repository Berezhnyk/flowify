# Testing Patterns

**Analysis Date:** 2026-01-11

## Test Framework

**Runner:**
- Not configured - No test framework present
- `tsconfig.node.json` references vitest/cypress/playwright but none installed

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
# No test commands available
# npm test - Not configured
```

## Test File Organization

**Location:**
- Pattern defined: `*.test.ts` alongside source files
- `tsconfig.app.json` excludes `src/**/__tests__/*`
- No test files present in codebase

**Naming:**
- Expected pattern: `{module-name}.test.ts`
- No test files exist

**Structure:**
```
src/
  stores/
    tabs.ts
    tabs.test.ts          # (not present)
  services/
    ai/
      openai.ts
      openai.test.ts      # (not present)
  composables/
    useMermaid.ts
    useMermaid.test.ts    # (not present)
```

## Test Structure

**Suite Organization:**
- Not applicable (no tests)

**Patterns:**
- Not established

## Mocking

**Framework:**
- Not applicable

**Patterns:**
- Not established

**What to Mock:**
- External APIs (OpenAI, Anthropic, LM Studio)
- localStorage
- Mermaid.js rendering
- File API operations

**What NOT to Mock:**
- Pure utility functions
- TypeScript types

## Fixtures and Factories

**Test Data:**
- Not applicable

**Location:**
- Not applicable

## Coverage

**Requirements:**
- No coverage requirements defined
- No coverage tooling configured

**Configuration:**
- Not applicable

**View Coverage:**
```bash
# Not available
```

## Test Types

**Unit Tests:**
- Not present
- Should test: stores, composables, utility functions, service methods

**Integration Tests:**
- Not present
- Should test: component interactions, store/service integration

**E2E Tests:**
- Not present
- Should test: full user flows (diagram creation, AI chat, export)

## Common Patterns

**Async Testing:**
- Not established

**Error Testing:**
- Not established

**Snapshot Testing:**
- Not established

## Recommended Test Framework Setup

If implementing tests, consider:

**Vitest (Recommended):**
```bash
npm install -D vitest @vue/test-utils happy-dom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

**Critical Areas to Test:**
1. `src/stores/tabs.ts` - Tab management, undo/redo, content updates
2. `src/stores/persistence.ts` - localStorage serialization, migration
3. `src/services/ai/*.ts` - API error handling, streaming
4. `src/composables/useMermaid.ts` - Rendering, validation
5. `src/composables/useFileOperations.ts` - Import/export
6. `src/services/export/chunkedPngExport.ts` - PNG generation

**Test Patterns to Follow:**
```typescript
// Example test structure
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTabsStore } from '@/stores/tabs'

describe('TabsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('createTab', () => {
    it('should create a new tab with default content', () => {
      const store = useTabsStore()
      const tabId = store.createTab()

      expect(store.tabs.has(tabId)).toBe(true)
      expect(store.activeTabId).toBe(tabId)
    })

    it('should initialize with empty history', () => {
      const store = useTabsStore()
      const tabId = store.createTab()
      const tab = store.tabs.get(tabId)

      expect(tab?.history.past).toHaveLength(0)
      expect(tab?.history.future).toHaveLength(0)
    })
  })
})
```

---

*Testing analysis: 2026-01-11*
*Update when test patterns change*
