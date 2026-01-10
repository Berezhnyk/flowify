<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAIStore } from '@/stores/ai'
import { AIProvider } from '@/types'

const aiStore = useAIStore()

const showApiKey = ref(false)
const apiKeyInput = ref('')
const endpointInput = ref(aiStore.config.endpoint || 'http://localhost:1234')
const temperatureInput = ref(aiStore.config.temperature ?? 0.7)
const maxTokensInput = ref(aiStore.config.maxTokens ?? 2000)

const providerOptions = [
  { value: AIProvider.OPENAI, label: 'OpenAI' },
  { value: AIProvider.ANTHROPIC, label: 'Anthropic' },
  { value: AIProvider.LM_STUDIO, label: 'LM Studio (Local)' },
]

const isLocalProvider = computed(() => aiStore.currentProvider === AIProvider.LM_STUDIO)
const needsApiKey = computed(() => !isLocalProvider.value)

// LM Studio (local) allows much higher token limits since it runs on your hardware
const maxTokensLimit = computed(() => (isLocalProvider.value ? 128000 : 8192))
const maxTokensMin = 256

function handleProviderChange(event: Event) {
  const target = event.target as HTMLSelectElement
  aiStore.setProvider(target.value as AIProvider)

  // Reset endpoint input when switching to LM Studio
  if (target.value === AIProvider.LM_STUDIO) {
    endpointInput.value = aiStore.config.endpoint || 'http://localhost:1234'
  }
}

function handleModelChange(event: Event) {
  const target = event.target as HTMLSelectElement
  aiStore.setModel(target.value)
}

function handleSaveApiKey() {
  if (apiKeyInput.value.trim()) {
    aiStore.setApiKey(apiKeyInput.value.trim())
    apiKeyInput.value = ''
    showApiKey.value = false
  }
}

function handleSaveEndpoint() {
  if (endpointInput.value.trim()) {
    aiStore.setEndpoint(endpointInput.value.trim())
  }
}

function handleClearApiKey() {
  aiStore.clearApiKey()
  apiKeyInput.value = ''
}

function handleTemperatureChange(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  temperatureInput.value = value
  aiStore.setTemperature(value)
}

function handleMaxTokensChange(event: Event) {
  const target = event.target as HTMLInputElement
  let value = parseInt(target.value, 10)
  // Clamp to valid range
  value = Math.max(maxTokensMin, Math.min(maxTokensLimit.value, value))
  maxTokensInput.value = value
  aiStore.setMaxTokens(value)
}
</script>

