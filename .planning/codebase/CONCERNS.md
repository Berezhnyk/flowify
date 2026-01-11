# Codebase Concerns

**Analysis Date:** 2026-01-11

## Tech Debt

**Duplicate streaming logic in ChatPanel:**
- Issue: `handleSendMessage()` and `handleRetry()` contain ~305 lines of nearly identical code
- Files: `src/components/chat/ChatPanel.vue` (lines 61-206, 209-366)
- Why: Retry functionality added without refactoring
- Impact: Maintenance burden, risk of diverging behavior
- Fix approach: Extract shared logic into `async handleAIStreamRequest(message, isRetry)` helper

**Type assertion abuse in file import:**
- Issue: Using `as any` on diagram type bypasses TypeScript safety
- File: `src/composables/useFileOperations.ts` (line 34)
- Why: Quick implementation, diagram type detection not used
- Impact: All imported .mmd files default to classDiagram regardless of content
- Fix approach: Use `detectDiagramType()` from `src/utils/mermaid/validator.ts`

## Known Bugs

**No critical bugs identified**

The codebase appears stable. Minor issues noted in other sections.

## Security Considerations

**Mermaid security level set to "loose":**
- Risk: Disables security checks, potential script injection via diagram content
- Files: `src/composables/useMermaid.ts` (lines 20, 81)
- Current mitigation: None (loose mode enabled)
- Recommendations: Change to `securityLevel: 'strict'` or `'antiscript'`

**API keys stored in browser localStorage:**
- Risk: Accessible via JavaScript, XSS could leak keys
- File: `src/stores/ai.ts` (lines 87-88)
- Current mitigation: None (client-side storage required for standalone app)
- Recommendations:
  - Add UI warning about localStorage security
  - Document that users should use short-lived tokens when available
  - For production, consider backend proxy pattern

**Unvalidated LM Studio endpoint URL:**
- Risk: Malicious endpoint could be used for credential harvesting
- File: `src/stores/ai.ts` (lines 125-127)
- Current mitigation: None
- Recommendations: Add URL validation (HTTPS, expected domains)

**Potential XSS via innerHTML:**
- Risk: SVG set directly without sanitization
- File: `src/composables/useMermaid.ts` (line 61)
- Current mitigation: Mermaid is trusted source
- Recommendations: Consider DOMPurify if user content flows to diagrams

## Performance Bottlenecks

**Deep watch on large object:**
- Problem: Watching `tabsStore.tabs` with `deep: true` triggers on any nested change
- File: `src/composables/useAutoSave.ts` (lines 57-65)
- Measurement: Not profiled, but each keystroke triggers deep comparison
- Cause: Full object comparison on every content change
- Improvement path: Watch specific properties or implement change tracking at editor level

**Unbounded history growth:**
- Problem: History limited to 50 past entries per tab, but future array unlimited
- File: `src/stores/tabs.ts` (line 199)
- Measurement: Memory grows with redo operations
- Cause: Only past array is limited
- Improvement path: Also limit future array, consider total memory across tabs

## Fragile Areas

**localStorage persistence migration:**
- File: `src/stores/persistence.ts` (lines 133-148, 156-196)
- Why fragile: Complex migration logic from old format to new tab-based format
- Common failures: Data structure changes could break migration
- Safe modification: Add comprehensive tests before changing migration logic
- Test coverage: No tests

**AI streaming response parsing:**
- Files: `src/services/ai/openai.ts`, `src/services/ai/anthropic.ts`, `src/services/ai/lmstudio.ts`
- Why fragile: SSE parsing with JSON.parse in loop, silent failures
- Common failures: Malformed SSE data silently lost
- Safe modification: Add accumulated error tracking
- Test coverage: No tests

## Scaling Limits

**localStorage size:**
- Current capacity: Browser limits (typically 5-10MB)
- Limit: Large diagrams + many tabs could exceed limit
- Symptoms at limit: Silent save failures
- Scaling path: Add size checking before save, warn users near limit

## Dependencies at Risk

**No high-risk dependencies identified**

All dependencies are current versions with active maintenance:
- Vue 3.5.26, Vite 7.3.0, TypeScript 5.9.3, Mermaid 11.12.2

## Missing Critical Features

**No test framework:**
- Problem: No unit, integration, or E2E tests
- Current workaround: Manual testing only
- Blocks: Safe refactoring, regression detection
- Implementation complexity: Medium (Vitest setup, initial test suite)

## Test Coverage Gaps

**All code untested:**
- What's not tested: Entire codebase
- Risk: Regressions undetected, refactoring unsafe
- Priority: High
- Difficulty to test: Medium - need to setup Vitest, mock localStorage/APIs

**Critical paths needing tests:**
- `src/stores/tabs.ts` - Tab lifecycle, undo/redo
- `src/stores/persistence.ts` - Migration, serialization
- `src/services/ai/*.ts` - Error handling, streaming
- `src/services/export/chunkedPngExport.ts` - PNG generation

## Data Validation

**Missing JSON schema validation:**
- What's missing: Schema validation after JSON.parse from localStorage
- Files: `src/stores/persistence.ts` (lines 104, 137, 154, 243)
- Risk: Corrupted localStorage could crash application
- Priority: Medium
- Fix approach: Add Zod or custom validators after parsing

**Missing config bounds checking:**
- What's missing: Temperature and maxTokens not validated
- File: `src/stores/ai.ts`
- Risk: Invalid values could cause API errors
- Priority: Low
- Fix approach: Add range validation in setters

## Documentation Gaps

**Complex export logic undocumented:**
- What's missing: Comments explaining tile-based export algorithm
- File: `src/services/export/chunkedPngExport.ts`
- Risk: Future developers may break optimization logic
- Priority: Low
- Fix approach: Add detailed comments on browser canvas limits

**Migration logic undocumented:**
- What's missing: Version history and migration path documentation
- File: `src/stores/persistence.ts`
- Risk: Future migrations may break backward compatibility
- Priority: Low
- Fix approach: Add clear comments about format versions

---

## Summary by Priority

| Priority | Issue | File |
|----------|-------|------|
| **HIGH** | No test framework | Entire codebase |
| **HIGH** | Mermaid securityLevel "loose" | `src/composables/useMermaid.ts` |
| **HIGH** | Duplicate streaming code (~305 lines) | `src/components/chat/ChatPanel.vue` |
| **MEDIUM** | Missing JSON schema validation | `src/stores/persistence.ts` |
| **MEDIUM** | Deep watch performance | `src/composables/useAutoSave.ts` |
| **MEDIUM** | Type assertion with `as any` | `src/composables/useFileOperations.ts` |
| **LOW** | Undocumented export algorithm | `src/services/export/chunkedPngExport.ts` |
| **LOW** | Missing config bounds checking | `src/stores/ai.ts` |

## Positive Findings

- No TODO/FIXME/HACK comments indicating abandoned work
- Consistent error handling patterns with custom AIError class
- Good separation of concerns with stores, services, and composables
- Proper TypeScript usage throughout (except noted exceptions)
- All dependencies current with no known vulnerabilities
- Well-structured codebase overall

---

*Concerns audit: 2026-01-11*
*Update as issues are fixed or new ones discovered*
