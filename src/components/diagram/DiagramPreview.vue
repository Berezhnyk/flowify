<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { saveAs } from 'file-saver'
import { useTabsStore } from '@/stores/tabs'
import { useLayoutStore } from '@/stores/layout'
import { useMermaid } from '@/composables/useMermaid'
import { useDebounceFn } from '@vueuse/core'
import {
  exportChunkedPng,
  needsChunkedExport,
  CLIPBOARD_SIZE_LIMIT,
} from '@/services/export/chunkedPngExport'
import type { ExportProgress, ExportOptions } from '@/types/export'

const props = defineProps<{
  tabId: string
  zoomLevel: number
  panOffset: { x: number; y: number }
}>()

const emit = defineEmits<{
  copySuccess: []
  zoom: [delta: number]
  pan: [offset: { x: number; y: number }]
}>()

// Pan state
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

function handleWheel(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey) {
    // Zoom with Ctrl+wheel
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    emit('zoom', delta)
  }
}

function handleMouseDown(event: MouseEvent) {
  if (event.button === 0) {
    isPanning.value = true
    panStart.value = { x: event.clientX - props.panOffset.x, y: event.clientY - props.panOffset.y }
    event.preventDefault()
  }
}

function handleMouseMove(event: MouseEvent) {
  if (!isPanning.value) return
  emit('pan', {
    x: event.clientX - panStart.value.x,
    y: event.clientY - panStart.value.y,
  })
}

function handleMouseUp() {
  isPanning.value = false
}

const tabsStore = useTabsStore()
const layoutStore = useLayoutStore()
const { render, error, isRendering, initialize, updateConfig } = useMermaid()

const diagramContainer = ref<HTMLDivElement | null>(null)
const hasError = ref(false)
const errorMessage = ref('')

// Export state
const isExporting = ref(false)
const exportProgress = ref<ExportProgress | null>(null)

const currentTab = computed(() => tabsStore.getTab(props.tabId))
const diagramContent = computed(() => currentTab.value?.diagram.content ?? '')

const renderDiagram = useDebounceFn(async () => {
  if (!diagramContainer.value) return

  const success = await render('diagram-preview', diagramContent.value)

  if (!success && error.value) {
    hasError.value = true
    errorMessage.value = error.value.message
  } else {
    hasError.value = false
    errorMessage.value = ''
  }
}, 300)

/**
 * Get export options from the current state
 */
function getExportOptions(): ExportOptions {
  const computedStyle = getComputedStyle(document.querySelector('.diagram-preview')!)
  const gridColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--grid-line-color')
    .trim()

  return {
    scaleFactor: 4,
    padding: 60,
    includeGrid: layoutStore.isGridVisible,
    gridSize: layoutStore.currentGridSize,
    backgroundColor: computedStyle.backgroundColor,
    gridColor,
  }
}

/**
 * Copy diagram to clipboard as PNG, with fallback to file download for large images
 */
async function copyAsPng() {
  if (!diagramContainer.value || isExporting.value) return

  const svgElement = diagramContainer.value.querySelector('svg')
  if (!svgElement) {
    alert('No diagram found to copy')
    return
  }

  isExporting.value = true
  exportProgress.value = null

  try {
    const options = getExportOptions()

    // Export using chunked rendering
    const result = await exportChunkedPng(
      svgElement as SVGSVGElement,
      options,
      (progress) => {
        exportProgress.value = progress
      }
    )

    // Check if clipboard is available
    if (!navigator.clipboard?.write) {
      // Clipboard not available, offer file download
      const shouldDownload = confirm(
        'Clipboard API not available. Would you like to download the image as a file instead?'
      )
      if (shouldDownload) {
        const tabName = currentTab.value?.diagram.metadata?.title || 'diagram'
        saveAs(result.blob, `${tabName}.png`)
      }
      return
    }

    // Check blob size - if too large, offer file download
    if (result.blob.size > CLIPBOARD_SIZE_LIMIT) {
      const sizeMB = Math.round(result.blob.size / (1024 * 1024))
      const shouldDownload = confirm(
        `The image is ${sizeMB}MB, which may be too large for clipboard. ` +
          `Would you like to download it as a file instead?`
      )
      if (shouldDownload) {
        const tabName = currentTab.value?.diagram.metadata?.title || 'diagram'
        saveAs(result.blob, `${tabName}.png`)
        emit('copySuccess')
        return
      }
    }

    // Try to copy to clipboard
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': result.blob,
        }),
      ])
      emit('copySuccess')
    } catch (clipboardErr) {
      // Clipboard write failed, offer file download
      console.warn('Clipboard write failed:', clipboardErr)
      const shouldDownload = confirm(
        'Failed to copy to clipboard. Would you like to download the image as a file instead?'
      )
      if (shouldDownload) {
        const tabName = currentTab.value?.diagram.metadata?.title || 'diagram'
        saveAs(result.blob, `${tabName}.png`)
        emit('copySuccess')
      }
    }
  } catch (err) {
    console.error('Export failed:', err)
    alert(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  } finally {
    isExporting.value = false
    exportProgress.value = null
  }
}

