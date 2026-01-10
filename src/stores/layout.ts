import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PanelSizes, PanelVisibility, PanelCollapsed, PanelExpandedSizes } from '@/types'

export const useLayoutStore = defineStore('layout', () => {
  // Store pixel widths (not percentages)
  const panelSizes = ref<PanelSizes>({
    left: { width: 400 },
    right: { width: 350 },
    bottom: { height: 300 },
  })

  // Store expanded pixel widths for restoring when panels expand
  const expandedSizes = ref<PanelExpandedSizes>({
    left: 400,
    right: 350,
  })

  const visibility = ref<PanelVisibility>({
    toolbar: true,
    leftPanel: true,
    centerPanel: true,
    rightPanel: true,
    bottomPanel: true,
  })

  const collapsed = ref<PanelCollapsed>({
    leftPanel: false,
    rightPanel: false,
  })

  const theme = ref<'light' | 'dark'>('dark')
  const showGrid = ref(true)
  const gridSize = ref(20) // Grid size in pixels

  // Export PNG trigger (for toolbar to communicate with DiagramPreview)
  const exportPngRequested = ref(false)

  // Store horizontal container width for deterministic percentage calculations
  const horizontalContainerWidth = ref<number>(window.innerWidth)

  // Getters
  const isLeftPanelVisible = computed(() => visibility.value.leftPanel)
  const isRightPanelVisible = computed(() => visibility.value.rightPanel)
  const isBottomPanelVisible = computed(() => visibility.value.bottomPanel)
  const isLeftPanelCollapsed = computed(() => collapsed.value.leftPanel)
  const isRightPanelCollapsed = computed(() => collapsed.value.rightPanel)
  const currentTheme = computed(() => theme.value)
  const isGridVisible = computed(() => showGrid.value)
  const currentGridSize = computed(() => gridSize.value)

  // Actions
  function setPanelSize(panel: keyof PanelSizes, size: { width?: number; height?: number }) {
    panelSizes.value[panel] = {
      ...panelSizes.value[panel],
      ...size,
    }
  }

  function setExpandedSize(panel: 'left' | 'right', width: number) {
    expandedSizes.value[panel] = width
  }

  function togglePanel(panel: keyof PanelVisibility) {
    visibility.value[panel] = !visibility.value[panel]
  }

  function showPanel(panel: keyof PanelVisibility) {
    visibility.value[panel] = true
  }

  function hidePanel(panel: keyof PanelVisibility) {
    visibility.value[panel] = false
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  function toggleGrid() {
    showGrid.value = !showGrid.value
  }

  function setGridVisible(visible: boolean) {
    showGrid.value = visible
  }

  function setGridSize(size: number) {
    gridSize.value = Math.max(10, Math.min(100, size)) // Clamp between 10 and 100
  }

  function setHorizontalContainerWidth(width: number) {
    horizontalContainerWidth.value = width
  }

  function toggleCollapsed(panel: keyof PanelCollapsed) {
    collapsed.value[panel] = !collapsed.value[panel]
  }

  function setCollapsed(panel: keyof PanelCollapsed, isCollapsed: boolean) {
    collapsed.value[panel] = isCollapsed

    // If expanding, restore the expanded size
    if (!isCollapsed) {
      const panelKey = panel === 'leftPanel' ? 'left' : 'right'
      setPanelSize(panelKey, { width: expandedSizes.value[panelKey] })
    }
  }

  function resetLayout() {
    panelSizes.value = {
      left: { width: 400 },
      right: { width: 350 },
      bottom: { height: 300 },
    }

    expandedSizes.value = {
      left: 400,
      right: 350,
    }

    visibility.value = {
      toolbar: true,
      leftPanel: true,
      centerPanel: true,
      rightPanel: true,
      bottomPanel: true,
    }

    collapsed.value = {
      leftPanel: false,
      rightPanel: false,
    }
  }

  function requestExportPng() {
    exportPngRequested.value = true
  }

  function clearExportPngRequest() {
    exportPngRequested.value = false
  }

  return {
    // State
    panelSizes,
    expandedSizes,
    visibility,
    collapsed,
    theme,
    showGrid,
    gridSize,
    horizontalContainerWidth,
    exportPngRequested,

    // Getters
    isLeftPanelVisible,
    isRightPanelVisible,
    isBottomPanelVisible,
    isLeftPanelCollapsed,
    isRightPanelCollapsed,
    currentTheme,
    isGridVisible,
    currentGridSize,

    // Actions
    setPanelSize,
    setExpandedSize,
    togglePanel,
    showPanel,
    hidePanel,
    setTheme,
    toggleTheme,
    toggleGrid,
    setGridVisible,
    setGridSize,
    setHorizontalContainerWidth,
    toggleCollapsed,
    setCollapsed,
    resetLayout,
    requestExportPng,
    clearExportPngRequest,
  }
})
