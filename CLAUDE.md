# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Flowify** is a UML diagram editor built with Vue 3 that supports creating and editing diagrams using Mermaid.js syntax. It features an AI-powered chat assistant that helps users create and modify diagrams using OpenAI, Anthropic, or local AI models.

## Development Commands

```bash
npm run dev          # Start Vite dev server with HMR at http://localhost:5173
npm run build        # Type-check and build for production
npm run build-only   # Build without type checking
npm run type-check   # Run TypeScript type checking with vue-tsc
npm run format       # Format code with Prettier
npm run preview      # Preview production build locally
```

## Application Features

### Core Features
- **Mermaid Diagram Editor**: Real-time diagram rendering with syntax highlighting
- **AI Assistant**: Context-aware chat with OpenAI, Anthropic, or LM Studio integration
- **10 Diagram Types**: Class, Sequence, Flowchart, State, ER, Gantt, Pie, Mind Map, Timeline, Git Graph
- **Theme Support**: Light and dark themes with synchronized editor and diagram rendering
- **Grid Background**: Toggle-able grid with adjustable size (10-100px)
- **Zoom Controls**: Zoom in/out (10%-300%) with mouse wheel (Ctrl+scroll) and buttons
- **Pan Controls**: Click and drag to pan the diagram, reset view button
- **Auto-save**: Automatic localStorage persistence with debounced saves
- **View State Persistence**: Zoom and pan position saved per tab
- **File Operations**: Import/export diagrams as .mmd or .json files
- **Copy to Clipboard**: Export diagrams as high-quality PNG (4x resolution) with background and grid
- **Resizable Panels**: Drag-to-resize layout with 4-panel design
- **Auto-detect Diagram Type**: Automatically updates diagram type when editing code
- **Tab Key Support**: Tab inserts indentation in the code editor (not focus change)

