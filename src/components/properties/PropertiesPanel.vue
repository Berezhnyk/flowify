<script setup lang="ts">
import { computed } from 'vue'
import { useTabsStore } from '@/stores/tabs'

const props = defineProps<{
  tabId: string
}>()

const tabsStore = useTabsStore()

const currentTab = computed(() => tabsStore.getTab(props.tabId))
const metadata = computed(() => currentTab.value?.diagram.metadata)

function updateTitle(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentTab.value) {
    tabsStore.setTabMetadata(props.tabId, { title: target.value })
  }
}

function updateDescription(event: Event) {
  const target = event.target as HTMLTextAreaElement
  if (currentTab.value) {
    tabsStore.setTabMetadata(props.tabId, { description: target.value })
  }
}

function updateTags(event: Event) {
  const target = event.target as HTMLInputElement
  const tags = target.value.split(',').map(tag => tag.trim()).filter(Boolean)
  if (currentTab.value) {
    tabsStore.setTabMetadata(props.tabId, { tags })
  }
}

function updateAuthor(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentTab.value) {
    tabsStore.setTabMetadata(props.tabId, { author: target.value })
  }
}
</script>

<template>
  <div class="properties-panel">
    <div v-if="metadata" class="property-section">
      <h3 class="section-title">Diagram Information</h3>

      <div class="property-field">
        <label>Title</label>
        <input
          type="text"
          :value="metadata.title"
          @input="updateTitle"
          class="property-input"
        />
      </div>

      <div class="property-field">
        <label>Description</label>
        <textarea
          :value="metadata.description || ''"
          @input="updateDescription"
          class="property-textarea"
          rows="3"
          placeholder="Add a description..."
        />
      </div>

      <div class="property-field">
        <label>Tags</label>
        <input
          type="text"
          :value="metadata.tags?.join(', ') || ''"
          @input="updateTags"
          class="property-input"
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div class="property-field">
        <label>Author</label>
        <input
          type="text"
          :value="metadata.author || ''"
          @input="updateAuthor"
          class="property-input"
          placeholder="Your name"
        />
      </div>

      <div class="property-field">
        <label>Created</label>
        <div class="property-value">{{ currentTab?.diagram?.createdAt ? new Date(currentTab.diagram.createdAt).toLocaleString() : '' }}</div>
      </div>

      <div class="property-field">
        <label>Last Modified</label>
        <div class="property-value">{{ currentTab?.diagram?.updatedAt ? new Date(currentTab.diagram.updatedAt).toLocaleString() : '' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-panel {
  padding: var(--spacing-md);
  height: 100%;
  overflow-y: auto;
}

.property-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.property-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.property-field label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.property-input,
.property-textarea {
  padding: var(--spacing-xs);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.property-input:focus,
.property-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.property-textarea {
  resize: vertical;
  min-height: 60px;
}

.property-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs);
  background-color: var(--color-surface);
  border-radius: var(--border-radius-sm);
}
</style>
