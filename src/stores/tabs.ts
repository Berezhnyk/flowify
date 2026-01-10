import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { DiagramType, type Diagram, type DiagramHistory, type DiagramMetadata } from '@/types'
import { DEFAULT_DIAGRAM_CONTENT, BLANK_DIAGRAM_CONTENT } from '@/utils/constants'
import { detectDiagramType } from '@/utils/mermaid/validator'

export interface ViewState {
  zoom: number
  panX: number
  panY: number
}

export interface DiagramTab {
  id: string
  diagram: Diagram
  history: DiagramHistory
  hasUnsavedChanges: boolean
  viewState: ViewState
}

export const useTabsStore = defineStore('tabs', () => {
  // State
  const tabs = ref<Map<string, DiagramTab>>(new Map())
  const tabOrder = ref<string[]>([])
  const activeTabId = ref<string | null>(null)
  const nextUntitledNumber = ref(1)

  // Getters
  const activeTab = computed(() => {
    if (!activeTabId.value) return null
    return tabs.value.get(activeTabId.value) || null
  })

  const activeDiagram = computed(() => activeTab.value?.diagram || null)

  const activeHistory = computed(() => activeTab.value?.history || null)

  const allTabs = computed(() => {
    return tabOrder.value.map((id) => tabs.value.get(id)!).filter(Boolean)
  })

  const tabCount = computed(() => tabs.value.size)

  const hasUnsavedChanges = computed(() => {
    return Array.from(tabs.value.values()).some((tab) => tab.hasUnsavedChanges)
  })

  const canUndo = computed(() => {
    const tab = activeTab.value
    return tab ? tab.history.past.length > 0 : false
  })

  const canRedo = computed(() => {
    const tab = activeTab.value
    return tab ? tab.history.future.length > 0 : false
  })

  // Helper: Generate unique untitled name
  function generateUntitledName(): string {
    const name = `Untitled Diagram ${nextUntitledNumber.value}`
    nextUntitledNumber.value++
    return name
  }

  // Helper: Create diagram object
  function createDiagramObject(
    type: DiagramType = DiagramType.CLASS,
    title?: string,
    template: 'blank' | 'example' = 'example'
  ): Diagram {
    const content =
      template === 'blank' ? BLANK_DIAGRAM_CONTENT[type] : DEFAULT_DIAGRAM_CONTENT[type]

    return {
      id: crypto.randomUUID(),
      type,
      content,
      metadata: {
        title: title || generateUntitledName(),
        description: '',
        tags: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  // Actions

  /**
   * Create a new tab
   * @param type - Diagram type (defaults to 'classDiagram')
   * @param diagram - Optional existing diagram to load
   * @param template - Template to use ('blank' or 'example', defaults to 'example')
   * @returns The ID of the newly created tab
   */
  function createTab(
    type: DiagramType = DiagramType.CLASS,
    diagram?: Diagram,
    template: 'blank' | 'example' = 'example'
  ): string {
    const newDiagram = diagram || createDiagramObject(type, undefined, template)
    const tabId = newDiagram.id

    const newTab: DiagramTab = {
      id: tabId,
      diagram: newDiagram,
      history: {
        past: [],
        future: [],
      },
      hasUnsavedChanges: false,
      viewState: {
        zoom: 1,
        panX: 0,
        panY: 0,
      },
    }

    tabs.value.set(tabId, newTab)
    tabOrder.value.push(tabId)

    // Set as active if it's the first tab
    if (tabs.value.size === 1) {
      activeTabId.value = tabId
    }

    return tabId
  }

  /**
   * Create tab from existing diagram (for file import)
   * @param diagram - Diagram to create tab from
   * @returns The ID of the newly created tab
   */
  function createTabFromDiagram(diagram: Diagram): string {
    return createTab(diagram.type, diagram)
  }

  /**
   * Close a tab
   * @param tabId - ID of tab to close
   * @returns true if tab was closed, false otherwise
   */
  function closeTab(tabId: string): boolean {
    if (!tabs.value.has(tabId)) return false

    // If this is the last tab, create a new one first
    if (tabs.value.size === 1) {
      const newTabId = createTab()
      switchTab(newTabId)
    }

    // If closing the active tab, switch to next or previous tab
    if (tabId === activeTabId.value) {
      const index = tabOrder.value.indexOf(tabId)
      const nextIndex = index < tabOrder.value.length - 1 ? index + 1 : index - 1
      const nextTabId = tabOrder.value[nextIndex]
      if (nextIndex >= 0 && nextIndex < tabOrder.value.length && nextTabId) {
        switchTab(nextTabId)
      }
    }

    // Remove tab
    const index = tabOrder.value.indexOf(tabId)
    if (index !== -1) {
      tabOrder.value.splice(index, 1)
    }
    tabs.value.delete(tabId)

    return true
  }

  /**
   * Switch to a different tab
   * @param tabId - ID of tab to switch to
   */
  function switchTab(tabId: string) {
    if (!tabs.value.has(tabId)) return
    activeTabId.value = tabId
  }

  /**
   * Update tab content
   * @param tabId - ID of tab to update
   * @param content - New content
   */
  function updateTabContent(tabId: string, content: string) {
    const tab = tabs.value.get(tabId)
    if (!tab) return

    if (content === tab.diagram.content) return

    // Save current state to history
    tab.history.past.push(tab.diagram.content)
    tab.history.future = []

    // Limit history size to 50 entries
    if (tab.history.past.length > 50) {
      tab.history.past.shift()
    }

    tab.diagram.content = content
    tab.diagram.updatedAt = new Date()
    tab.hasUnsavedChanges = true

    // Auto-detect and update diagram type based on content
    const detectedType = detectDiagramType(content)
    if (detectedType && detectedType !== tab.diagram.type) {
      tab.diagram.type = detectedType
    }
  }

  /**
   * Set tab metadata
   * @param tabId - ID of tab to update
   * @param metadata - Metadata to merge
   */
  function setTabMetadata(tabId: string, metadata: Partial<DiagramMetadata>) {
    const tab = tabs.value.get(tabId)
    if (!tab) return

    tab.diagram.metadata = {
      ...tab.diagram.metadata,
      ...metadata,
    }
    tab.diagram.updatedAt = new Date()
    tab.hasUnsavedChanges = true
  }

  /**
   * Set tab diagram type
   * @param tabId - ID of tab to update
   * @param type - New diagram type
   */
  function setTabType(tabId: string, type: DiagramType) {
    const tab = tabs.value.get(tabId)
    if (!tab) return

    if (type === tab.diagram.type) return

    tab.diagram.type = type
    tab.diagram.content = DEFAULT_DIAGRAM_CONTENT[type]
    tab.diagram.updatedAt = new Date()
    tab.hasUnsavedChanges = true

    // Clear history when changing diagram type
    tab.history.past = []
    tab.history.future = []
  }

  /**
   * Undo for active tab
   */
  function undoActiveTab() {
    if (!activeTabId.value || !canUndo.value) return

    const tab = tabs.value.get(activeTabId.value)!
    const previousContent = tab.history.past.pop()!

    tab.history.future.unshift(tab.diagram.content)
    tab.diagram.content = previousContent
    tab.diagram.updatedAt = new Date()
    tab.hasUnsavedChanges = true
  }

  /**
   * Redo for active tab
   */
  function redoActiveTab() {
    if (!activeTabId.value || !canRedo.value) return

    const tab = tabs.value.get(activeTabId.value)!
    const nextContent = tab.history.future.shift()!

    tab.history.past.push(tab.diagram.content)
    tab.diagram.content = nextContent
    tab.diagram.updatedAt = new Date()
    tab.hasUnsavedChanges = true
  }

  /**
   * Update tab view state (zoom and pan)
   * @param tabId - ID of tab to update
   * @param viewState - Partial view state to merge
   */
  function updateTabViewState(tabId: string, viewState: Partial<ViewState>) {
    const tab = tabs.value.get(tabId)
    if (!tab) return

    tab.viewState = {
      ...tab.viewState,
      ...viewState,
    }
  }

  /**
   * Mark a tab as saved
   * @param tabId - ID of tab to mark as saved
   */
  function markTabAsSaved(tabId: string) {
    const tab = tabs.value.get(tabId)
    if (!tab) return

    tab.hasUnsavedChanges = false
  }

  /**
   * Mark all tabs as saved
   */
  function markAllAsSaved() {
    tabs.value.forEach((tab) => {
      tab.hasUnsavedChanges = false
    })
  }

  /**
   * Get tab by ID
   * @param tabId - ID of tab to get
   */
  function getTab(tabId: string): DiagramTab | undefined {
    return tabs.value.get(tabId)
  }

  /**
   * Get index of tab in tab order
   * @param tabId - ID of tab
   */
  function getTabIndex(tabId: string): number {
    return tabOrder.value.indexOf(tabId)
  }

  /**
   * Reorder tabs
   * @param newOrder - New order of tab IDs
   */
  function reorderTabs(newOrder: string[]) {
    tabOrder.value = newOrder
  }

  /**
   * Check if tab can be closed (has unsaved changes)
   * @param tabId - ID of tab
   */
  function canCloseTab(tabId: string): boolean {
    const tab = tabs.value.get(tabId)
    return tab ? !tab.hasUnsavedChanges : true
  }

  /**
   * Clear all tabs and create a new default tab
   */
  function clearAllTabs() {
    tabs.value.clear()
    tabOrder.value = []
    activeTabId.value = null
    nextUntitledNumber.value = 1

    // Create initial tab
    const newTabId = createTab()
    switchTab(newTabId)
  }

  // Initialize with one default tab
  if (tabs.value.size === 0) {
    const initialTabId = createTab()
    switchTab(initialTabId)
  }

  return {
    // State
    tabs,
    tabOrder,
    activeTabId,
    nextUntitledNumber,

    // Getters
    activeTab,
    activeDiagram,
    activeHistory,
    allTabs,
    tabCount,
    hasUnsavedChanges,
    canUndo,
    canRedo,

    // Actions
    createTab,
    createTabFromDiagram,
    closeTab,
    switchTab,
    updateTabContent,
    setTabMetadata,
    setTabType,
    updateTabViewState,
    undoActiveTab,
    redoActiveTab,
    markTabAsSaved,
    markAllAsSaved,
    getTab,
    getTabIndex,
    reorderTabs,
    canCloseTab,
    clearAllTabs,
  }
})