### AI Features
- **Real-time Streaming**: Word-by-word AI responses like ChatGPT
- **Context-Aware**: Sends current diagram code to AI for better suggestions
- **Multi-Provider**: OpenAI, Anthropic, or LM Studio (local models)
- **Model Selection**: Choose specific models per provider
- **Retry Functionality**: Retry failed requests (rate limits, network errors)
- **Clear Conversation**: Clear chat history with confirmation
- **Diagram Suggestions**: AI can suggest Mermaid code in ```mermaid blocks

### Provider Support
- **OpenAI**: gpt-4o, gpt-4o-mini, gpt-3.5-turbo
- **Anthropic**: claude-3-5-sonnet-latest, claude-3-5-haiku-latest, claude-3-opus-latest
- **LM Studio**: Local models via OpenAI-compatible API

## Architecture

### Application Layout

```
┌─────────────────────────────────────────────────────────────┐
│  TOP: Toolbar (Diagram type selector, File operations)     │
├──────────────┬──────────────────┬──────────────────────────┤
│              │                  │                          │
│  LEFT:       │  CENTER:         │  RIGHT:                  │
│  Code Editor │  Diagram Preview │  Properties & Settings   │
│  (CodeMirror)│  (Mermaid.js)    │                          │
│              │  + Zoom Controls │                          │
│              │  + Copy PNG      │                          │
├──────────────┴──────────────────┴──────────────────────────┤
│  BOTTOM: AI Chat Panel (OpenAI/Anthropic/LM Studio)        │
│  + Clear conversation + Retry button                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
src/
├── components/
│   ├── toolbar/
│   │   ├── AppToolbar.vue           # Main toolbar with diagram type badge
│   │   └── FileOperations.vue       # New, Open, Save, Export buttons
│   ├── diagrams/
│   │   └── NewDiagramModal.vue      # Modal for creating new diagrams (10 types)
│   ├── tabs/
│   │   └── DiagramTabs.vue          # Tab bar for multiple diagrams
│   ├── editor/
│   │   └── CodeEditor.vue           # CodeMirror editor with Tab key support
│   ├── diagram/
│   │   └── DiagramPreview.vue       # Mermaid renderer with zoom & export
│   ├── properties/
│   │   └── PropertiesPanel.vue      # Diagram metadata and properties
│   ├── settings/
│   │   ├── SettingsPanel.vue        # Main settings container
│   │   └── AISettingsPanel.vue      # AI provider configuration
│   ├── chat/
│   │   ├── ChatPanel.vue            # AI chat interface with streaming
│   │   ├── ChatMessage.vue          # Individual message display
│   │   └── ChatInput.vue            # Message input with suggestions
│   └── layout/
│       ├── EditorLayout.vue         # Splitpanes 4-panel layout
│       ├── LeftPanel.vue            # Code editor panel
│       ├── CenterPanel.vue          # Diagram preview panel
│       ├── RightPanel.vue           # Properties/settings panel
│       └── BottomPanel.vue          # Chat panel
├── stores/
│   ├── diagram.ts        # Diagram content, type, undo/redo history
│   ├── editor.ts         # Cursor position, selection, font size
│   ├── properties.ts     # Selected elements, diagram settings
│   ├── chat.ts           # Chat messages, typing state
│   ├── ai.ts             # AI provider config, API keys, model selection
│   ├── layout.ts         # Panel visibility, sizes, theme
│   └── persistence.ts    # localStorage save/load, auto-save
├── services/
│   └── ai/
│       ├── base.ts       # Abstract AI service class
│       ├── openai.ts     # OpenAI API integration with streaming
│       ├── anthropic.ts  # Anthropic API integration with streaming
│       ├── lmstudio.ts   # LM Studio local model integration
│       ├── factory.ts    # Service factory pattern
│       └── index.ts      # Service exports
├── composables/
│   ├── useMermaid.ts          # Mermaid initialization and rendering
│   ├── useLocalStorage.ts     # localStorage utilities
│   ├── useFileOperations.ts   # Import/export .mmd and .json
│   └── useAutoSave.ts         # Debounced auto-save (300ms)
├── types/
│   ├── diagram.ts        # DiagramType enum, Diagram interface
│   ├── editor.ts         # EditorState, Position interfaces
│   ├── chat.ts           # ChatMessage, DiagramSuggestion
│   ├── properties.ts     # Property types
│   ├── layout.ts         # Layout, theme types
│   ├── ai.ts             # AI providers, configs, errors, streaming
│   └── index.ts          # Type exports
├── utils/
│   ├── mermaid/
│   │   ├── templates.ts  # Starter templates for each diagram type
│   │   └── validator.ts  # Diagram type detection and validation
│   ├── mockAI.ts         # Mock AI for development (deprecated)
│   └── constants.ts      # App constants, diagram types, labels, templates
└── views/
    └── EditorView.vue    # Main editor view composition
