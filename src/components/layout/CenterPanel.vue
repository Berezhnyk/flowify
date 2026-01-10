<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTabsStore } from '@/stores/tabs'
import { useLayoutStore } from '@/stores/layout'
import DiagramPreview from '@/components/diagram/DiagramPreview.vue'

const props = defineProps<{
  tabId: string | null
}>()

const tabsStore = useTabsStore()
const layoutStore = useLayoutStore()

const diagramPreviewRef = ref<InstanceType<typeof DiagramPreview> | null>(null)

const currentTab = computed(() => (props.tabId ? tabsStore.getTab(props.tabId) : null))
const diagramTitle = computed(() => currentTab.value?.diagram.metadata.title ?? 'Untitled')

// Update browser tab title
watch(
  diagramTitle,
  (title) => {
    document.title = `${title} - Flowify`
  },
  { immediate: true }
)

// Zoom state from store
const ZOOM_STEP = 0.1
const MIN_ZOOM = 0.1
const MAX_ZOOM = 3
const copySuccess = ref(false)

const zoomLevel = computed(() => currentTab.value?.viewState.zoom ?? 1)
const panOffset = computed(() => ({
  x: currentTab.value?.viewState.panX ?? 0,
  y: currentTab.value?.viewState.panY ?? 0,
}))

function zoomIn() {
  if (!props.tabId) return
  const newZoom = Math.min(zoomLevel.value + ZOOM_STEP, MAX_ZOOM)
  tabsStore.updateTabViewState(props.tabId, { zoom: newZoom })
}

function zoomOut() {
  if (!props.tabId) return
  const newZoom = Math.max(zoomLevel.value - ZOOM_STEP, MIN_ZOOM)
  tabsStore.updateTabViewState(props.tabId, { zoom: newZoom })
}

function resetView() {
  if (!props.tabId) return
  tabsStore.updateTabViewState(props.tabId, { zoom: 1, panX: 0, panY: 0 })
}

function handleZoom(delta: number) {
  if (!props.tabId) return
  const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel.value + delta))
  tabsStore.updateTabViewState(props.tabId, { zoom: newZoom })
}

function handlePan(offset: { x: number; y: number }) {
  if (!props.tabId) return
  tabsStore.updateTabViewState(props.tabId, { panX: offset.x, panY: offset.y })
}

function copyDiagramAsPng() {
  diagramPreviewRef.value?.copyAsPng()
}

function onCopySuccess() {
  copySuccess.value = true
  setTimeout(() => {
    copySuccess.value = false
  }, 2000)
}

// Calculate right margin based on right panel state
const controlsStyle = computed(() => {
  if (!layoutStore.isRightPanelVisible) {
    return {}
  }

  const rightPanelWidth = layoutStore.isRightPanelCollapsed
    ? 48
    : layoutStore.panelSizes.right.width || 350

  return {
    marginRight: `${rightPanelWidth}px`,
  }
})
</script>

<template>
  <div class="panel center-panel">
    <div class="panel-header">
      <div class="header-controls" :style="controlsStyle">
        <button
          class="control-button copy-button"
          :class="{ copied: copySuccess }"
          @click="copyDiagramAsPng"
          title="Copy diagram as PNG"
        >
          <span v-if="!copySuccess">Copy PNG</span>
          <span v-else>Copied!</span>
        </button>

        <div class="zoom-controls">
          <button
            @click="zoomOut"
            :disabled="zoomLevel <= MIN_ZOOM"
            class="zoom-button"
            title="Zoom out"
          >
            −
          </button>
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
          <button
            @click="zoomIn"
            :disabled="zoomLevel >= MAX_ZOOM"
            class="zoom-button"
            title="Zoom in"
          >
            +
          </button>
          <button @click="resetView" class="zoom-button reset" title="Reset view (zoom & pan)">↻</button>
        </div>
      </div>
    </div>
    <div class="panel-content">
      <DiagramPreview
        v-if="tabId"
        ref="diagramPreviewRef"
        :tabId="tabId"
        :zoomLevel="zoomLevel"
        :panOffset="panOffset"
        @copy-success="onCopySuccess"
        @zoom="handleZoom"
        @pan="handlePan"
      />
      <div v-else class="placeholder">No active tab</div>
    </div>
  </div>
</template>

<style scoped>
.center-panel {
  height: 100%;
  background-color: var(--color-background);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface);
}

.header-controls {
  display: flex;
  gap: var(--spacing-sm);
  transition: margin-right var(--transition-fast);
}

.control-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.control-button:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.copy-button.copied {
  background-color: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: 2px;
}

.zoom-button {
  width: 24px;
  height: 24px;
  padding: 0;
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-button:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}

.zoom-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-button.reset {
  font-size: var(--font-size-md);
}

.zoom-level {
  min-width: 40px;
  text-align: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
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
