import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ChatMessage, MessageRole, DiagramSuggestion } from '@/types'

function createWelcomeMessage(): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: 'system' as MessageRole,
    content: 'Hello! I\'m your Mermaid diagram assistant. I can help you create and edit UML diagrams using Mermaid syntax. Try asking me to create a class diagram or explain Mermaid syntax!',
    timestamp: new Date(),
  }
}

export const useChatStore = defineStore('chat', () => {
  // Global conversation (used when separateConversationsPerTab is false)
  const globalMessages = ref<ChatMessage[]>([createWelcomeMessage()])

  // Per-tab conversations (used when separateConversationsPerTab is true)
  const tabMessages = ref<Map<string, ChatMessage[]>>(new Map())

  // Current active tab ID (set by ChatPanel)
  const activeTabId = ref<string | null>(null)

  const currentInput = ref('')
  const isTyping = ref(false)

  // Whether to use per-tab or global messages
  const useSeparateConversations = ref(true)

  // Helper: Get messages array for current context
  function getMessages(): ChatMessage[] {
    if (!useSeparateConversations.value) {
      return globalMessages.value
    }

    if (!activeTabId.value) {
      return globalMessages.value
    }

    if (!tabMessages.value.has(activeTabId.value)) {
      tabMessages.value.set(activeTabId.value, [createWelcomeMessage()])
    }

    return tabMessages.value.get(activeTabId.value)!
  }

  // Getters
  const messageHistory = computed(() => getMessages())
  const hasMessages = computed(() => getMessages().length > 0)
  const lastMessage = computed(() => {
    const msgs = getMessages()
    return msgs[msgs.length - 1]
  })

  // Actions
  function setActiveTab(tabId: string | null) {
    activeTabId.value = tabId
  }

  function setUseSeparateConversations(value: boolean) {
    useSeparateConversations.value = value
  }

  function addMessage(content: string, role: MessageRole, suggestion?: DiagramSuggestion) {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      suggestion,
    }

    const msgs = getMessages()
    msgs.push(message)
  }

  function addUserMessage(content: string) {
    addMessage(content, 'user' as MessageRole)
    currentInput.value = ''
  }

  function addAssistantMessage(content: string, suggestion?: DiagramSuggestion) {
    addMessage(content, 'assistant' as MessageRole, suggestion)
  }

  function setCurrentInput(input: string) {
    currentInput.value = input
  }

  function setTyping(typing: boolean) {
    isTyping.value = typing
  }

  function clearMessages() {
    if (!useSeparateConversations.value) {
      globalMessages.value = [createWelcomeMessage()]
    } else if (activeTabId.value) {
      tabMessages.value.set(activeTabId.value, [createWelcomeMessage()])
    }
  }

  function clearAllTabMessages() {
    tabMessages.value.clear()
  }

  function deleteMessage(messageId: string) {
    const msgs = getMessages()
    const index = msgs.findIndex((m) => m.id === messageId)
    if (index !== -1) {
      msgs.splice(index, 1)
    }
  }

  function deleteTabConversation(tabId: string) {
    tabMessages.value.delete(tabId)
  }

  return {
    // State
    globalMessages,
    tabMessages,
    activeTabId,
    currentInput,
    isTyping,
    useSeparateConversations,

    // Getters
    messageHistory,
    hasMessages,
    lastMessage,

    // Actions
    setActiveTab,
    setUseSeparateConversations,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    setCurrentInput,
    setTyping,
    clearMessages,
    clearAllTabMessages,
    deleteMessage,
    deleteTabConversation,
  }
})
