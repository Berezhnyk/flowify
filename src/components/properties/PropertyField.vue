<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropertyDefinition } from '@/types'

interface Props {
  property: PropertyDefinition
}

interface Emits {
  (e: 'update', value: string | number | boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localValue = ref(props.property.value)

watch(
  () => props.property.value,
  (newValue) => {
    localValue.value = newValue
  }
)

function handleChange() {
  emit('update', localValue.value)
}
</script>

<template>
  <div class="property-field">
    <label class="property-label">
      {{ property.label }}
      <span v-if="property.description" class="property-description" :title="property.description">
        ⓘ
      </span>
    </label>

    <input
      v-if="property.type === 'text'"
      v-model="localValue"
      type="text"
      class="property-input"
      @change="handleChange"
    />

    <input
      v-else-if="property.type === 'number'"
      v-model.number="localValue"
      type="number"
      class="property-input"
      @change="handleChange"
    />

    <input
      v-else-if="property.type === 'boolean'"
      v-model="localValue"
      type="checkbox"
      class="property-checkbox"
      @change="handleChange"
    />

    <select
      v-else-if="property.type === 'select'"
      v-model="localValue"
      class="property-select"
      @change="handleChange"
    >
      <option v-for="option in property.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <input
      v-else-if="property.type === 'color'"
      v-model="localValue"
      type="color"
      class="property-color"
      @change="handleChange"
    />
  </div>
</template>

<style scoped>
.property-field {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.property-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.property-description {
  cursor: help;
  color: var(--color-text-muted);
}

.property-input,
.property-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.property-input:focus,
.property-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.property-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.property-color {
  width: 100%;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}
</style>
