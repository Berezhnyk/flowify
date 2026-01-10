<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTabsStore } from '@/stores/tabs'
import { DiagramType } from '@/types'
import { DIAGRAM_TYPE_LABELS } from '@/utils/constants'

const tabsStore = useTabsStore()
const isOpen = ref(false)

const currentDiagramType = computed(() => tabsStore.activeTab?.diagram.type ?? DiagramType.CLASS)

const diagramTypes = [
  { value: DiagramType.CLASS, label: DIAGRAM_TYPE_LABELS[DiagramType.CLASS] },
  { value: DiagramType.SEQUENCE, label: DIAGRAM_TYPE_LABELS[DiagramType.SEQUENCE] },
  { value: DiagramType.FLOWCHART, label: DIAGRAM_TYPE_LABELS[DiagramType.FLOWCHART] },
  { value: DiagramType.STATE, label: DIAGRAM_TYPE_LABELS[DiagramType.STATE] },
  { value: DiagramType.ER, label: DIAGRAM_TYPE_LABELS[DiagramType.ER] },
  { value: DiagramType.GANTT, label: DIAGRAM_TYPE_LABELS[DiagramType.GANTT] },
  { value: DiagramType.PIE, label: DIAGRAM_TYPE_LABELS[DiagramType.PIE] },
  { value: DiagramType.MINDMAP, label: DIAGRAM_TYPE_LABELS[DiagramType.MINDMAP] },
  { value: DiagramType.TIMELINE, label: DIAGRAM_TYPE_LABELS[DiagramType.TIMELINE] },
  { value: DiagramType.GITGRAPH, label: DIAGRAM_TYPE_LABELS[DiagramType.GITGRAPH] },
]

function selectType(type: DiagramType) {
  if (tabsStore.activeTabId) {
    tabsStore.setTabType(tabsStore.activeTabId, type)
  }
  isOpen.value = false
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="diagram-type-selector">
    <button class="selector-button" @click="toggleDropdown">
      <span>{{ DIAGRAM_TYPE_LABELS[currentDiagramType] }}</span>
      <span class="arrow">▼</span>
    </button>

    <div v-if="isOpen" class="dropdown">
      <button
        v-for="type in diagramTypes"
        :key="type.value"
        class="dropdown-item"
        :class="{ active: type.value === currentDiagramType }"
        @click="selectType(type.value)"
      >
        {{ type.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.diagram-type-selector {
  position: relative;
}

.selector-button {
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.selector-button:hover {
  border-color: var(--color-primary);
}

.arrow {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--spacing-xs);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: var(--z-dropdown);
}

.dropdown-item {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: transparent;
  color: var(--color-text-primary);
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--color-surface);
}

.dropdown-item.active {
  background-color: var(--color-primary);
  color: white;
}

.dropdown-item:first-child {
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
}
</style>
