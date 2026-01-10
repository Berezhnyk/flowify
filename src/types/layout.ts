export interface PanelSize {
  width?: number  // Stores pixel widths (not percentages)
  height?: number // Stores pixel heights (not percentages)
}

export interface PanelSizes {
  left: PanelSize
  right: PanelSize
  bottom: PanelSize
  // Note: center panel size is always calculated as remaining space
}

// Stores the pixel widths panels should restore to when expanded
export interface PanelExpandedSizes {
  left: number   // Pixel width when expanded
  right: number  // Pixel width when expanded
}

export interface PanelVisibility {
  toolbar: boolean
  leftPanel: boolean
  centerPanel: boolean
  rightPanel: boolean
  bottomPanel: boolean
}

export interface PanelCollapsed {
  leftPanel: boolean
  rightPanel: boolean
}

export interface LayoutState {
  panelSizes: PanelSizes
  expandedSizes: PanelExpandedSizes
  visibility: PanelVisibility
  collapsed: PanelCollapsed
  theme: 'light' | 'dark'
}
