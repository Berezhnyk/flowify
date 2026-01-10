<script setup lang="ts">
import { computed } from 'vue'
import { useResizeHandle } from '@/composables/useResizeHandle'

const props = withDefaults(
  defineProps<{
    side: 'left' | 'right'
    width: number
    isCollapsed: boolean
    collapsedWidth?: number
    minWidth?: number
    maxWidth?: number
  }>(),
  {
    collapsedWidth: 48,
    minWidth: 200,
    maxWidth: 600,
  }
)

const emit = defineEmits<{
  resize: [width: number]
  resizeEnd: []
}>()

const { isDragging, startResize } = useResizeHandle({
  side: props.side,
  minWidth: props.minWidth,
  maxWidth: props.maxWidth,
  onResize: (width) => emit('resize', width),
  onResizeEnd: () => emit('resizeEnd'),
})

const panelStyle = computed(() => ({
  width: props.isCollapsed ? `${props.collapsedWidth}px` : `${props.width}px`,
}))

function onResizeHandlePointerDown(event: PointerEvent) {
  startResize(event, props.width)
}
</script>

<template>
  <div
    class="overlay-panel"
    :class="[side, { collapsed: isCollapsed, dragging: isDragging }]"
    :style="panelStyle"
  >
    <div class="panel-content">
      <slot />
    </div>
    <div
      v-if="!isCollapsed"
      class="resize-handle"
      @pointerdown="onResizeHandlePointerDown"
    />
  </div>
</template>

<style scoped>
.overlay-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: var(--z-overlay-panel, 10);
  background: var(--color-surface);
  box-shadow: var(--shadow-overlay);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.overlay-panel:not(.dragging) {
  transition: width var(--transition-fast);
}

.overlay-panel.left {
  left: 0;
  border-right: 1px solid var(--color-border);
}

.overlay-panel.right {
  right: 0;
  border-left: 1px solid var(--color-border);
}

.overlay-panel.collapsed {
  box-shadow: none;
}

.panel-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: var(--z-resize-handle, 11);
  background: transparent;
  transition: background-color var(--transition-fast);
}

.resize-handle:hover,
.overlay-panel.dragging .resize-handle {
  background-color: var(--color-primary);
}

.overlay-panel.left .resize-handle {
  right: -3px;
}

.overlay-panel.right .resize-handle {
  left: -3px;
}
</style>
