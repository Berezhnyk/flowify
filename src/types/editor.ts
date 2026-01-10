export interface Position {
  line: number
  column: number
}

export interface Selection {
  start: Position
  end: Position
}

export interface EditorState {
  cursorPosition: Position
  selection?: Selection
  scrollPosition: number
  theme: 'light' | 'dark'
  fontSize: number
  lineWrapping: boolean
  lineNumbers: boolean
}

export interface EditorSettings {
  tabSize: number
  indentWithTab: boolean
  autoCloseBrackets: boolean
  highlightActiveLine: boolean
}
