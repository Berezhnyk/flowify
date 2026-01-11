<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContextStore } from '@/stores/context'
import { ContextLoadingState } from '@/types'

const contextStore = useContextStore()

const isLoading = computed(() => contextStore.loadingState === ContextLoadingState.LOADING)
const hasError = computed(() => contextStore.loadingState === ContextLoadingState.ERROR)
const isExpanded = ref(false)

const totalSizeFormatted = computed(() => {
  const bytes = contextStore.totalSize
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
})

function handleRemoveFile(fileId: string) {
  contextStore.removeFile(fileId)
}

function handleClearAll() {
  contextStore.clearFiles()
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="context-indicator">
    <!-- Loading state -->
    <div v-if="isLoading" class="context-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">
        Loading {{ contextStore.githubRepo?.owner }}/{{ contextStore.githubRepo?.repo }}...
      </span>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="context-error">
      <span class="error-text">{{ contextStore.error }}</span>
      <button class="dismiss-btn" @click="contextStore.setError(null)">Dismiss</button>
    </div>

    <!-- Normal state with files -->
    <div v-else class="context-header" @click="toggleExpanded">
      <div class="context-summary">
        <svg class="context-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M2 2.5A2.5 2.5 0 014.5 0h5.793a.5.5 0 01.354.146l2.207 2.207a.5.5 0 01.146.354V13.5a2.5 2.5 0 01-2.5 2.5h-6A2.5 2.5 0 012 13.5v-11zM4.5 1A1.5 1.5 0 003 2.5v11A1.5 1.5 0 004.5 15h6a1.5 1.5 0 001.5-1.5V3.207L9.793 1H4.5z"
          />
        </svg>
        <span class="context-text">
          <span v-if="contextStore.githubRepo" class="github-badge">
            {{ contextStore.githubRepo.owner }}/{{ contextStore.githubRepo.repo }}
          </span>
          {{ contextStore.fileCount }} file{{ contextStore.fileCount !== 1 ? 's' : '' }}
          ({{ totalSizeFormatted }})
          <span v-if="contextStore.isContextTruncated" class="truncation-warning">
            (truncated)
          </span>
        </span>
      </div>
      <div class="context-actions">
        <button class="clear-btn" @click.stop="handleClearAll" title="Clear all files">
          Clear
        </button>
        <svg
          class="expand-icon"
          :class="{ 'expand-icon--expanded': isExpanded }"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4.5 6L8 9.5L11.5 6" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </div>
    </div>

    <div v-if="isExpanded" class="context-files">
      <div v-for="file in contextStore.files" :key="file.id" class="context-file">
        <div class="file-info">
          <span class="file-path">{{ file.path }}</span>
          <span class="file-lang">{{ file.language }}</span>
        </div>
        <button class="remove-btn" @click="handleRemoveFile(file.id)" title="Remove file">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M4.5 4.5l7 7m0-7l-7 7"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.context-indicator {
  background-color: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
}

.context-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.context-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: color-mix(in srgb, var(--color-error) 10%, var(--color-surface-elevated));
}

.error-text {
  font-size: var(--font-size-xs);
  color: var(--color-error);
}

.dismiss-btn {
  padding: 2px var(--spacing-xs);
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dismiss-btn:hover {
  background-color: var(--color-error);
  color: white;
}

.github-badge {
  background-color: var(--color-background);
  padding: 1px 4px;
  border-radius: 3px;
  margin-right: var(--spacing-xs);
}

.truncation-warning {
  color: var(--color-warning, #f59e0b);
  font-weight: var(--font-weight-medium);
}

.context-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.context-header:hover {
  background-color: var(--color-background);
}

.context-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.context-icon {
  color: var(--color-primary);
}

.context-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.context-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.clear-btn {
  padding: 2px var(--spacing-xs);
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background-color: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.expand-icon {
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}

.expand-icon--expanded {
  transform: rotate(180deg);
}

.context-files {
  max-height: 150px;
  overflow-y: auto;
  padding: var(--spacing-xs) var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.context-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
}

.context-file:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  flex: 1;
}

.file-path {
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-lang {
  font-size: 10px;
  color: var(--color-text-secondary);
  background-color: var(--color-background);
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.remove-btn:hover {
  background-color: var(--color-error);
  color: white;
}
</style>
