<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTabsStore } from '@/stores/tabs'
import { DiagramType } from '@/types'
import NewDiagramModal from '@/components/diagrams/NewDiagramModal.vue'

const tabsStore = useTabsStore()
const showNewDiagramModal = ref(false)

function handleSwitchTab(tabId: string) {
  tabsStore.switchTab(tabId)
}

function handleCloseTab(event: Event, tabId: string) {
  event.stopPropagation()

  const tab = tabsStore.getTab(tabId)
  if (!tab) return

  // Show confirmation if tab has unsaved changes
  if (tab.hasUnsavedChanges) {
    const confirmed = confirm(
      `"${tab.diagram.metadata.title}" has unsaved changes. Close anyway?`
    )
    if (!confirmed) return
  }

  tabsStore.closeTab(tabId)
}

function handleNewTab() {
  showNewDiagramModal.value = true
}

function handleCreateDiagram(type: DiagramType, template: 'blank' | 'example') {
  const newTabId = tabsStore.createTab(type, undefined, template)
  tabsStore.switchTab(newTabId)
  showNewDiagramModal.value = false
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl+T - New tab
  if (event.ctrlKey && event.key === 't') {
    event.preventDefault()
    handleNewTab()
  }

  // Ctrl+W - Close active tab
  if (event.ctrlKey && event.key === 'w') {
    event.preventDefault()
    if (tabsStore.activeTabId) {
      handleCloseTab(event, tabsStore.activeTabId)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="diagram-tabs">
    <div class="tabs-container">
      <div
        v-for="tab in tabsStore.allTabs"
        :key="tab.id"
        :class="{
          'tab-button': true,
          active: tab.id === tabsStore.activeTabId,
          unsaved: tab.hasUnsavedChanges,
        }"
        :title="tab.diagram.metadata.title"
        role="tab"
        tabindex="0"
        @click="handleSwitchTab(tab.id)"
        @keydown.enter="handleSwitchTab(tab.id)"
        @keydown.space.prevent="handleSwitchTab(tab.id)"
      >
        <span class="tab-title">{{ tab.diagram.metadata.title }}</span>
        <span v-if="tab.hasUnsavedChanges" class="unsaved-indicator">●</span>
        <button
          class="close-button"
          :title="tab.hasUnsavedChanges ? 'Unsaved changes - click to close' : 'Close tab'"
          @click="handleCloseTab($event, tab.id)"
        >
          ×
        </button>
      </div>
    </div>

    <button class="new-tab-button" title="New tab (Ctrl+T)" @click="handleNewTab">+</button>

    <!-- New Diagram Modal -->
    <NewDiagramModal
      v-if="showNewDiagramModal"
      @close="showNewDiagramModal = false"
      @create="handleCreateDiagram"
    />
  </div>
</template>

<style scoped>
.diagram-tabs {
  display: flex;
  align-items: center;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  height: 40px;
  flex-shrink: 0;
  overflow: hidden;
}

.tabs-container {
  flex: 1;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 2px;
  padding: 0 var(--spacing-xs);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.tabs-container::-webkit-scrollbar {
  height: 4px;
}

.tabs-container::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-container::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 2px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  color: var(--color-text-secondary);
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  min-width: 120px;
  max-width: 200px;
  height: 100%;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-button:hover {
  background-color: var(--color-surface-elevated);
  color: var(--color-text-primary);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background-color: var(--color-background);
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.unsaved-indicator {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  line-height: 1;
  flex-shrink: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background-color: transparent;
  color: var(--color-text-secondary);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  opacity: 0;
}

.tab-button:hover .close-button,
.tab-button.active .close-button {
  opacity: 1;
}

.close-button:hover {
  background-color: var(--color-error);
  color: white;
}

.new-tab-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 0 var(--spacing-xs);
  padding: 0;
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.new-tab-button:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