<template>
  <div class="ai-settings">
    <h3 class="section-title">AI Assistant Configuration</h3>

    <!-- Provider Selection -->
    <div class="setting-item">
      <label class="setting-label">AI Provider</label>
      <select
        :value="aiStore.currentProvider"
        @change="handleProviderChange"
        class="select-input"
      >
        <option v-for="option in providerOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <p class="setting-description">Choose your preferred AI provider</p>
    </div>

    <!-- Model Selection -->
    <div class="setting-item">
      <label class="setting-label">Model</label>
      <select :value="aiStore.currentModel" @change="handleModelChange" class="select-input">
        <option v-for="model in aiStore.availableModels" :key="model.id" :value="model.id">
          {{ model.name }}
        </option>
      </select>
      <p class="setting-description">Select the AI model to use</p>
    </div>

    <!-- API Key (for OpenAI/Anthropic) -->
    <div v-if="needsApiKey" class="setting-item">
      <label class="setting-label">API Key</label>

      <div v-if="aiStore.config.apiKey" class="api-key-status">
        <span class="status-badge success">Configured</span>
        <button @click="showApiKey = !showApiKey" class="btn-secondary">
          {{ showApiKey ? 'Hide' : 'Change' }}
        </button>
        <button @click="handleClearApiKey" class="btn-danger">Clear</button>
      </div>

      <div v-if="!aiStore.config.apiKey || showApiKey" class="api-key-input">
        <input
          v-model="apiKeyInput"
          type="password"
          :placeholder="`Enter ${aiStore.currentProvider} API key`"
          class="text-input"
          @keyup.enter="handleSaveApiKey"
        />
        <button @click="handleSaveApiKey" class="btn-primary">Save</button>
      </div>

      <p class="setting-description">
        <template v-if="aiStore.currentProvider === 'openai'">
          Get your API key from
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
            >OpenAI Platform</a
          >
        </template>
        <template v-else-if="aiStore.currentProvider === 'anthropic'">
          Get your API key from
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            >Anthropic Console</a
          >
        </template>
      </p>

      <div class="security-notice">
        <p>
          <strong>Security Notice:</strong> API keys are stored locally in your browser's
          localStorage. They are never sent to our servers, only to the AI provider you selected.
        </p>
      </div>
    </div>

    <!-- Endpoint URL (for LM Studio) -->
    <div v-if="isLocalProvider" class="setting-item">
      <label class="setting-label">Endpoint URL</label>
      <input
        v-model="endpointInput"
        type="text"
        placeholder="http://localhost:1234"
        class="text-input"
        @blur="handleSaveEndpoint"
        @keyup.enter="handleSaveEndpoint"
      />
      <p class="setting-description">
        LM Studio server endpoint (default: http://localhost:1234). Make sure LM Studio is running
        with the server enabled.
      </p>
    </div>

    <!-- Temperature -->
    <div class="setting-item">
      <label class="setting-label">Temperature: {{ temperatureInput.toFixed(1) }}</label>
      <div class="slider-container">
        <input
          type="range"
          :value="temperatureInput"
          min="0"
          max="1"
          step="0.1"
          class="slider-input"
          @input="handleTemperatureChange"
        />
        <div class="slider-labels">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>
      <p class="setting-description">
        Controls randomness in AI responses. Lower values (0.0-0.3) produce more focused and
        deterministic outputs, ideal for precise diagram generation. Higher values (0.7-1.0)
        increase creativity and variation, useful for brainstorming diagram ideas.
      </p>
    </div>

    <!-- Max Tokens -->
    <div class="setting-item">
      <label class="setting-label">Max Tokens</label>
      <div class="number-input-container">
        <input
          type="number"
          :value="maxTokensInput"
          :min="maxTokensMin"
          :max="maxTokensLimit"
          step="256"
          class="text-input number-input"
          @change="handleMaxTokensChange"
        />
        <span class="input-suffix">/ {{ maxTokensLimit.toLocaleString() }}</span>
      </div>
      <p class="setting-description">
        Maximum length of AI responses in tokens (~4 characters per token). Higher values allow
        longer explanations and more complex diagram suggestions. Lower values give quicker, more
        concise responses.
        <template v-if="isLocalProvider">
          <br /><strong>Local model:</strong> You can set much higher limits since the model runs on
          your hardware.
        </template>
      </p>
    </div>

    <!-- Separate Conversations Per Tab -->
    <div class="setting-item">
      <div class="toggle-setting">
        <label class="setting-label">Separate conversations per file</label>
        <button
          :class="['toggle-button', { active: aiStore.separateConversationsPerTab }]"
          @click="aiStore.setSeparateConversationsPerTab(!aiStore.separateConversationsPerTab)"
          role="switch"
          :aria-checked="aiStore.separateConversationsPerTab"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>
      <p class="setting-description">
        When enabled, each diagram tab has its own separate chat conversation.
        When disabled, all tabs share the same conversation history.
      </p>
    </div>

    <!-- Configuration Status -->
    <div class="setting-item">
      <div class="config-status">
        <span v-if="aiStore.isConfigured" class="status-badge success"> ✓ Ready </span>
        <span v-else class="status-badge error"> Configuration Required </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-settings {
  padding: var(--spacing-md);
}

.section-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.setting-item {
  margin-bottom: var(--spacing-lg);
}

.setting-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.setting-description {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.setting-description a {
  color: var(--color-primary);
  text-decoration: none;
}

.setting-description a:hover {
  text-decoration: underline;
}

.select-input,
.text-input {
  width: 100%;
  padding: var(--spacing-sm);
  background-color: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.select-input:focus,
.text-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.api-key-status {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.api-key-input {
  display: flex;
  gap: var(--spacing-sm);
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-badge.success {
  background-color: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status-badge.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-surface-elevated);
}

.btn-danger {
  background-color: transparent;
  color: var(--color-error);
  border-color: var(--color-error);
}

.btn-danger:hover {
  background-color: var(--color-error);
  color: white;
}

.config-status {
  padding: var(--spacing-md);
  background-color: var(--color-surface-elevated);
  border-radius: var(--border-radius-sm);
  text-align: center;
}

.security-notice {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: rgba(234, 179, 8, 0.1);
  border-left: 3px solid rgb(234, 179, 8);
  border-radius: var(--border-radius-sm);
}

.security-notice p {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.security-notice strong {
  color: rgb(234, 179, 8);
}

/* Slider styles */
.slider-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.slider-input {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-surface-elevated);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Number input styles */
.number-input-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.number-input {
  width: 120px;
  text-align: right;
}

.input-suffix {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Toggle setting styles */
.toggle-setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.toggle-button {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
  flex-shrink: 0;
}

.toggle-button:hover {
  border-color: var(--color-primary);
}

.toggle-button.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-button.active .toggle-slider {
  transform: translateX(20px);
}
</style>
