<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isGenerating?: boolean
}

interface Emits {
  (e: 'send', message: string): void
  (e: 'stop'): void
}

const props = withDefaults(defineProps<Props>(), {
  isGenerating: false,
})

const emit = defineEmits<Emits>()

const inputValue = ref('')

function handleSend() {
  const message = inputValue.value.trim()
  if (!message || props.isGenerating) return

  emit('send', message)
  inputValue.value = ''
}

function handleStop() {
  emit('stop')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="chat-input">
    <div class="input-suggestions">
      <button
        class="suggestion-chip"
        @click="inputValue = 'Create a class diagram'"
      >
        Create class diagram
      </button>
      <button
        class="suggestion-chip"
        @click="inputValue = 'Create a sequence diagram'"
      >
        Create sequence diagram
      </button>
      <button
        class="suggestion-chip"
        @click="inputValue = 'Explain Mermaid syntax'"
      >
        Explain syntax
      </button>
    </div>

    <div class="input-container">
      <textarea
        v-model="inputValue"
        class="input-field"
        placeholder="Ask AI for help with your diagram..."
        rows="2"
        :disabled="isGenerating"
        @keydown="handleKeydown"
      ></textarea>

      <button
        v-if="isGenerating"
        class="stop-button"
        title="Stop generating"
        @click="handleStop"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="3" y="3" width="10" height="10" rx="1" />
        </svg>
      </button>
      <button
        v-else
        class="send-button"
        :disabled="!inputValue.trim()"
        title="Send message"
        @click="handleSend"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 1.5L14.5 8L1.5 14.5V9.5L10 8L1.5 6.5V1.5Z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-input {
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-suggestions {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.suggestion-chip {
  padding: 4px var(--spacing-sm);
  background-color: var(--color-surface-elevated);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  font-size: var(--font-size-xs);
  transition: all var(--transition-fast);
}

.suggestion-chip:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.input-container {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-end;
}

.input-field {
  flex: 1;
  padding: var(--spacing-sm);
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  resize: none;
  transition: border-color var(--transition-fast);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.send-button,
.stop-button {
  padding: 0;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stop-button {
  background-color: var(--color-error);
}

.stop-button:hover {
  background-color: color-mix(in srgb, var(--color-error) 85%, black);
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
