<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useTabsStore } from '@/stores/tabs'
import { useAIStore } from '@/stores/ai'
import { useContextStore } from '@/stores/context'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import ContextIndicator from './ContextIndicator.vue'
import { AIServiceFactory } from '@/services/ai'
import {
  readTextFile,
  getEntriesFromDataTransfer,
  readDirectory,
  type FileWithPath,
} from '@/utils/fileReader'
import { parseGitHubUrl } from '@/utils/github'
import type { AIRequest } from '@/types'
import { AIError, ContextSource } from '@/types'

const chatStore = useChatStore()
const tabsStore = useTabsStore()
const aiStore = useAIStore()
const contextStore = useContextStore()

const messagesContainer = ref<HTMLDivElement | null>(null)
const lastUserMessage = ref<string>('')
const showRetry = ref(false)
const isRetrying = ref(false)
const abortController = ref<AbortController | null>(null)

// Sync active tab with chat store
watch(
  () => tabsStore.activeTabId,
  (tabId) => {
    chatStore.setActiveTab(tabId)
  },
  { immediate: true }
)

// Sync separate conversations setting with chat store
watch(
  () => aiStore.separateConversationsPerTab,
  (value) => {
    chatStore.setUseSeparateConversations(value)
  },
  { immediate: true }
)

onMounted(() => {
  // Ensure sync on mount
  chatStore.setActiveTab(tabsStore.activeTabId)
  chatStore.setUseSeparateConversations(aiStore.separateConversationsPerTab)
})

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function handleStopGeneration() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  chatStore.setTyping(false)
}

async function handleSendMessage(message: string) {
  lastUserMessage.value = message
  showRetry.value = false
  chatStore.addUserMessage(message)
  chatStore.setTyping(true)

  // Create new abort controller for this request
  abortController.value = new AbortController()

  await scrollToBottom()

  // Check if AI is configured
  if (!aiStore.isConfigured) {
    chatStore.addAssistantMessage(
      'Please configure your AI provider in Settings to use the chat feature. Go to Settings > AI Assistant Configuration to set up your API key.'
    )
    chatStore.setTyping(false)
    abortController.value = null
    await scrollToBottom()
    return
  }

  try {
    // Build context from active tab
    const activeTab = tabsStore.activeTab
    if (!activeTab) {
      chatStore.addAssistantMessage('No active diagram tab. Please create or open a diagram first.')
      chatStore.setTyping(false)
      abortController.value = null
      await scrollToBottom()
      return
    }

    const context = {
      type: activeTab.diagram.type,
      content: activeTab.diagram.content,
    }

    // Create AI service
    const aiService = AIServiceFactory.createService(aiStore.config)

    // Build request with chat history
    const request: AIRequest = {
      messages: chatStore.messageHistory
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role,
          content: m.content,
        })),
      context,
      stream: true,
    }

    // Add placeholder message for streaming
    chatStore.addAssistantMessage('')
    let streamedContent = ''
    const streamStartTime = performance.now()
    let tokenCount = 0

    // Stream response
    await aiService.streamResponse(request, (chunk) => {
      if (!chunk.done) {
        streamedContent += chunk.content
        // Estimate tokens (~4 chars per token for English text)
        tokenCount = Math.ceil(streamedContent.length / 4)

        // Update the last message with streamed content
        const messages = chatStore.messageHistory
        const lastMsg = messages[messages.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = streamedContent
        }

        // Auto-scroll during streaming
        scrollToBottom()
      }
    }, abortController.value.signal)

    // Calculate final stats
    const streamEndTime = performance.now()
    const durationMs = streamEndTime - streamStartTime
    const durationSec = durationMs / 1000
    const tokensPerSecond = durationSec > 0 ? tokenCount / durationSec : 0

    // Extract suggestion from final content and update message
    const messages = chatStore.messageHistory
    const lastMsg = messages[messages.length - 1]
    if (lastMsg && lastMsg.role === 'assistant') {
      // Add token stats
      lastMsg.tokenStats = {
        totalTokens: tokenCount,
        tokensPerSecond: Math.round(tokensPerSecond * 10) / 10,
        durationMs: Math.round(durationMs),
      }

      // Try to extract suggestion using the same regex as the service
      const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/
      const match = streamedContent.match(mermaidRegex)

      if (match && match[1]) {
        lastMsg.suggestion = {
          type: 'replace',
          content: match[1].trim(),
          description: 'AI-generated diagram suggestion',
        }
      }
    }
  } catch (error) {
    // Handle abort (user stopped generation)
    if (error instanceof DOMException && error.name === 'AbortError') {
      // User cancelled - don't show error, just keep partial content
      return
    }

    console.error('AI error:', error)

    let errorMessage = 'An error occurred while generating response.'

    if (error instanceof AIError) {
      switch (error.code) {
        case 'invalid_api_key':
          errorMessage = 'Invalid API key. Please check your settings.'
          break
        case 'rate_limit':
          errorMessage = 'Rate limit exceeded. Please try again in a few moments.'
          break
        case 'network_error':
          if (error.provider === 'lm_studio') {
            errorMessage =
              'Failed to connect to LM Studio. Make sure LM Studio is running at the configured endpoint.'
          } else {
            errorMessage = 'Network error. Please check your connection and try again.'
          }
          break
        default:
          errorMessage = error.message
      }
    }

    chatStore.addAssistantMessage(errorMessage)
    showRetry.value = true
  } finally {
    chatStore.setTyping(false)
    abortController.value = null
    await scrollToBottom()
  }
}

