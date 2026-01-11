import type { DiagramSuggestion } from './chat'

// AI Provider Types
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  LM_STUDIO = 'lm_studio',
}

// Model Definitions
export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  contextWindow: number
  supportsStreaming: boolean
}

// Configuration
export interface AIConfig {
  provider: AIProvider
  model: string
  apiKey?: string
  endpoint?: string // For LM Studio
  temperature?: number
  maxTokens?: number
}

// Streaming
export interface StreamChunk {
  content: string
  done: boolean
}

// Request/Response
export interface AIRequest {
  messages: AIMessage[]
  context?: DiagramContext
  stream?: boolean
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DiagramContext {
  type: string
  content: string
  lastError?: string
  codebaseContext?: string
}

export interface AIResponse {
  content: string
  suggestion?: DiagramSuggestion
  provider: AIProvider
  model: string
}

// Error Codes
export enum AIErrorCode {
  INVALID_API_KEY = 'invalid_api_key',
  NETWORK_ERROR = 'network_error',
  RATE_LIMIT = 'rate_limit',
  INVALID_MODEL = 'invalid_model',
  STREAMING_ERROR = 'streaming_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

// AI Error Class
export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public provider?: AIProvider,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIError'

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AIError.prototype)
  }
}
