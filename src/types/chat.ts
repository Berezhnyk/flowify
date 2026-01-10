export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface TokenStats {
  totalTokens: number
  tokensPerSecond: number
  durationMs: number
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  suggestion?: DiagramSuggestion
  tokenStats?: TokenStats
}

export interface DiagramSuggestion {
  type: 'insert' | 'replace' | 'modify'
  content: string
  description: string
}

export interface ChatContext {
  currentDiagramType?: string
  currentContent?: string
  lastError?: string
}

export interface MockAIResponse {
  content: string
  suggestion?: DiagramSuggestion
}
