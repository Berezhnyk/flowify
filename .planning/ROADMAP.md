# Roadmap: Flowify Codebase Context

## Overview

Add codebase context awareness to Flowify's AI assistant. Users will be able to drag & drop files/folders or paste GitHub URLs, and the AI will analyze the code to generate relevant diagrams. The journey goes from foundation (types/state) through local file handling, then GitHub integration, and finally AI enhancements for smart diagram generation.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Context Foundation** - Types and Pinia store for context state
- [ ] **Phase 2: File Drop Zone** - Drag & drop UI in chat panel
- [ ] **Phase 3: File Reading** - Read file content with encoding detection
- [ ] **Phase 4: Folder Processing** - Recursive folder reading and filtering
- [ ] **Phase 5: Context Display** - Show loaded files with removal controls
- [ ] **Phase 6: GitHub URL Parsing** - Detect and parse GitHub repo URLs
- [ ] **Phase 7: GitHub API** - Fetch public repo contents
- [ ] **Phase 8: AI Context Injection** - Send file context with AI requests
- [ ] **Phase 9: Diagram Suggestion** - AI suggests appropriate diagram type
- [ ] **Phase 10: Token Management** - Handle large contexts with truncation
- [ ] **Phase 11: Conversational Context** - Context persists across chat turns
- [ ] **Phase 12: Polish** - Error handling, loading states, UX refinements

## Phase Details

### Phase 1: Context Foundation
**Goal**: Define TypeScript types and create Pinia store for managing file context state
**Depends on**: Nothing (first phase)
**Research**: Unlikely (internal patterns, TypeScript types)
**Plans**: 1 (01-01-PLAN.md)

### Phase 2: File Drop Zone
**Goal**: Add drag & drop area to chat panel that accepts files
**Depends on**: Phase 1
**Research**: Unlikely (browser File API, existing Vue patterns)
**Plans**: TBD

### Phase 3: File Reading
**Goal**: Read dropped file content, detect text vs binary, handle encoding
**Depends on**: Phase 2
**Research**: Unlikely (File API, TextDecoder standard)
**Plans**: TBD

### Phase 4: Folder Processing
**Goal**: Handle folder drops, recursively read contents, filter by file type
**Depends on**: Phase 3
**Research**: Unlikely (File System Access API patterns)
**Plans**: TBD

### Phase 5: Context Display
**Goal**: Show loaded files in chat UI, allow individual file removal, clear all
**Depends on**: Phase 4
**Research**: Unlikely (Vue component patterns)
**Plans**: TBD

### Phase 6: GitHub URL Parsing
**Goal**: Detect GitHub URLs in chat input, parse repo/branch/path components
**Depends on**: Phase 1
**Research**: Unlikely (URL parsing, regex patterns)
**Plans**: TBD

### Phase 7: GitHub API
**Goal**: Fetch file contents from public GitHub repos via API
**Depends on**: Phase 6
**Research**: Likely (GitHub API rate limits, unauthenticated access patterns)
**Research topics**: GitHub Contents API, rate limits for unauthenticated requests, recursive tree fetching
**Plans**: TBD

### Phase 8: AI Context Injection
**Goal**: Modify AI service to include file context in requests
**Depends on**: Phase 5, Phase 7
**Research**: Unlikely (extending existing AI service patterns)
**Plans**: TBD

### Phase 9: Diagram Suggestion
**Goal**: AI analyzes code context and suggests appropriate Mermaid diagram type
**Depends on**: Phase 8
**Research**: Unlikely (prompt engineering, existing AI patterns)
**Plans**: TBD

### Phase 10: Token Management
**Goal**: Handle large contexts - truncation, smart file selection, token estimation
**Depends on**: Phase 8
**Research**: Likely (token counting methods, context limits per AI model)
**Research topics**: tiktoken or similar for browser, model context window sizes, truncation strategies
**Plans**: TBD

### Phase 11: Conversational Context
**Goal**: File context persists across multiple chat turns within conversation
**Depends on**: Phase 8
**Research**: Unlikely (state management, existing chat patterns)
**Plans**: TBD

### Phase 12: Polish
**Goal**: Error handling, loading states, empty states, edge cases, UX refinements
**Depends on**: All previous phases
**Research**: Unlikely (internal patterns)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Context Foundation | 1/1 | Complete | 2026-01-11 |
| 2. File Drop Zone | 0/TBD | Not started | - |
| 3. File Reading | 0/TBD | Not started | - |
| 4. Folder Processing | 0/TBD | Not started | - |
| 5. Context Display | 0/TBD | Not started | - |
| 6. GitHub URL Parsing | 0/TBD | Not started | - |
| 7. GitHub API | 0/TBD | Not started | - |
| 8. AI Context Injection | 0/TBD | Not started | - |
| 9. Diagram Suggestion | 0/TBD | Not started | - |
| 10. Token Management | 0/TBD | Not started | - |
| 11. Conversational Context | 0/TBD | Not started | - |
| 12. Polish | 0/TBD | Not started | - |
