<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { useTabsStore } from '@/stores/tabs'
import { useEditorStore } from '@/stores/editor'
import { useLayoutStore } from '@/stores/layout'

const props = defineProps<{
  tabId: string
}>()

const tabsStore = useTabsStore()
const editorStore = useEditorStore()
const layoutStore = useLayoutStore()

const editorRef = ref<HTMLDivElement | null>(null)
const copySuccess = ref(false)
let editorView: EditorView | null = null
let themeCompartment = new Compartment()

const currentTab = computed(() => tabsStore.getTab(props.tabId))
const diagramContent = computed(() => currentTab.value?.diagram.content ?? '')

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(diagramContent.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

function getThemeExtension() {
  return layoutStore.currentTheme === 'dark' ? oneDark : []
}

onMounted(() => {
  if (!editorRef.value) return

  const startState = EditorState.create({
    doc: diagramContent.value,
    extensions: [
      basicSetup,
      keymap.of([indentWithTab]),
      javascript(),
      themeCompartment.of(getThemeExtension()),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString()
          tabsStore.updateTabContent(props.tabId, content)
        }

        if (update.selectionSet) {
          const selection = update.state.selection.main
          editorStore.setCursorPosition(
            update.state.doc.lineAt(selection.head).number,
            selection.head - update.state.doc.lineAt(selection.head).from
          )
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: `${editorStore.fontSize}px`,
        },
        '.cm-scroller': {
          overflow: 'auto',
          fontFamily: 'var(--font-family-mono)',
        },
        '.cm-content': {
          padding: 'var(--spacing-md)',
        },
      }),
    ],
  })

  editorView = new EditorView({
    state: startState,
    parent: editorRef.value,
  })
})

// Watch for external content changes (e.g., when switching tabs, undo/redo, loading a file)
watch(
  () => diagramContent.value,
  (newContent) => {
    if (!editorView) return
    const currentContent = editorView.state.doc.toString()
    if (currentContent !== newContent) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newContent,
        },
      })
    }
  }
)

// Watch for theme changes and update editor theme
watch(
  () => layoutStore.currentTheme,
  (newTheme) => {
    if (editorView) {
      editorView.dispatch({
        effects: themeCompartment.reconfigure(getThemeExtension())
      })
    }
  }
)

onUnmounted(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})
</script>

<template>
  <div class="code-editor">
    <button class="copy-button" :class="{ copied: copySuccess }" @click="copyToClipboard" title="Copy code">
      <span v-if="!copySuccess">📋 Copy</span>
      <span v-else>✓ Copied!</span>
    </button>
    <div ref="editorRef" class="editor-container"></div>
  </div>
</template>

<style scoped>
.code-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.copy-button {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  z-index: 10;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
}

.copy-button:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.copy-button.copied {
  background-color: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.editor-container {
  flex: 1;
  overflow: hidden;
}

:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-scroller) {
  overflow: auto;
}
</style>
