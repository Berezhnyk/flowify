<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTabsStore } from '@/stores/tabs'
import { useLayoutStore } from '@/stores/layout'
import FileOperations from './FileOperations.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import { DIAGRAM_TYPE_LABELS } from '@/utils/constants'

const tabsStore = useTabsStore()
const layoutStore = useLayoutStore()

const diagramTitle = computed(() => tabsStore.activeTab?.diagram.metadata.title ?? 'No Diagram')
const diagramType = computed(() => {
  const activeTab = tabsStore.activeTab
  if (!activeTab) return 'No Type'
  const type = activeTab.diagram.type
  return DIAGRAM_TYPE_LABELS[type] ?? type ?? 'Unknown'
})
const hasUnsavedChanges = computed(() => tabsStore.activeTab?.hasUnsavedChanges ?? false)

const showSettings = ref(false)

function toggleSettings() {
  showSettings.value = !showSettings.value
}
</script>

<template>
  <div class="app-toolbar">
    <div class="toolbar-section toolbar-left">
      <h1 class="app-title">Flowify</h1>
      <div class="diagram-type-badge">
        <span class="type-label">{{ diagramType }}</span>
      </div>
    </div>

    <div class="toolbar-section toolbar-center">
      <div class="diagram-info">
        <span class="diagram-title">{{ diagramTitle }}</span>
        <span v-if="hasUnsavedChanges" class="unsaved-indicator">●</span>
      </div>
    </div>

    <div class="toolbar-section toolbar-right">
      <FileOperations />

      <div class="toolbar-divider"></div>

      <button
        class="toolbar-button"
        title="Settings"
        @click="toggleSettings"
      >
        ⚙️
      </button>

      <button
        class="toolbar-button"
        :title="`Switch to ${layoutStore.currentTheme === 'dark' ? 'light' : 'dark'} theme`"
        @click="layoutStore.toggleTheme()"
      >
        {{ layoutStore.currentTheme === 'dark' ? '☀️' : '🌙' }}
      </button>

      <button
        class="toolbar-button"
        title="Undo (Ctrl+Z)"
        :disabled="!tabsStore.canUndo"
        @click="tabsStore.undoActiveTab()"
      >
        ↶
      </button>

      <button
        class="toolbar-button"
        title="Redo (Ctrl+Y)"
        :disabled="!tabsStore.canRedo"
        @click="tabsStore.redoActiveTab()"
      >
        ↷
      </button>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="settings-modal-overlay" @click="toggleSettings">
      <div class="settings-modal" @click.stop>
        <div class="settings-header">
          <h2>Settings</h2>
          <button class="close-button" @click="toggleSettings">×</button>
        </div>
        <div class="settings-content">
          <SettingsPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-toolbar {
  height: var(--toolbar-height);
  background-color: var(--color-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  gap: var(--spacing-md);
  user-select: none;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.toolbar-left {
  flex: 1;
}

.toolbar-center {
  flex: 1;
  justify-content: center;
}

.toolbar-right {
  flex: 1;
  justify-content: flex-end;
}

.app-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0;
}

.diagram-type-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  display: inline-flex;
  align-items: center;
}

.type-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.diagram-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.diagram-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.unsaved-indicator {
  color: var(--color-warning);
  font-size: 8px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border);
}

.toolbar-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-md);
  transition: all var(--transition-fast);
}

.toolbar-button:hover:not(:disabled) {
  background-color: var(--color-surface-elevated);
  border-color: var(--color-primary);
}

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal {
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.settings-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.close-button {
  width: 32px;
  height: 32px;
  padding: 0;
  background-color: transparent;
  color: var(--color-text-secondary);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: var(--color-error);
  color: white;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}
</style>