async function handleRetry() {
  if (!lastUserMessage.value || isRetrying.value) return

  isRetrying.value = true
  showRetry.value = false

  // Create new abort controller for this request
  abortController.value = new AbortController()

  // Remove the last error message
  const messages = chatStore.messageHistory
  const lastMessage = messages[messages.length - 1]
  if (messages.length > 0 && lastMessage && lastMessage.role === 'assistant') {
    chatStore.deleteMessage(lastMessage.id)
  }

  // Resend the message without adding it again to history
  chatStore.setTyping(true)
  await scrollToBottom()

  // Check if AI is configured
  if (!aiStore.isConfigured) {
    chatStore.addAssistantMessage(
      'Please configure your AI provider in Settings to use the chat feature. Go to Settings > AI Assistant Configuration to set up your API key.'
    )
    chatStore.setTyping(false)
    isRetrying.value = false
    abortController.value = null
    await scrollToBottom()
    return
  }

  try {
    // Build context from active tab
    const activeTab = tabsStore.activeTab
    if (!activeTab) {
      chatStore.addAssistantMessage('No active diagram tab. Please create or open a diagram first.')
      chatStore.setTyping(false)
      isRetrying.value = false
      abortController.value = null
      await scrollToBottom()
      return
    }

    const context = {
      type: activeTab.diagram.type,
      content: activeTab.diagram.content,
    }

    // Create AI service
    const aiService = AIServiceFactory.createService(aiStore.config)

    // Build request with chat history
    const request: AIRequest = {
      messages: chatStore.messageHistory
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role,
          content: m.content,
        })),
      context,
      stream: true,
    }

    // Add placeholder message for streaming
    chatStore.addAssistantMessage('')
    let streamedContent = ''
    const streamStartTime = performance.now()
    let tokenCount = 0

    // Stream response
    await aiService.streamResponse(request, (chunk) => {
      if (!chunk.done) {
        streamedContent += chunk.content
        // Estimate tokens (~4 chars per token for English text)
        tokenCount = Math.ceil(streamedContent.length / 4)

        // Update the last message with streamed content
        const messages = chatStore.messageHistory
        const lastMsg = messages[messages.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = streamedContent
        }

        // Auto-scroll during streaming
        scrollToBottom()
      }
    }, abortController.value.signal)

    // Calculate final stats
    const streamEndTime = performance.now()
    const durationMs = streamEndTime - streamStartTime
    const durationSec = durationMs / 1000
    const tokensPerSecond = durationSec > 0 ? tokenCount / durationSec : 0

    // Extract suggestion from final content and update message
    const msgs = chatStore.messageHistory
    const lastMsg = msgs[msgs.length - 1]
    if (lastMsg && lastMsg.role === 'assistant') {
      // Add token stats
      lastMsg.tokenStats = {
        totalTokens: tokenCount,
        tokensPerSecond: Math.round(tokensPerSecond * 10) / 10,
        durationMs: Math.round(durationMs),
      }

      // Try to extract suggestion using the same regex as the service
      const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/
      const match = streamedContent.match(mermaidRegex)

      if (match && match[1]) {
        lastMsg.suggestion = {
          type: 'replace',
          content: match[1].trim(),
          description: 'AI-generated diagram suggestion',
        }
      }
    }
  } catch (error) {
    // Handle abort (user stopped generation)
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    console.error('AI error:', error)

    let errorMessage = 'An error occurred while generating response.'

    if (error instanceof AIError) {
      switch (error.code) {
        case 'invalid_api_key':
          errorMessage = 'Invalid API key. Please check your settings.'
          break
        case 'rate_limit':
          errorMessage = 'Rate limit exceeded. Please try again in a few moments.'
          break
        case 'network_error':
          if (error.provider === 'lm_studio') {
            errorMessage =
              'Failed to connect to LM Studio. Make sure LM Studio is running at the configured endpoint.'
          } else {
            errorMessage = 'Network error. Please check your connection and try again.'
          }
          break
        default:
          errorMessage = error.message
      }
    }

    chatStore.addAssistantMessage(errorMessage)
    showRetry.value = true
  } finally {
    chatStore.setTyping(false)
    isRetrying.value = false
    abortController.value = null
    await scrollToBottom()
  }
}

