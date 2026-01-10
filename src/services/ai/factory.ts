import type { AIConfig } from '@/types'
import { AIError, AIErrorCode } from '@/types'
import { AIServiceBase } from './base'
import { OpenAIService } from './openai'
import { AnthropicService } from './anthropic'
import { LMStudioService } from './lmstudio'

export class AIServiceFactory {
  static createService(config: AIConfig): AIServiceBase {
    switch (config.provider) {
      case 'openai':
        return new OpenAIService(config)
      case 'anthropic':
        return new AnthropicService(config)
      case 'lm_studio':
        return new LMStudioService(config)
      default:
        throw new AIError(`Unknown provider: ${config.provider}`, AIErrorCode.UNKNOWN)
    }
  }
}
