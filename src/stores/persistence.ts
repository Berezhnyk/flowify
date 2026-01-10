import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useDiagramStore } from './diagram'
import { useTabsStore } from './tabs'
import { useLayoutStore } from './layout'
import { LOCALSTORAGE_KEYS } from '@/utils/constants'
import type { DiagramTab } from './tabs'
import type { PanelVisibility } from '@/types'

interface RecentFile {
  id: string
  name: string
  lastOpened: Date
}

interface TabsPersistence {
  tabs: DiagramTab[]
  tabOrder: string[]
  activeTabId: string | null
  nextUntitledNumber: number
  version: number
}

export const usePersistenceStore = defineStore('persistence', () => {
  const diagramStore = useDiagramStore()
  const tabsStore = useTabsStore()
  const layoutStore = useLayoutStore()

  const autoSaveEnabled = ref(true)
  const lastSaved = ref<Date | null>(null)
  const recentFiles = ref<RecentFile[]>([])

  // Getters
  const isAutoSaveEnabled = computed(() => autoSaveEnabled.value)
  const timeSinceLastSave = computed(() => {
    if (!lastSaved.value) return null
    return Math.floor((Date.now() - lastSaved.value.getTime()) / 1000)
  })

  // Actions
  function saveToLocalStorage() {
    try {
      // Save all tabs with metadata
      const tabsData: TabsPersistence = {
        tabs: Array.from(tabsStore.tabs.values()).map((tab) => ({
          ...tab,
          diagram: {
            ...tab.diagram,
            createdAt: tab.diagram.createdAt,
            updatedAt: tab.diagram.updatedAt,
          },
        })),
        tabOrder: tabsStore.tabOrder,
        activeTabId: tabsStore.activeTabId,
        nextUntitledNumber: tabsStore.nextUntitledNumber,
        version: 1,
      }

      // Serialize dates to ISO strings for localStorage
      const serializedTabs = {
        ...tabsData,
        tabs: tabsData.tabs.map((tab) => ({
          ...tab,
          diagram: {
            ...tab.diagram,
            createdAt: tab.diagram.createdAt.toISOString(),
            updatedAt: tab.diagram.updatedAt.toISOString(),
          },
        })),
      }

      localStorage.setItem(LOCALSTORAGE_KEYS.TABS, JSON.stringify(serializedTabs))

      // Save layout settings (now with pixel widths and expanded sizes)
      const layoutData = {
        panelSizes: layoutStore.panelSizes,
        expandedSizes: layoutStore.expandedSizes,
        visibility: layoutStore.visibility,
        collapsed: layoutStore.collapsed,
        theme: layoutStore.theme,
        showGrid: layoutStore.showGrid,
        gridSize: layoutStore.gridSize,
        horizontalContainerWidth: layoutStore.horizontalContainerWidth,
      }
      localStorage.setItem(LOCALSTORAGE_KEYS.LAYOUT, JSON.stringify(layoutData))

      lastSaved.value = new Date()
      tabsStore.markAllAsSaved()

      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      return false
    }
  }

  function loadFromLocalStorage() {
    try {
      // Try loading new tabs format first
      const savedTabs = localStorage.getItem(LOCALSTORAGE_KEYS.TABS)

      if (savedTabs) {
        // Load tabs from new format
        const tabsData: TabsPersistence = JSON.parse(savedTabs)

        // Clear existing tabs
        tabsStore.clearAllTabs()

        // Restore tabs with deserialized dates
        tabsData.tabs.forEach((tab) => {
          const restoredTab = {
            ...tab,
            diagram: {
              ...tab.diagram,
              createdAt: new Date(tab.diagram.createdAt),
              updatedAt: new Date(tab.diagram.updatedAt),
            },
            // Migration: Add default viewState if not present
            viewState: tab.viewState || {
              zoom: 1,
              panX: 0,
              panY: 0,
            },
          }

          tabsStore.tabs.set(restoredTab.id, restoredTab)
        })

        // Restore tab order and state
        tabsStore.tabOrder = tabsData.tabOrder
        tabsStore.activeTabId = tabsData.activeTabId
        tabsStore.nextUntitledNumber = tabsData.nextUntitledNumber
      } else {
        // Migration: Check for old single diagram format
        const savedDiagram = localStorage.getItem(LOCALSTORAGE_KEYS.DIAGRAM)
        if (savedDiagram) {
          const diagram = JSON.parse(savedDiagram)
          diagram.createdAt = new Date(diagram.createdAt)
          diagram.updatedAt = new Date(diagram.updatedAt)

          // Clear default tab and create one from old diagram
          tabsStore.clearAllTabs()
          const newTabId = tabsStore.createTabFromDiagram(diagram)
          tabsStore.switchTab(newTabId)

          // Migrated old diagram to new tab format
        }
        // else: no saved state, keep default tab created by store initialization
      }

      // Load layout settings
      const savedLayout = localStorage.getItem(LOCALSTORAGE_KEYS.LAYOUT)
      if (savedLayout) {
        const layout = JSON.parse(savedLayout)

        // Load panel sizes with migration from old percentage format
        if (layout.panelSizes) {
          // Detect old percentage format (values 0-100)
          const isOldFormat =
            (layout.panelSizes.left?.width && layout.panelSizes.left.width <= 100) ||
            (layout.panelSizes.right?.width && layout.panelSizes.right.width <= 100)

          if (isOldFormat) {
            // Migrate: Convert percentages to pixels
            // Migrating old percentage-based layout to pixel-based
            const containerWidth = window.innerWidth

            if (layout.panelSizes.left?.width) {
              const pixels = Math.round((layout.panelSizes.left.width / 100) * containerWidth)
              layoutStore.setPanelSize('left', { width: pixels })
              layoutStore.setExpandedSize('left', pixels)
            }

            if (layout.panelSizes.right?.width) {
              const pixels = Math.round((layout.panelSizes.right.width / 100) * containerWidth)
              layoutStore.setPanelSize('right', { width: pixels })
              layoutStore.setExpandedSize('right', pixels)
            }

            if (layout.panelSizes.bottom?.height) {
              const pixels = Math.round((layout.panelSizes.bottom.height / 100) * window.innerHeight)
              layoutStore.setPanelSize('bottom', { height: pixels })
            }
          } else {
            // New format - load pixel values directly
            if (layout.panelSizes.left) {
              layoutStore.setPanelSize('left', layout.panelSizes.left)
            }
            if (layout.panelSizes.right) {
              layoutStore.setPanelSize('right', layout.panelSizes.right)
            }
            if (layout.panelSizes.bottom) {
              layoutStore.setPanelSize('bottom', layout.panelSizes.bottom)
            }
          }
        }

        // Load expanded sizes (NEW)
        if (layout.expandedSizes) {
          layoutStore.expandedSizes.left = layout.expandedSizes.left || 400
          layoutStore.expandedSizes.right = layout.expandedSizes.right || 350
        }

        // Update visibility
        if (layout.visibility) {
          Object.keys(layout.visibility).forEach((key) => {
            const panelKey = key as keyof PanelVisibility
            if (layout.visibility[panelKey] !== undefined) {
              layoutStore.visibility[panelKey] = layout.visibility[panelKey]
            }
          })
        }

        // Update collapsed state
        if (layout.collapsed) {
          if (layout.collapsed.leftPanel !== undefined) {
            layoutStore.setCollapsed('leftPanel', layout.collapsed.leftPanel)
          }
          if (layout.collapsed.rightPanel !== undefined) {
            layoutStore.setCollapsed('rightPanel', layout.collapsed.rightPanel)
          }
        }

        if (layout.theme) {
          layoutStore.setTheme(layout.theme)
        }
        if (layout.showGrid !== undefined) {
          layoutStore.setGridVisible(layout.showGrid)
        }
        if (layout.gridSize !== undefined) {
          layoutStore.setGridSize(layout.gridSize)
        }

        // Load horizontal container width
        if (layout.horizontalContainerWidth) {
          layoutStore.setHorizontalContainerWidth(layout.horizontalContainerWidth)
        }
      }

      // Load recent files
      const savedRecentFiles = localStorage.getItem(LOCALSTORAGE_KEYS.RECENT_FILES)
      if (savedRecentFiles) {
        recentFiles.value = JSON.parse(savedRecentFiles).map((file: any) => ({
          ...file,
          lastOpened: new Date(file.lastOpened),
        }))
      }

      return true
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return false
    }
  }

  function clearLocalStorage() {
    try {
      localStorage.removeItem(LOCALSTORAGE_KEYS.DIAGRAM)
      localStorage.removeItem(LOCALSTORAGE_KEYS.TABS)
      localStorage.removeItem(LOCALSTORAGE_KEYS.LAYOUT)
      localStorage.removeItem(LOCALSTORAGE_KEYS.RECENT_FILES)
      lastSaved.value = null
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }

  function toggleAutoSave() {
    autoSaveEnabled.value = !autoSaveEnabled.value
  }

  function addRecentFile(file: RecentFile) {
    const existingIndex = recentFiles.value.findIndex((f) => f.id === file.id)

    if (existingIndex !== -1) {
      recentFiles.value.splice(existingIndex, 1)
    }

    recentFiles.value.unshift(file)

    if (recentFiles.value.length > 10) {
      recentFiles.value = recentFiles.value.slice(0, 10)
    }

    localStorage.setItem(
      LOCALSTORAGE_KEYS.RECENT_FILES,
      JSON.stringify(
        recentFiles.value.map((f) => ({
          ...f,
          lastOpened: f.lastOpened.toISOString(),
        }))
      )
    )
  }

  function removeRecentFile(fileId: string) {
    recentFiles.value = recentFiles.value.filter((f) => f.id !== fileId)

    localStorage.setItem(
      LOCALSTORAGE_KEYS.RECENT_FILES,
      JSON.stringify(
        recentFiles.value.map((f) => ({
          ...f,
          lastOpened: f.lastOpened.toISOString(),
        }))
      )
    )
  }

  return {
    // State
    autoSaveEnabled,
    lastSaved,
    recentFiles,

    // Getters
    isAutoSaveEnabled,
    timeSinceLastSave,

    // Actions
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    toggleAutoSave,
    addRecentFile,
    removeRecentFile,
  }
})