/**
 * Save diagram as PNG file (called from toolbar via store trigger)
 */
async function saveAsPng() {
  if (!diagramContainer.value || isExporting.value) return

  const svgElement = diagramContainer.value.querySelector('svg')
  if (!svgElement) {
    alert('No diagram found to export')
    return
  }

  isExporting.value = true
  exportProgress.value = null

  try {
    const options = getExportOptions()

    // Export using chunked rendering
    const result = await exportChunkedPng(
      svgElement as SVGSVGElement,
      options,
      (progress) => {
        exportProgress.value = progress
      }
    )

    // Save to file
    const tabName = currentTab.value?.diagram.metadata?.title || 'diagram'
    saveAs(result.blob, `${tabName}.png`)
    emit('copySuccess')
  } catch (err) {
    console.error('Export failed:', err)
    alert(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  } finally {
    isExporting.value = false
    exportProgress.value = null
  }
}

// Expose methods to parent
defineExpose({
  copyAsPng,
  saveAsPng,
})

// Watch for export PNG request from toolbar
watch(
  () => layoutStore.exportPngRequested,
  async (requested) => {
    if (requested) {
      layoutStore.clearExportPngRequest()
      await saveAsPng()
    }
  }
)

// Watch for content changes in the current tab
watch(
  () => diagramContent.value,
  () => {
    renderDiagram()
  }
)

// Watch for theme changes and update Mermaid config
watch(
  () => layoutStore.currentTheme,
  (newTheme) => {
    const mermaidTheme = newTheme === 'dark' ? 'dark' : 'default'
    updateConfig({ theme: mermaidTheme })
    // Re-render the diagram with new theme
    renderDiagram()
  }
)

onMounted(async () => {
  const mermaidTheme = layoutStore.currentTheme === 'dark' ? 'dark' : 'default'
  await initialize({ theme: mermaidTheme })
  renderDiagram()
})
</script>

<template>
  <div
    class="diagram-preview"
    :class="{ 'show-grid': layoutStore.isGridVisible, 'is-panning': isPanning }"
    :style="{ '--grid-size': `${layoutStore.currentGridSize}px` }"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div v-if="isRendering" class="loading">
      <div class="spinner"></div>
      <span>Rendering diagram...</span>
    </div>

    <div v-if="hasError" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-text">
        <h3>Diagram Error</h3>
        <p>{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Export progress overlay -->
    <div v-if="isExporting" class="export-overlay">
      <div class="export-progress">
        <div class="progress-spinner"></div>
        <div class="progress-text">
          <span v-if="exportProgress?.phase === 'preparing'">
            Preparing diagram...
          </span>
          <span v-else-if="exportProgress?.phase === 'rendering'">
            Rendering tile {{ exportProgress.currentTile }} of {{ exportProgress.totalTiles }}
          </span>
          <span v-else-if="exportProgress?.phase === 'encoding'">
            Encoding PNG...
          </span>
          <span v-else>
            Exporting...
          </span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${exportProgress?.percentage ?? 0}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div
      ref="diagramContainer"
      id="diagram-preview"
      class="diagram-container"
      :class="{ 'has-error': hasError }"
      :style="{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})` }"
    ></div>
  </div>
</template>

<style scoped>
.diagram-preview {
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  cursor: grab;
  user-select: none;
}

.diagram-preview.is-panning {
  cursor: grabbing;
}

.diagram-preview.show-grid {
  background-image: linear-gradient(var(--grid-line-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line-color) 1px, transparent 1px);
  background-size: var(--grid-size, 20px) var(--grid-size, 20px);
  background-position: -1px -1px;
}

.diagram-container {
  width: 100%;
  height: 100%;
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
}

.diagram-container.has-error {
  opacity: 0.3;
}

.loading {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  position: absolute;
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  display: flex;
  gap: var(--spacing-md);
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  z-index: 10;
}

.error-icon {
  font-size: 24px;
}

.error-text h3 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-error);
  font-size: var(--font-size-md);
}

.error-text p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

:deep(svg) {
  max-width: 100%;
  height: auto;
}

/* Export progress overlay */
.export-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.export-progress {
  background-color: var(--color-surface-elevated);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  min-width: 300px;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.progress-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--spacing-md);
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.progress-text {
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.progress-bar {
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.2s ease-out;
}
</style>
