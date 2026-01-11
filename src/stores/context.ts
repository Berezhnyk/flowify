import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ContextFile, GitHubRepo } from '@/types'
import { ContextLoadingState } from '@/types'
import { MAX_CONTEXT_CHARS } from '@/utils/tokens'

export const useContextStore = defineStore('context', () => {
  // State
  const files = ref<ContextFile[]>([])
  const loadingState = ref<ContextLoadingState>(ContextLoadingState.IDLE)
  const error = ref<string | null>(null)
  const githubRepo = ref<GitHubRepo | null>(null)

  // Getters
  const totalSize = computed(() => files.value.reduce((sum, f) => sum + f.size, 0))
  const fileCount = computed(() => files.value.length)
  const hasContext = computed(() => files.value.length > 0)

  /**
   * Returns a formatted summary of context files for AI prompt injection.
   * Format: "Files in context:\n- path/file.ts (language)\n..."
   */
  const contextSummary = computed(() => {
    if (files.value.length === 0) {
      return ''
    }

    const fileList = files.value.map((f) => `- ${f.path} (${f.language})`).join('\n')
    return `Files in context:\n${fileList}`
  })

  /**
   * Returns the full context content formatted for AI requests.
   * Each file is wrapped with path header and content.
   * Content is truncated if it exceeds MAX_CONTEXT_CHARS.
   */
  const contextForAI = computed(() => {
    if (files.value.length === 0) {
      return ''
    }

    let result = ''
    let remaining = MAX_CONTEXT_CHARS

    // Sort files by size (smaller first to fit more files)
    const sortedFiles = [...files.value].sort((a, b) => a.size - b.size)

    for (const f of sortedFiles) {
      if (remaining <= 0) break

      const header = `### File: ${f.path}\n\`\`\`${f.language}\n`
      const footer = '\n```\n\n'
      const headerFooterLen = header.length + footer.length

      if (remaining < headerFooterLen + 100) break // Not enough room for meaningful content

      const availableForContent = remaining - headerFooterLen
      const content =
        f.content.length <= availableForContent
          ? f.content
          : f.content.slice(0, availableForContent - 20) + '\n[... truncated]'

      result += header + content + footer
      remaining -= header.length + content.length + footer.length
    }

    return result.trim()
  })

  /**
   * Returns true if context size exceeds the maximum allowed.
   */
  const isContextTruncated = computed(() => totalSize.value > MAX_CONTEXT_CHARS)

  // Actions
  function addFile(file: Omit<ContextFile, 'id' | 'addedAt'>): void {
    const newFile: ContextFile = {
      ...file,
      id: crypto.randomUUID(),
      addedAt: new Date(),
    }
    files.value.push(newFile)
  }

  function addFiles(newFiles: Omit<ContextFile, 'id' | 'addedAt'>[]): void {
    const filesToAdd: ContextFile[] = newFiles.map((file) => ({
      ...file,
      id: crypto.randomUUID(),
      addedAt: new Date(),
    }))
    files.value.push(...filesToAdd)
  }

  function removeFile(fileId: string): void {
    const index = files.value.findIndex((f) => f.id === fileId)
    if (index !== -1) {
      files.value.splice(index, 1)
    }
  }

  function clearFiles(): void {
    files.value = []
    githubRepo.value = null
    error.value = null
  }

  function setLoading(state: ContextLoadingState): void {
    loadingState.value = state
  }

  function setError(message: string | null): void {
    error.value = message
    if (message) {
      loadingState.value = ContextLoadingState.ERROR
    }
  }

  function setGitHubRepo(repo: GitHubRepo | null): void {
    githubRepo.value = repo
  }

  return {
    // State
    files,
    loadingState,
    error,
    githubRepo,

    // Getters
    totalSize,
    fileCount,
    hasContext,
    contextSummary,
    contextForAI,
    isContextTruncated,

    // Actions
    addFile,
    addFiles,
    removeFile,
    clearFiles,
    setLoading,
    setError,
    setGitHubRepo,
  }
})
