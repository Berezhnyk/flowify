# Flowify - Codebase Context Feature

## What This Is

Flowify is a UML diagram editor with AI-powered diagram generation. This milestone adds the ability to provide codebase context (files, folders, or GitHub repos) so the AI can analyze code and intelligently generate appropriate diagrams.

## Core Value

AI generates accurate, relevant diagrams by understanding the actual code structure - not just from text descriptions.

## Requirements

### Validated

<!-- Existing capabilities from current codebase -->

- ✓ Mermaid diagram editor with 10 diagram types — existing
- ✓ AI chat with OpenAI, Anthropic, LM Studio support — existing
- ✓ Real-time streaming AI responses — existing
- ✓ Multi-tab document editing with undo/redo — existing
- ✓ Diagram export as PNG with zoom/pan — existing
- ✓ Auto-save to localStorage — existing
- ✓ Light/dark theme support — existing
- ✓ Import/export .mmd and .json files — existing

### Active

<!-- New capabilities for this milestone -->

- [ ] Drag & drop files into chat panel as context
- [ ] Drag & drop folders to include multiple files
- [ ] Paste GitHub repo URL to fetch and analyze public repos
- [ ] AI auto-suggests appropriate diagram type based on code analysis
- [ ] AI responds to follow-up questions about the code context
- [ ] Display file context indicator in chat (what files are loaded)

### Out of Scope

- Private GitHub repo authentication — complexity, security concerns for v1
- Persistent context storage between sessions — keep it simple, context is per-conversation
- Binary file handling — focus on source code files only
- Real-time file watching — static snapshot, not live updates

## Context

**Existing Architecture:**
- Vue 3 SPA with Pinia state management
- AI services in `src/services/ai/` with streaming support
- Chat panel in `src/components/chat/ChatPanel.vue`
- File operations composable exists: `src/composables/useFileOperations.ts`

**Codebase Map:** `.planning/codebase/` contains 7 analysis documents

**Browser APIs Available:**
- File API for drag & drop
- Fetch API for GitHub raw content

## Constraints

- **Offline-first**: Local file drag & drop must work without network. GitHub fetching requires network.
- **Client-side only**: No backend - all processing in browser
- **AI token limits**: Large codebases need smart file selection/truncation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Drag & drop as primary interaction | Matches user expectation, familiar pattern | — Pending |
| GitHub public repos only | Avoids auth complexity for v1 | — Pending |
| AI picks diagram type | Reduces friction, leverages AI intelligence | — Pending |

---
*Last updated: 2026-01-11 after initialization*
