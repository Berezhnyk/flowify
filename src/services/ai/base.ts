import type { AIRequest, AIResponse, StreamChunk, DiagramSuggestion, DiagramContext } from '@/types'

export abstract class AIServiceBase {
  // Abstract methods that each provider must implement
  abstract generateResponse(request: AIRequest, signal?: AbortSignal): Promise<AIResponse>
  abstract streamResponse(
    request: AIRequest,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<AIResponse>

  // Helper to extract diagram suggestions from AI response
  protected extractSuggestion(content: string): DiagramSuggestion | undefined {
    // Look for mermaid code blocks
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/
    const match = content.match(mermaidRegex)

    if (match && match[1]) {
      return {
        type: 'replace',
        content: match[1].trim(),
        description: 'AI-generated diagram suggestion',
      }
    }

    return undefined
  }

  // Build system prompt with diagram context
  protected buildSystemPrompt(context?: DiagramContext): string {
    let prompt = `You are a helpful Mermaid diagram assistant. You help users create and modify diagrams using Mermaid syntax.

When suggesting diagrams, always wrap the Mermaid code in \`\`\`mermaid code blocks.

Supported diagram types:
- Class diagrams (classDiagram) - for OOP class structures
- Sequence diagrams (sequenceDiagram) - for message flows between participants
- Flowcharts (flowchart TD/LR or graph TD/LR) - for process flows
- State diagrams (stateDiagram-v2) - for state machines
- Entity Relationship diagrams (erDiagram) - for database schemas
- Gantt charts (gantt) - for project timelines
- Pie charts (pie) - for data distribution
- Mind maps (mindmap) - for hierarchical ideas
- Timelines (timeline) - for chronological events
- Git graphs (gitGraph) - for git branch visualization

Be concise and helpful. Focus on creating valid Mermaid syntax. When modifying existing diagrams, preserve the overall structure unless asked to change it.`

    if (context?.codebaseContext) {
      prompt += `\n\n### Codebase Context\n\nThe user has provided the following code files. Analyze them to help generate appropriate Mermaid diagrams.\n\n${context.codebaseContext}`
    }

    if (context?.content) {
      prompt += `\n\nCurrent diagram (${context.type}):\n\`\`\`mermaid\n${context.content}\n\`\`\``
    }

    if (context?.lastError) {
      prompt += `\n\nLast validation error:\n${context.lastError}\n\nPlease help fix this error.`
    }

    return prompt
  }
}
