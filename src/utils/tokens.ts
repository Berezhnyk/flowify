// Rough estimate: ~4 characters per token for English/code
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Context limits
export const MAX_CONTEXT_TOKENS = 32000 // ~128KB
export const MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * 4 // 128KB

export function truncateContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content
  return content.slice(0, maxChars) + '\n\n[... content truncated ...]'
}
