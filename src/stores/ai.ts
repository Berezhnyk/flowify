import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AIProvider, type AIConfig, type AIModel } from '@/types'
import { useLocalStorage } from '@/composables/useLocalStorage'

// Available models for each provider
const AVAILABLE_MODELS: Record<AIProvider, AIModel[]> = {
  [AIProvider.OPENAI]: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: AIProvider.OPENAI,
      contextWindow: 128000,
      supportsStreaming: true,
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: AIProvider.OPENAI,
      contextWindow: 128000,
      supportsStreaming: true,
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: AIProvider.OPENAI,
      contextWindow: 16385,
      supportsStreaming: true,
    },
  ],
  [AIProvider.ANTHROPIC]: [
    {
      id: 'claude-3-5-sonnet-latest',
      name: 'Claude 3.5 Sonnet',
      provider: AIProvider.ANTHROPIC,
      contextWindow: 200000,
      supportsStreaming: true,
    },
    {
      id: 'claude-3-5-haiku-latest',
      name: 'Claude 3.5 Haiku',
      provider: AIProvider.ANTHROPIC,
      contextWindow: 200000,
      supportsStreaming: true,
    },
    {
      id: 'claude-3-opus-latest',
      name: 'Claude 3 Opus',
      provider: AIProvider.ANTHROPIC,
      contextWindow: 200000,
      supportsStreaming: true,
    },
  ],
  [AIProvider.LM_STUDIO]: [
    {
      id: 'local-model',
      name: 'Local Model',
      provider: AIProvider.LM_STUDIO,
      contextWindow: 8192,
      supportsStreaming: true,
    },
  ],
}

interface AISettings {
  separateConversationsPerTab: boolean
}

export const useAIStore = defineStore('ai', () => {
  // Default configuration
  const defaultConfig: AIConfig = {
    provider: AIProvider.OPENAI,
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000,
  }

  const defaultSettings: AISettings = {
    separateConversationsPerTab: true,
  }

  // Load configuration from localStorage
  const storage = useLocalStorage<AIConfig>('flowify-ai-config', defaultConfig)
  const settingsStorage = useLocalStorage<AISettings>('flowify-ai-settings', defaultSettings)

  // State
  const config = ref<AIConfig>(storage.data.value)
  const settings = ref<AISettings>(settingsStorage.data.value)

  // Getters
  const isConfigured = computed(() => {
    if (config.value.provider === AIProvider.LM_STUDIO) {
      return !!config.value.endpoint
    }
    return !!config.value.apiKey
  })

  const currentProvider = computed(() => config.value.provider)
  const currentModel = computed(() => config.value.model)
  const availableModels = computed(() => AVAILABLE_MODELS[config.value.provider] || [])
  const separateConversationsPerTab = computed(() => settings.value.separateConversationsPerTab)

  // Actions
  function setProvider(provider: AIProvider) {
    config.value.provider = provider
    // Set default model for provider
    const models = AVAILABLE_MODELS[provider]
    const firstModel = models?.[0]
    if (firstModel) {
      config.value.model = firstModel.id
    }
    storage.save(config.value)
  }

  function setModel(modelId: string) {
    config.value.model = modelId
    storage.save(config.value)
  }

  function setApiKey(apiKey: string) {
    config.value.apiKey = apiKey
    storage.save(config.value)
  }

  function setEndpoint(endpoint: string) {
    config.value.endpoint = endpoint
    storage.save(config.value)
  }

  function setTemperature(temperature: number) {
    config.value.temperature = temperature
    storage.save(config.value)
  }

  function setMaxTokens(maxTokens: number) {
    config.value.maxTokens = maxTokens
    storage.save(config.value)
  }

  function updateConfig(newConfig: Partial<AIConfig>) {
    config.value = { ...config.value, ...newConfig }
    storage.save(config.value)
  }

  function clearApiKey() {
    delete config.value.apiKey
    storage.save(config.value)
  }

  function setSeparateConversationsPerTab(value: boolean) {
    settings.value.separateConversationsPerTab = value
    settingsStorage.save(settings.value)
  }

  return {
    // State
    config,
    settings,

    // Getters
    isConfigured,
    currentProvider,
    currentModel,
    availableModels,
    separateConversationsPerTab,

    // Actions
    setProvider,
    setModel,
    setApiKey,
    setEndpoint,
    setTemperature,
    setMaxTokens,
    updateConfig,
    clearApiKey,
    setSeparateConversationsPerTab,
  }
})
