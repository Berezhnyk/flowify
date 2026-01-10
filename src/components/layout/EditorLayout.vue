<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { useLayoutStore } from '@/stores/layout'
import { useTabsStore } from '@/stores/tabs'
import LeftPanel from './LeftPanel.vue'
import CenterPanel from './CenterPanel.vue'
import RightPanel from './RightPanel.vue'
import BottomPanel from './BottomPanel.vue'
import OverlayPanel from './OverlayPanel.vue'

const layoutStore = useLayoutStore()
const tabsStore = useTabsStore()

// Refs for measuring actual container sizes
const verticalSplitpanesRef = ref<any>(null)
const overlayContainerRef = ref<HTMLElement | null>(null)

// Track if initial layout has loaded to prevent saving during initialization
const hasLoadedInitialLayout = ref(false)

// Handle window resize by scaling panel sizes proportionally
function onWindowResize() {
  const container = overlayContainerRef.value
  if (!container) return

  const newWidth = container.clientWidth
  const oldWidth = layoutStore.horizontalContainerWidth

  // Only update if there's a significant change (more than 10px)
  if (oldWidth > 0 && Math.abs(newWidth - oldWidth) > 10) {
    const scale = newWidth / oldWidth

    // Scale panel sizes proportionally
    layoutStore.setPanelSize('left', {
      width: Math.round((layoutStore.panelSizes.left.width || 400) * scale),
    })
    layoutStore.setPanelSize('right', {
      width: Math.round((layoutStore.panelSizes.right.width || 350) * scale),
    })
    layoutStore.setExpandedSize('left', Math.round(layoutStore.expandedSizes.left * scale))
    layoutStore.setExpandedSize('right', Math.round(layoutStore.expandedSizes.right * scale))
  }

  layoutStore.setHorizontalContainerWidth(newWidth)
}

onMounted(() => {
  // Set initial container width after DOM is ready
  setTimeout(() => {
    if (overlayContainerRef.value) {
      layoutStore.setHorizontalContainerWidth(overlayContainerRef.value.clientWidth)
    }
  }, 50)

  // Allow saving after layout fully settles
  setTimeout(() => {
    hasLoadedInitialLayout.value = true
  }, 500)

  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
})

function getSplitpanesHeight(): number {
  if (verticalSplitpanesRef.value?.$el) {
    return verticalSplitpanesRef.value.$el.clientHeight
  }
  const container = document.querySelector('.editor-layout')
  return container ? container.clientHeight : window.innerHeight
}

// Bottom panel (vertical split)
const bottomPanelSize = computed(() => {
  if (!layoutStore.isBottomPanelVisible) return 0

  const pixelHeight = layoutStore.panelSizes.bottom.height || 300
  const splitpanesHeight = getSplitpanesHeight()

  const percentage = (pixelHeight / splitpanesHeight) * 100

  return Math.max(10, Math.min(50, percentage))
})

const topPanelSize = computed(() => {
  return 100 - bottomPanelSize.value
})

// Handle vertical resize (top/bottom)
function onVerticalResize(event: any) {
  // Don't save sizes during initial load
  if (!hasLoadedInitialLayout.value || !event?.panes) {
    return
  }

  const panes = event.panes
  const splitpanesHeight = getSplitpanesHeight()

  if (layoutStore.isBottomPanelVisible && panes[1]) {
    const percentage = panes[1].size
    const pixelHeight = Math.round((percentage / 100) * splitpanesHeight)

    layoutStore.setPanelSize('bottom', { height: pixelHeight })
  }
}

// Handle overlay panel resize
function onLeftResize(width: number) {
  layoutStore.setPanelSize('left', { width })
  layoutStore.setExpandedSize('left', width)
}

function onRightResize(width: number) {
  layoutStore.setPanelSize('right', { width })
  layoutStore.setExpandedSize('right', width)
}
</script>

<template>
  <div class="editor-layout">
    <Splitpanes ref="verticalSplitpanesRef" horizontal @resized="onVerticalResize">
      <Pane :size="topPanelSize" :min-size="30">
        <div ref="overlayContainerRef" class="overlay-container">
          <!-- Center panel - always full width in background -->
          <div class="center-layer">
            <CenterPanel :tabId="tabsStore.activeTabId" />
          </div>

          <!-- Left overlay panel -->
          <OverlayPanel
            v-if="layoutStore.isLeftPanelVisible"
            side="left"
            :width="layoutStore.panelSizes.left.width || 400"
            :is-collapsed="layoutStore.isLeftPanelCollapsed"
            :collapsed-width="48"
            :min-width="200"
            :max-width="600"
            @resize="onLeftResize"
          >
            <LeftPanel :tabId="tabsStore.activeTabId" />
          </OverlayPanel>

          <!-- Right overlay panel -->
          <OverlayPanel
            v-if="layoutStore.isRightPanelVisible"
            side="right"
            :width="layoutStore.panelSizes.right.width || 350"
            :is-collapsed="layoutStore.isRightPanelCollapsed"
            :collapsed-width="48"
            :min-width="200"
            :max-width="500"
            @resize="onRightResize"
          >
            <RightPanel :tabId="tabsStore.activeTabId" />
          </OverlayPanel>
        </div>
      </Pane>
      <Pane v-if="layoutStore.isBottomPanelVisible" :size="bottomPanelSize" :min-size="10">
        <BottomPanel />
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped>
.editor-layout {
  height: 100%;
  overflow: hidden;
}

.overlay-container {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.center-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

:deep(.splitpanes__splitter) {
  background-color: var(--color-divider);
  transition: background-color var(--transition-fast);
  position: relative;
  z-index: 1;
  pointer-events: auto;
  touch-action: none;
}

:deep(.splitpanes__splitter:hover) {
  background-color: var(--color-primary);
}

:deep(.splitpanes--horizontal > .splitpanes__splitter) {
  height: 3px;
  cursor: row-resize;
}

:deep(.splitpanes__pane) {
  position: relative;
  overflow: hidden;
}

/* Prevent text selection during resize */
:deep(.splitpanes--dragging) {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

:deep(.splitpanes--dragging *) {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

:deep(.splitpanes--dragging .splitpanes__splitter) {
  pointer-events: auto;
}
</style>