function handleApplySuggestion(content: string) {
  if (tabsStore.activeTabId) {
    tabsStore.updateTabContent(tabsStore.activeTabId, content)
  }
}

function handleClearConversation() {
  if (confirm('Are you sure you want to clear the conversation? This cannot be undone.')) {
    chatStore.clearMessages()
    showRetry.value = false
    lastUserMessage.value = ''
  }
}

// Simple language detection by file extension
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    vue: 'vue',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    css: 'css',
    scss: 'scss',
    html: 'html',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    xml: 'xml',
    toml: 'toml',
  }
  return langMap[ext] || 'plaintext'
}

async function processFiles(filesWithPath: FileWithPath[]) {
  for (const { file, path } of filesWithPath) {
    const result = await readTextFile(file)

    if (!result.success) {
      // Skip binary files silently
      continue
    }

    contextStore.addFile({
      name: file.name,
      path,
      content: result.content,
      language: detectLanguage(file.name),
      size: result.content.length,
      source: ContextSource.LOCAL,
    })
  }
}

async function handleDataDropped(dataTransfer: DataTransfer) {
  const entries = getEntriesFromDataTransfer(dataTransfer)

  // If no entries (fallback for browsers without webkitGetAsEntry)
  if (entries.length === 0) {
    const files = Array.from(dataTransfer.files)
    const filesWithPath: FileWithPath[] = files.map((file) => ({ file, path: file.name }))
    await processFiles(filesWithPath)
    return
  }

  // Process entries (can include folders)
  for (const entry of entries) {
    const filesWithPath = await readDirectory(entry)
    await processFiles(filesWithPath)
  }
}

function handleGitHubUrl(url: string) {
  const repo = parseGitHubUrl(url)
  if (repo) {
    contextStore.setGitHubRepo(repo)
    // Fetching will be implemented in Phase 7
  }
}
</script>

<template>
  <div class="chat-panel">
    <div class="chat-header">
      <h3 class="chat-title">AI Assistant</h3>
      <button
        @click="handleClearConversation"
        class="clear-button"
        title="Clear conversation"
        :disabled="chatStore.messageHistory.length === 0"
      >
        🗑️ Clear
      </button>
    </div>

    <ContextIndicator v-if="contextStore.hasContext" />

    <div ref="messagesContainer" class="messages-container">
      <ChatMessage
        v-for="message in chatStore.messageHistory"
        :key="message.id"
        :message="message"
        @apply-suggestion="handleApplySuggestion"
      />

      <div v-if="chatStore.isTyping" class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div v-if="showRetry && !chatStore.isTyping" class="retry-container">
        <button @click="handleRetry" :disabled="isRetrying" class="retry-button">
          <span v-if="!isRetrying">🔄 Retry</span>
          <span v-else>Retrying...</span>
        </button>
      </div>
    </div>

    <ChatInput
      :is-generating="chatStore.isTyping"
      @send="handleSendMessage"
      @stop="handleStopGeneration"
      @data-dropped="handleDataDropped"
      @github-url="handleGitHubUrl"
    />
  </div>
</template>

<style scoped>
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.chat-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.clear-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.clear-button:hover:not(:disabled) {
  background-color: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.clear-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: var(--spacing-sm);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: var(--color-text-secondary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.retry-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-sm);
}

.retry-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.retry-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.retry-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
