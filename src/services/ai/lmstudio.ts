import { AIServiceBase } from './base'
import type { AIRequest, AIResponse, StreamChunk, AIConfig } from '@/types'
import { AIError, AIErrorCode, AIProvider } from '@/types'

export class LMStudioService extends AIServiceBase {
  private endpoint: string
  private model: string
  private temperature: number
  private maxTokens: number

  constructor(config: AIConfig) {
    super()
    if (!config.endpoint) {
      throw new AIError(
        'LM Studio endpoint URL is required',
        AIErrorCode.INVALID_API_KEY,
        AIProvider.LM_STUDIO
      )
    }
    this.endpoint = config.endpoint.replace(/\/$/, '') // Remove trailing slash
    this.model = config.model || 'local-model'
    this.temperature = config.temperature ?? 0.7
    this.maxTokens = config.maxTokens ?? 2000
  }

  async generateResponse(request: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt(request.context) },
      ...request.messages,
    ]

    try {
      const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        }),
        signal,
      })

      if (!response.ok) {
        throw await this.handleError(response)
      }

      const data = await response.json()
      const content = data.choices[0].message.content

      return {
        content,
        suggestion: this.extractSuggestion(content),
        provider: AIProvider.LM_STUDIO,
        model: this.model,
      }
    } catch (error) {
      if (error instanceof AIError) throw error
      throw new AIError(
        'Failed to connect to LM Studio. Make sure LM Studio is running.',
        AIErrorCode.NETWORK_ERROR,
        AIProvider.LM_STUDIO,
        error as Error
      )
    }
  }

  async streamResponse(
    request: AIRequest,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<AIResponse> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt(request.context) },
      ...request.messages,
    ]

    try {
      const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: true,
        }),
        signal,
      })

      if (!response.ok) {
        throw await this.handleError(response)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new AIError('No response body', AIErrorCode.STREAMING_ERROR, AIProvider.LM_STUDIO)
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((line) => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content || ''
              if (content) {
                fullContent += content
                onChunk({ content, done: false })
              }
            } catch (e) {
              console.error('Error parsing SSE:', e)
            }
          }
        }
      }

      onChunk({ content: '', done: true })

      return {
        content: fullContent,
        suggestion: this.extractSuggestion(fullContent),
        provider: AIProvider.LM_STUDIO,
        model: this.model,
      }
    } catch (error) {
      if (error instanceof AIError) throw error
      throw new AIError(
        'Streaming failed. Check LM Studio connection.',
        AIErrorCode.STREAMING_ERROR,
        AIProvider.LM_STUDIO,
        error as Error
      )
    }
  }

  private async handleError(response: Response): Promise<AIError> {
    const data = await response.json().catch(() => ({}))
    const message = data.error?.message || 'Failed to connect to LM Studio'

    return new AIError(message, AIErrorCode.NETWORK_ERROR, AIProvider.LM_STUDIO)
  }
}
