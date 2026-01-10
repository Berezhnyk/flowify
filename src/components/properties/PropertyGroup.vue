<script setup lang="ts">
import type { PropertyGroup as PropertyGroupType } from '@/types'
import PropertyField from './PropertyField.vue'

interface Props {
  group: PropertyGroupType
}

interface Emits {
  (e: 'toggle'): void
  (e: 'update', key: string, value: string | number | boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleToggle() {
  emit('toggle')
}

function handleUpdate(key: string, value: string | number | boolean) {
  emit('update', key, value)
}
</script>

<template>
  <div class="property-group">
    <div class="group-header" @click="handleToggle">
      <span class="group-title">{{ group.title }}</span>
      <span class="toggle-icon">{{ group.collapsed ? '▶' : '▼' }}</span>
    </div>

    <div v-if="!group.collapsed" class="group-content">
      <PropertyField
        v-for="property in group.properties"
        :key="property.key"
        :property="property"
        @update="(value) => handleUpdate(property.key, value)"
      />
    </div>
  </div>
</template>

<style scoped>
.property-group {
  border-bottom: 1px solid var(--color-border);
}

.group-header {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-surface);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  transition: background-color var(--transition-fast);
}

.group-header:hover {
  background-color: var(--color-surface-elevated);
}

.group-title {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.toggle-icon {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.group-content {
  padding: var(--spacing-sm) 0;
}
</style>