```

### State Management (Pinia Stores)

**tabs.ts**
- Multi-tab support with Map<string, DiagramTab>
- Each tab contains: diagram, history, viewState (zoom/pan), unsavedChanges
- Auto-detect diagram type on content change
- Undo/redo history per tab
- Methods: createTab, closeTab, switchTab, updateTabContent, updateTabViewState

**editor.ts**
- Cursor position and selection
- Font size
- Editor settings

**chat.ts**
- Message history (user, assistant, system)
- Typing indicator state
- Current input text
- Methods: addUserMessage, addAssistantMessage, clearMessages

**ai.ts**
- AI provider selection (OpenAI, Anthropic, LM Studio)
- API keys (stored in localStorage)
- Model selection
- Endpoint URL (for LM Studio)
- Temperature, max tokens
- Configuration validation

**layout.ts**
- Panel visibility (left, right, bottom)
- Panel sizes
- Current theme (light/dark)
- Grid visibility and size
- Methods: togglePanel, toggleTheme, setGridSize

**persistence.ts**
- Auto-save state
- Last saved timestamp
- Recent files list
- Methods: saveToLocalStorage, loadFromLocalStorage, clearLocalStorage

### Composables

**useMermaid.ts**
- Initialize Mermaid with theme config
- Render diagrams with error handling
- Update configuration (theme changes)
- Returns: render, error, isRendering, initialize, updateConfig

**useLocalStorage.ts**
- Generic localStorage wrapper
- Auto-save on data change
- Error handling
- Methods: load, save, remove, enableAutoSave

**useFileOperations.ts**
- Export diagram as .mmd (Mermaid format)
- Export as .json (with metadata)
- Import from .mmd files
- Drag-and-drop support

**useAutoSave.ts**
- Debounced auto-save (300ms)
- Watches diagram content changes
- Saves to localStorage via persistence store

## Tech Stack

### Core
- Vue 3.5.26 (Composition API with `<script setup>`)
- Vite 7.3.0 (build tool with HMR)
- Pinia 3.0.4 (state management)
- Vue Router 4.6.4 (routing)
- TypeScript 5.9.3

### UI & Editor
- CodeMirror 6 (@codemirror/view, @codemirror/state, @codemirror/lang-javascript)
- Mermaid.js (diagram rendering)
- Splitpanes (resizable panels)
- @codemirror/theme-one-dark (dark theme)

### Utilities
- @vueuse/core (useDebounceFn, etc.)
- file-saver (file export)

### Development
- Node.js ^20.19.0 || >=22.12.0
- Prettier (code formatting)
- TypeScript type checking

## Code Patterns

### Vue Components
Always use `<script setup>` syntax with Composition API:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMyStore } from '@/stores/myStore'

const store = useMyStore()
const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <div>{{ count }} × 2 = {{ doubled }}</div>
</template>
```

### Pinia Stores
Use Composition API style (not Options API):
```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  // State
  const count = ref(0)

  // Getters
  const doubled = computed(() => count.value * 2)

  // Actions
  function increment() {
    count.value++
  }

  return { count, doubled, increment }
})
```

### AI Service Pattern
All AI services extend AIServiceBase:
```ts
import { AIServiceBase } from './base'
import type { AIRequest, AIResponse, StreamChunk } from '@/types'

export class MyAIService extends AIServiceBase {
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Non-streaming implementation
  }

  async streamResponse(
    request: AIRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    // Streaming implementation with SSE
  }
}
```

### Path Imports
Always use `@/` alias for imports from `src/`:
```ts
import MyComponent from '@/components/MyComponent.vue'
import { useMyStore } from '@/stores/myStore'
import type { MyType } from '@/types'
```

### CSS Variables
Use CSS custom properties for theming:
```css
.my-component {
  color: var(--color-text-primary);
  background: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  transition: var(--transition-fast);
}
```

## Key Features Implementation

### AI Streaming
AI responses stream word-by-word using Server-Sent Events (SSE):
```ts
await aiService.streamResponse(request, (chunk) => {
  if (!chunk.done) {
    streamedContent += chunk.content
    updateMessage(streamedContent)
  }
})
```

### Diagram Context
Current diagram is sent to AI for context-aware suggestions:
```ts
const context = {
  type: diagramStore.current.type,
  content: diagramStore.diagramContent,
}
```

### Auto-save
Changes are debounced (300ms) and saved to localStorage:
```ts
const saveLayoutSettings = useDebounceFn(() => {
  persistenceStore.saveToLocalStorage()
}, 500)
```

### Theme Switching
Theme changes propagate to all components:
- HTML `data-theme` attribute
- CodeMirror theme compartment
- Mermaid config update
- CSS variables switch

### Zoom & Pan Implementation
CSS transform with translate and scale on diagram container:
```ts
// Zoom: Ctrl + mouse wheel or buttons
// Pan: Click and drag
<div :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }">
```
- View state (zoom, panX, panY) stored per tab in tabs store
- Reset view button resets both zoom and pan

