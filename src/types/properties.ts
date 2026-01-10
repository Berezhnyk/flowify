export interface PropertyDefinition {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'color'
  value: string | number | boolean
  options?: Array<{ label: string; value: string }>
  description?: string
}

export interface PropertyGroup {
  id: string
  title: string
  properties: PropertyDefinition[]
  collapsed?: boolean
}

export interface DiagramProperties {
  general: PropertyGroup
  appearance?: PropertyGroup
  layout?: PropertyGroup
}
