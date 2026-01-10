import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { DiagramProperties, PropertyGroup } from '@/types'
import { useDiagramStore } from './diagram'

export const usePropertiesStore = defineStore('properties', () => {
  const diagramStore = useDiagramStore()

  const selectedElement = ref<string | null>(null)
  const expandedGroups = ref<Set<string>>(new Set(['general']))

  // Getters
  const properties = computed<DiagramProperties>(() => {
    const metadata = diagramStore.diagramMetadata

    const general: PropertyGroup = {
      id: 'general',
      title: 'General',
      collapsed: !expandedGroups.value.has('general'),
      properties: [
        {
          key: 'title',
          label: 'Title',
          type: 'text',
          value: metadata.title,
          description: 'Diagram title',
        },
        {
          key: 'description',
          label: 'Description',
          type: 'text',
          value: metadata.description || '',
          description: 'Diagram description',
        },
        {
          key: 'author',
          label: 'Author',
          type: 'text',
          value: metadata.author || '',
          description: 'Diagram author',
        },
      ],
    }

    const appearance: PropertyGroup = {
      id: 'appearance',
      title: 'Appearance',
      collapsed: !expandedGroups.value.has('appearance'),
      properties: [
        {
          key: 'theme',
          label: 'Theme',
          type: 'select',
          value: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Dark', value: 'dark' },
            { label: 'Forest', value: 'forest' },
            { label: 'Neutral', value: 'neutral' },
          ],
          description: 'Mermaid diagram theme',
        },
      ],
    }

    return {
      general,
      appearance,
    }
  })

  const hasSelectedElement = computed(() => selectedElement.value !== null)

  // Actions
  function updateProperty(groupId: string, key: string, value: string | number | boolean) {
    if (groupId === 'general') {
      diagramStore.setMetadata({
        [key]: value,
      })
    }
  }

  function toggleGroup(groupId: string) {
    if (expandedGroups.value.has(groupId)) {
      expandedGroups.value.delete(groupId)
    } else {
      expandedGroups.value.add(groupId)
    }
  }

  function selectElement(elementId: string | null) {
    selectedElement.value = elementId
  }

  function clearSelection() {
    selectedElement.value = null
  }

  return {
    // State
    selectedElement,
    expandedGroups,

    // Getters
    properties,
    hasSelectedElement,

    // Actions
    updateProperty,
    toggleGroup,
    selectElement,
    clearSelection,
  }
})