### PNG Export
SVG → Canvas → PNG → Clipboard (4x resolution for quality):
1. Get SVG from Mermaid render
2. Scale SVG 4x with proper viewBox for crisp rendering
3. Draw background + grid on scaled canvas
4. Draw SVG with padding
5. Convert to PNG blob with high quality
6. Copy to clipboard via Clipboard API

## Security Considerations

### API Keys
- Stored in localStorage (client-side only)
- Never sent to our servers
- Only sent to selected AI provider
- Masked in UI (password input type)
- Can be cleared anytime

### Clipboard API
- Requires HTTPS or localhost
- User gesture required
- Alerts shown if not available

### CORS
- LM Studio requires CORS enabled
- Data URLs used for PNG export to avoid tainting canvas

## Common Patterns

### Error Handling
```ts
try {
  await riskyOperation()
} catch (error) {
  if (error instanceof AIError) {
    // Handle specific AI error codes
  }
  console.error('Operation failed:', error)
  // Show user-friendly message
}
```

### Reactive Updates
```ts
watch(
  () => store.someValue,
  (newValue) => {
    // React to changes
  },
  { deep: true } // For objects/arrays
)
```

### Component Communication
```ts
// Parent
<ChildComponent @custom-event="handleEvent" />

// Child
const emit = defineEmits<{
  customEvent: [payload: SomeType]
}>()

emit('customEvent', data)
```

## Development Guidelines

1. **Always use TypeScript types** - Define interfaces in `src/types/`
2. **Keep components focused** - Single responsibility principle
3. **Use composables for reusable logic** - Don't duplicate code
4. **Follow Vue 3 Composition API** - No Options API
5. **Use Pinia for state management** - No direct localStorage access
6. **Handle errors gracefully** - Show user-friendly messages
7. **Test on both themes** - Light and dark mode
8. **Check localStorage persistence** - Verify auto-save works
9. **Validate AI integration** - Test all three providers
10. **Mobile responsive** - Use CSS Grid and Flexbox

## Debugging

### Check Stores
```ts
import { useDiagramStore } from '@/stores/diagram'
const store = useDiagramStore()
console.log(store.current)
```

### Check AI Config
```ts
import { useAIStore } from '@/stores/ai'
const aiStore = useAIStore()
console.log(aiStore.config)
console.log(aiStore.isConfigured)
```

### Check LocalStorage
```ts
localStorage.getItem('flowify-diagram')
localStorage.getItem('flowify-ai-config')
localStorage.getItem('flowify-layout')
```

### Common Issues
- **Zoom not working**: Check CSS transform is applied
- **AI not responding**: Check API key and provider config
- **Copy PNG fails**: Check HTTPS and Clipboard API support
- **Theme not switching**: Check data-theme attribute and CSS variables
- **Grid not visible**: Check grid visibility and CSS custom properties
- **Panel resize broken**: Check Splitpanes configuration and event handlers

## Supported Diagram Types

| Type | Mermaid Syntax | Description |
|------|----------------|-------------|
| Class Diagram | `classDiagram` | OOP class structures and relationships |
| Sequence Diagram | `sequenceDiagram` | Message flows between participants |
| Flowchart | `flowchart TD/LR` | Process flows and decision trees |
| State Diagram | `stateDiagram-v2` | State machines and transitions |
| ER Diagram | `erDiagram` | Database entity relationships |
| Gantt Chart | `gantt` | Project schedules and timelines |
| Pie Chart | `pie` | Data distribution visualization |
| Mind Map | `mindmap` | Hierarchical idea organization |
| Timeline | `timeline` | Chronological events display |
| Git Graph | `gitGraph` | Git branch visualization |

## Future Enhancements

- Export diagrams as SVG files
- Collaborative editing
- Version history
- Custom theme creation
- Keyboard shortcuts customization
- Diagram validation and linting
- Offline mode with service worker
- Mobile app version
