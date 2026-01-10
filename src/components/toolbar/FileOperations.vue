<script setup lang="ts">
import { ref } from 'vue'
import { useTabsStore } from '@/stores/tabs'
import { usePersistenceStore } from '@/stores/persistence'
import { useLayoutStore } from '@/stores/layout'
import { useFileOperations } from '@/composables/useFileOperations'
import { DiagramType } from '@/types'
import NewDiagramModal from '@/components/diagrams/NewDiagramModal.vue'

const tabsStore = useTabsStore()
const persistenceStore = usePersistenceStore()
const layoutStore = useLayoutStore()
const { exportToMermaid, exportToJSON, importFromFile, openFilePicker } = useFileOperations()

const showNewDiagramModal = ref(false)

function handleNew() {
  // Show modal to select diagram type and template
  showNewDiagramModal.value = true
}

function handleCreateDiagram(type: DiagramType, template: 'blank' | 'example') {
  // Create new tab with selected type and template
  const newTabId = tabsStore.createTab(type, undefined, template)
  tabsStore.switchTab(newTabId)

  showNewDiagramModal.value = false
}

function handleSave() {
  // Save all tabs to localStorage
  persistenceStore.saveToLocalStorage()
}

async function handleOpen() {
  const file = await openFilePicker()
  if (!file) return

  const diagram = await importFromFile(file)
  if (diagram) {
    // Create new tab with imported diagram
    const newTabId = tabsStore.createTabFromDiagram(diagram)
    tabsStore.switchTab(newTabId)

    persistenceStore.addRecentFile({
      id: diagram.id,
      name: diagram.metadata.title,
      lastOpened: new Date(),
    })
  }
}

function handleExportMermaid() {
  // Export active tab only
  const activeTab = tabsStore.activeTab
  if (!activeTab) {
    alert('No active tab to export')
    return
  }
  exportToMermaid(activeTab.diagram)
}

function handleExportJSON() {
  // Export active tab only
  const activeTab = tabsStore.activeTab
  if (!activeTab) {
    alert('No active tab to export')
    return
  }
  exportToJSON(activeTab.diagram)
}

function handleExportPng() {
  // Trigger export via layout store - DiagramPreview watches this
  layoutStore.requestExportPng()
}
</script>

<template>
  <div class="file-operations">
    <button class="toolbar-button" title="New diagram (Ctrl+N)" @click="handleNew">
      📄 New
    </button>

    <button class="toolbar-button" title="Open diagram (Ctrl+O)" @click="handleOpen">
      📂 Open
    </button>

    <button class="toolbar-button" title="Save (Ctrl+S)" @click="handleSave">
      💾 Save
    </button>

    <div class="export-group">
      <button class="toolbar-button" title="Export as .mmd" @click="handleExportMermaid">
        ⬇️ Export .mmd
      </button>

      <button class="toolbar-button" title="Export as .json" @click="handleExportJSON">
        ⬇️ Export .json
      </button>

      <button class="toolbar-button" title="Export as high-quality PNG image" @click="handleExportPng">
        ⬇️ Export .png
      </button>
    </div>

    <!-- New Diagram Modal -->
    <NewDiagramModal
      v-if="showNewDiagramModal"
      @close="showNewDiagramModal = false"
      @create="handleCreateDiagram"
    />
  </div>
</template>

<style scoped>
.file-operations {
  display: flex;
  gap: var(--spacing-sm);
}

.export-group {
  display: flex;
  gap: var(--spacing-xs);
}

.toolbar-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.toolbar-button:hover {
  background-color: var(--color-surface-elevated);
  border-color: var(--color-primary);
}
</style>
