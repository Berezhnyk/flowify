import { ref, onUnmounted } from 'vue'

export interface ResizeHandleOptions {
  side: 'left' | 'right'
  minWidth: number
  maxWidth: number
  onResize: (width: number) => void
  onResizeEnd?: () => void
}

export function useResizeHandle(options: ResizeHandleOptions) {
  const isDragging = ref(false)
  const startX = ref(0)
  const startWidth = ref(0)

  function startResize(event: PointerEvent, currentWidth: number) {
    event.preventDefault()
    isDragging.value = true
    startX.value = event.clientX
    startWidth.value = currentWidth

    // Capture pointer to receive events even when cursor moves outside element
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', stopResize)

    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }

  function onPointerMove(event: PointerEvent) {
    if (!isDragging.value) return

    const deltaX = event.clientX - startX.value

    // For left panel: dragging right increases width
    // For right panel: dragging left increases width
    const newWidth =
      options.side === 'left'
        ? startWidth.value + deltaX
        : startWidth.value - deltaX

    // Clamp to min/max bounds
    const clampedWidth = Math.max(options.minWidth, Math.min(options.maxWidth, newWidth))

    options.onResize(clampedWidth)
  }

  function stopResize() {
    isDragging.value = false

    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', stopResize)

    // Restore normal cursor and text selection
    document.body.style.userSelect = ''
    document.body.style.cursor = ''

    options.onResizeEnd?.()
  }

  // Clean up event listeners on unmount
  onUnmounted(() => {
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', stopResize)
  })

  return {
    isDragging,
    startResize,
  }
}
