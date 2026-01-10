import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Diagram, DiagramType, DiagramMetadata, DiagramHistory } from '@/types'
import { DEFAULT_DIAGRAM_CONTENT } from '@/utils/constants'

export const useDiagramStore = defineStore('diagram', () => {
  const current = ref<Diagram>({
    id: crypto.randomUUID(),
    type: 'classDiagram' as DiagramType,
    content: DEFAULT_DIAGRAM_CONTENT.classDiagram,
    metadata: {
      title: 'Untitled Diagram',
      description: '',
      tags: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const history = ref<DiagramHistory>({
    past: [],
    future: [],
  })

  const hasUnsavedChanges = ref(false)

  // Getters
  const diagramType = computed(() => current.value.type)
  const diagramContent = computed(() => current.value.content)
  const diagramMetadata = computed(() => current.value.metadata)
  const canUndo = computed(() => history.value.past.length > 0)
  const canRedo = computed(() => history.value.future.length > 0)

  // Actions
  function setContent(content: string) {
    if (content === current.value.content) return

    // Save current state to history
    history.value.past.push(current.value.content)
    history.value.future = []

    // Limit history size to 50 entries
    if (history.value.past.length > 50) {
      history.value.past.shift()
    }

    current.value.content = content
    current.value.updatedAt = new Date()
    hasUnsavedChanges.value = true
  }

  function setType(type: DiagramType) {
    if (type === current.value.type) return

    current.value.type = type
    current.value.content = DEFAULT_DIAGRAM_CONTENT[type]
    current.value.updatedAt = new Date()
    hasUnsavedChanges.value = true

    // Clear history when changing diagram type
    history.value.past = []
    history.value.future = []
  }

  function setMetadata(metadata: Partial<DiagramMetadata>) {
    current.value.metadata = {
      ...current.value.metadata,
      ...metadata,
    }
    current.value.updatedAt = new Date()
    hasUnsavedChanges.value = true
  }

  function undo() {
    if (!canUndo.value) return

    const previousContent = history.value.past.pop()!
    history.value.future.unshift(current.value.content)

    current.value.content = previousContent
    current.value.updatedAt = new Date()
    hasUnsavedChanges.value = true
  }

  function redo() {
    if (!canRedo.value) return

    const nextContent = history.value.future.shift()!
    history.value.past.push(current.value.content)

    current.value.content = nextContent
    current.value.updatedAt = new Date()
    hasUnsavedChanges.value = true
  }

  function createNew(type: DiagramType) {
    current.value = {
      id: crypto.randomUUID(),
      type,
      content: DEFAULT_DIAGRAM_CONTENT[type],
      metadata: {
        title: 'Untitled Diagram',
        description: '',
        tags: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    history.value.past = []
    history.value.future = []
    hasUnsavedChanges.value = false
  }

  function loadDiagram(diagram: Diagram) {
    current.value = {
      ...diagram,
      updatedAt: new Date(),
    }

    history.value.past = []
    history.value.future = []
    hasUnsavedChanges.value = false
  }

  function markAsSaved() {
    hasUnsavedChanges.value = false
  }

  return {
    // State
    current,
    history,
    hasUnsavedChanges,

    // Getters
    diagramType,
    diagramContent,
    diagramMetadata,
    canUndo,
    canRedo,

    // Actions
    setContent,
    setType,
    setMetadata,
    undo,
    redo,
    createNew,
    loadDiagram,
    markAsSaved,
  }
})
