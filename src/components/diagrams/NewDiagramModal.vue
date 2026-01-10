<script setup lang="ts">
import { ref } from 'vue'
import { DiagramType } from '@/types'
import { DIAGRAM_TYPE_LABELS } from '@/utils/constants'

const emit = defineEmits<{
  close: []
  create: [type: DiagramType, template: 'blank' | 'example']
}>()

const selectedType = ref<DiagramType>(DiagramType.CLASS)
const selectedTemplate = ref<'blank' | 'example'>('blank')

const diagramTypes = [
  {
    value: DiagramType.CLASS,
    label: DIAGRAM_TYPE_LABELS[DiagramType.CLASS],
    icon: '🏗️',
    description: 'Classes, attributes, and relationships',
  },
  {
    value: DiagramType.SEQUENCE,
    label: DIAGRAM_TYPE_LABELS[DiagramType.SEQUENCE],
    icon: '🔄',
    description: 'Interactions between objects over time',
  },
  {
    value: DiagramType.FLOWCHART,
    label: DIAGRAM_TYPE_LABELS[DiagramType.FLOWCHART],
    icon: '📊',
    description: 'Process flows and decision trees',
  },
  {
    value: DiagramType.STATE,
    label: DIAGRAM_TYPE_LABELS[DiagramType.STATE],
    icon: '🔀',
    description: 'State machines and transitions',
  },
  {
    value: DiagramType.ER,
    label: DIAGRAM_TYPE_LABELS[DiagramType.ER],
    icon: '🗄️',
    description: 'Database entity relationships',
  },
  {
    value: DiagramType.GANTT,
    label: DIAGRAM_TYPE_LABELS[DiagramType.GANTT],
    icon: '📅',
    description: 'Project schedules and timelines',
  },
  {
    value: DiagramType.PIE,
    label: DIAGRAM_TYPE_LABELS[DiagramType.PIE],
    icon: '🥧',
    description: 'Data distribution visualization',
  },
  {
    value: DiagramType.MINDMAP,
    label: DIAGRAM_TYPE_LABELS[DiagramType.MINDMAP],
    icon: '🧠',
    description: 'Hierarchical idea organization',
  },
  {
    value: DiagramType.TIMELINE,
    label: DIAGRAM_TYPE_LABELS[DiagramType.TIMELINE],
    icon: '📆',
    description: 'Chronological events display',
  },
  {
    value: DiagramType.GITGRAPH,
    label: DIAGRAM_TYPE_LABELS[DiagramType.GITGRAPH],
    icon: '🌿',
    description: 'Git branch visualization',
  },
]

function handleCreate() {
  emit('create', selectedType.value, selectedTemplate.value)
}
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Create New Diagram</h2>
        <button class="close-button" @click="emit('close')">×</button>
      </div>

      <div class="modal-content">
        <div class="section">
          <h3>Select Diagram Type</h3>
          <div class="diagram-types">
            <button
              v-for="type in diagramTypes"
              :key="type.value"
              :class="{ 'type-card': true, selected: selectedType === type.value }"
              @click="selectedType = type.value"
            >
              <div class="type-icon">{{ type.icon }}</div>
              <div class="type-label">{{ type.label }}</div>
              <div class="type-description">{{ type.description }}</div>
            </button>
          </div>
        </div>

        <div class="section">
          <h3>Choose Starting Point</h3>
          <div class="templates">
            <button
              :class="{ 'template-card': true, selected: selectedTemplate === 'blank' }"
              @click="selectedTemplate = 'blank'"
            >
              <div class="template-icon">📄</div>
              <div class="template-label">Blank Diagram</div>
              <div class="template-description">Start from scratch</div>
            </button>

            <button
              :class="{ 'template-card': true, selected: selectedTemplate === 'example' }"
              @click="selectedTemplate = 'example'"
            >
              <div class="template-icon">📝</div>
              <div class="template-label">Example Template</div>
              <div class="template-description">Start with an example</div>
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="emit('close')">Cancel</button>
        <button class="create-button" @click="handleCreate">
          Create Diagram
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.close-button {
  width: 32px;
  height: 32px;
  padding: 0;
  background-color: transparent;
  color: var(--color-text-secondary);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: var(--color-error);
  color: white;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section:last-child {
  margin-bottom: 0;
}

.section h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.diagram-types {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-sm);
}

.templates {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

@media (max-width: 800px) {
  .diagram-types {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 500px) {
  .diagram-types {
    grid-template-columns: repeat(2, 1fr);
  }
}

.type-card {
  padding: var(--spacing-sm);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.template-card {
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.type-card:hover,
.template-card:hover {
  border-color: var(--color-primary);
  background-color: var(--color-surface-elevated);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.type-card.selected,
.template-card.selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: white;
}

.type-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.template-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-xs);
}

.type-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.template-label {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.type-card.selected .type-label,
.template-card.selected .template-label {
  color: white;
}

.type-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.template-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.type-card.selected .type-description,
.template-card.selected .template-description {
  color: rgba(255, 255, 255, 0.9);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.cancel-button,
.create-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.cancel-button {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.cancel-button:hover {
  background-color: var(--color-surface-elevated);
  border-color: var(--color-text-secondary);
}

.create-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.create-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
</style>
