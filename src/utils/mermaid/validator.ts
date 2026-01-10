import { DiagramType, type ValidationError } from '@/types'

export function validateMermaidSyntax(content: string): ValidationError | null {
  if (!content || content.trim() === '') {
    return {
      message: 'Diagram content cannot be empty',
    }
  }

  // Basic syntax validation
  const firstLine = content.trim().split('\n')[0]
  const validDiagramTypes = [
    'classDiagram',
    'sequenceDiagram',
    'graph',
    'flowchart',
    'erDiagram',
    'stateDiagram',
    'gantt',
    'pie',
    'mindmap',
    'timeline',
    'gitGraph',
  ]

  const hasValidType = firstLine ? validDiagramTypes.some((type) => firstLine.includes(type)) : false

  if (!hasValidType) {
    return {
      line: 1,
      message: `Invalid diagram type. Expected one of: ${validDiagramTypes.join(', ')}`,
    }
  }

  return null
}

export function getMermaidDiagramType(content: string): string | null {
  if (!content) return null

  const firstLine = content.trim().split('\n')[0]
  if (!firstLine) return null

  if (firstLine.includes('classDiagram')) return 'classDiagram'
  if (firstLine.includes('sequenceDiagram')) return 'sequenceDiagram'
  if (firstLine.includes('flowchart')) return 'flowchart'
  if (firstLine.includes('graph')) return 'flowchart'
  if (firstLine.includes('erDiagram')) return 'erDiagram'
  if (firstLine.includes('stateDiagram')) return 'stateDiagram'
  if (firstLine.includes('gantt')) return 'gantt'
  if (firstLine.includes('pie')) return 'pie'
  if (firstLine.includes('mindmap')) return 'mindmap'
  if (firstLine.includes('timeline')) return 'timeline'
  if (firstLine.includes('gitGraph')) return 'gitGraph'

  return null
}

/**
 * Detects the DiagramType enum from Mermaid content
 * @param content - Mermaid diagram content
 * @returns DiagramType or null if not recognized
 */
export function detectDiagramType(content: string): DiagramType | null {
  const mermaidType = getMermaidDiagramType(content)

  if (!mermaidType) return null

  switch (mermaidType) {
    case 'classDiagram':
      return DiagramType.CLASS
    case 'sequenceDiagram':
      return DiagramType.SEQUENCE
    case 'flowchart':
      return DiagramType.FLOWCHART
    case 'stateDiagram':
      return DiagramType.STATE
    case 'erDiagram':
      return DiagramType.ER
    case 'gantt':
      return DiagramType.GANTT
    case 'pie':
      return DiagramType.PIE
    case 'mindmap':
      return DiagramType.MINDMAP
    case 'timeline':
      return DiagramType.TIMELINE
    case 'gitGraph':
      return DiagramType.GITGRAPH
    default:
      return null
  }
}
