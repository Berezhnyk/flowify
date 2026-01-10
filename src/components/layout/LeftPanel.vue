<script setup lang="ts">
import CodeEditor from '@/components/editor/CodeEditor.vue'
import { useLayoutStore } from '@/stores/layout'

const props = defineProps<{
  tabId: string | null
}>()

const layoutStore = useLayoutStore()

function toggleCollapse() {
  layoutStore.toggleCollapsed('leftPanel')
}
</script>

<template>
  <div :class="['panel', 'left-panel', { collapsed: layoutStore.isLeftPanelCollapsed }]">
    <div v-if="!layoutStore.isLeftPanelCollapsed" class="panel-header">
      <span>Code Editor</span>
      <button class="collapse-button" title="Collapse panel" @click="toggleCollapse">
        ◂
      </button>
    </div>
    <div v-if="!layoutStore.isLeftPanelCollapsed" class="panel-content">
      <CodeEditor v-if="tabId" :tabId="tabId" />
      <div v-else class="placeholder">No active tab</div>
    </div>
    <div v-else class="collapsed-bar" @click="toggleCollapse" title="Expand code editor">
      <div class="collapsed-icon">{ }</div>
      <div class="collapsed-label">Code</div>
    </div>
  </div>
</template>

<style scoped>
.left-panel {
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collapse-button {
  padding: 4px 8px;
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.collapse-button:hover {
  background-color: var(--color-surface-elevated);
  color: var(--color-primary);
}

.collapsed-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: var(--spacing-sm) 0;
  gap: var(--spacing-xs);
  height: 100%;
  width: 100%;
  background-color: var(--color-surface);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.collapsed-bar:hover {
  background-color: var(--color-surface-elevated);
}

.collapsed-icon {
  font-size: 18px;
  color: var(--color-text-secondary);
  font-weight: bold;
  line-height: 1;
}

.collapsed-label {
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
