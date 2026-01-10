export enum DiagramType {
  CLASS = 'classDiagram',
  SEQUENCE = 'sequenceDiagram',
  FLOWCHART = 'flowchart',
  STATE = 'stateDiagram',
  ER = 'erDiagram',
  GANTT = 'gantt',
  PIE = 'pie',
  MINDMAP = 'mindmap',
  TIMELINE = 'timeline',
  GITGRAPH = 'gitGraph',
}

export interface DiagramMetadata {
  title: string
  description?: string
  tags?: string[]
  author?: string
}

export interface Diagram {
  id: string
  type: DiagramType
  content: string
  metadata: DiagramMetadata
  createdAt: Date
  updatedAt: Date
}

export interface DiagramHistory {
  past: string[]
  future: string[]
}

export interface MermaidConfig {
  theme?: 'default' | 'dark' | 'forest' | 'neutral'
  themeVariables?: Record<string, string>
}

export interface ValidationError {
  line?: number
  message: string
}
