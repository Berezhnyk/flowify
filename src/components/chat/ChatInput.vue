<script setup lang="ts">
import { ref } from 'vue'
import { isGitHubUrl } from '@/utils/github'

interface Props {
  isGenerating?: boolean
}

interface Emits {
  (e: 'send', message: string): void
  (e: 'stop'): void
  (e: 'data-dropped', dataTransfer: DataTransfer): void
  (e: 'github-url', url: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isGenerating: false,
})

const emit = defineEmits<Emits>()

const inputValue = ref('')
const isDragging = ref(false)

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

function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  // Only set false if leaving the drop zone entirely
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const { clientX, clientY } = event
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
    isDragging.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false

  const dataTransfer = event.dataTransfer
  if (dataTransfer) {
    emit('data-dropped', dataTransfer)
  }
}

function handlePaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text')
  if (text && isGitHubUrl(text)) {
    event.preventDefault()
    emit('github-url', text.trim())
  }
}
</script>

<template>
  <div
    class="chat-input"
    :class="{ 'chat-input--dragging': isDragging }"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div v-if="isDragging" class="drop-overlay">
      <div class="drop-content">
        <svg class="drop-icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
        <span class="drop-text">Drop files here</span>
      </div>
    </div>

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
        @paste="handlePaste"
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
  position: relative;
  transition: all var(--transition-fast);
}

.chat-input--dragging {
  border: 2px dashed var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
}

.drop-overlay {
  position: absolute;
  inset: 0;
  background-color: color-mix(in srgb, var(--color-primary) 15%, var(--color-surface) 85%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: var(--border-radius-sm);
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.drop-icon {
  color: var(--color-primary);
}

.drop-text {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
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
