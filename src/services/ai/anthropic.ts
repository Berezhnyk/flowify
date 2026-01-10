import { AIServiceBase } from './base'
import type { AIRequest, AIResponse, StreamChunk, AIConfig } from '@/types'
import { AIError, AIErrorCode, AIProvider } from '@/types'

export class AnthropicService extends AIServiceBase {
  private apiKey: string
  private model: string
  private temperature: number
  private maxTokens: number
  private baseURL = 'https://api.anthropic.com/v1'

  constructor(config: AIConfig) {
    super()
    if (!config.apiKey) {
      throw new AIError('Anthropic API key is required', AIErrorCode.INVALID_API_KEY, AIProvider.ANTHROPIC)
    }
    this.apiKey = config.apiKey
    this.model = config.model
    this.temperature = config.temperature ?? 0.7
    this.maxTokens = config.maxTokens ?? 2000
  }

  async generateResponse(request: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(request.context)

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          system: systemPrompt,
          messages: request.messages,
        }),
        signal,
      })

      if (!response.ok) {
        throw await this.handleError(response)
      }

      const data = await response.json()
      const content = data.content[0].text

      return {
        content,
        suggestion: this.extractSuggestion(content),
        provider: AIProvider.ANTHROPIC,
        model: this.model,
      }
    } catch (error) {
      if (error instanceof AIError) throw error
      throw new AIError(
        'Failed to generate response from Anthropic',
        AIErrorCode.NETWORK_ERROR,
        AIProvider.ANTHROPIC,
        error as Error
      )
    }
  }

  async streamResponse(
    request: AIRequest,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(request.context)

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          system: systemPrompt,
          messages: request.messages,
          stream: true,
        }),
        signal,
      })

      if (!response.ok) {
        throw await this.handleError(response)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new AIError('No response body', AIErrorCode.STREAMING_ERROR, AIProvider.ANTHROPIC)
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

            try {
              const parsed = JSON.parse(data)

              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text || ''
                if (content) {
                  fullContent += content
                  onChunk({ content, done: false })
                }
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
        provider: AIProvider.ANTHROPIC,
        model: this.model,
      }
    } catch (error) {
      if (error instanceof AIError) throw error
      throw new AIError(
        'Streaming failed',
        AIErrorCode.STREAMING_ERROR,
        AIProvider.ANTHROPIC,
        error as Error
      )
    }
  }

  private async handleError(response: Response): Promise<AIError> {
    const data = await response.json().catch(() => ({}))
    const message = data.error?.message || 'Unknown error'

    if (response.status === 401) {
      return new AIError('Invalid API key', AIErrorCode.INVALID_API_KEY, AIProvider.ANTHROPIC)
    }
    if (response.status === 429) {
      return new AIError('Rate limit exceeded', AIErrorCode.RATE_LIMIT, AIProvider.ANTHROPIC)
    }

    return new AIError(message, AIErrorCode.UNKNOWN, AIProvider.ANTHROPIC)
  }
}
