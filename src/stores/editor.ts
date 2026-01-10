import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { EditorState, EditorSettings } from '@/types'
import { DEFAULT_EDITOR_SETTINGS } from '@/utils/constants'

export const useEditorStore = defineStore('editor', () => {
  const state = ref<EditorState>({
    cursorPosition: { line: 1, column: 1 },
    selection: undefined,
    scrollPosition: 0,
    theme: DEFAULT_EDITOR_SETTINGS.theme,
    fontSize: DEFAULT_EDITOR_SETTINGS.fontSize,
    lineWrapping: DEFAULT_EDITOR_SETTINGS.lineWrapping,
    lineNumbers: DEFAULT_EDITOR_SETTINGS.lineNumbers,
  })

  const settings = ref<EditorSettings>({
    tabSize: DEFAULT_EDITOR_SETTINGS.tabSize,
    indentWithTab: true,
    autoCloseBrackets: true,
    highlightActiveLine: true,
  })

  // Getters
  const cursorPosition = computed(() => state.value.cursorPosition)
  const hasSelection = computed(() => state.value.selection !== undefined)
  const editorTheme = computed(() => state.value.theme)
  const fontSize = computed(() => state.value.fontSize)

  // Actions
  function setCursorPosition(line: number, column: number) {
    state.value.cursorPosition = { line, column }
  }

  function setSelection(start: { line: number; column: number }, end: { line: number; column: number }) {
    state.value.selection = { start, end }
  }

  function clearSelection() {
    state.value.selection = undefined
  }

  function setScrollPosition(position: number) {
    state.value.scrollPosition = position
  }

  function setTheme(theme: 'light' | 'dark') {
    state.value.theme = theme
  }

  function setFontSize(size: number) {
    if (size < 8 || size > 32) return
    state.value.fontSize = size
  }

  function increaseFontSize() {
    setFontSize(state.value.fontSize + 1)
  }

  function decreaseFontSize() {
    setFontSize(state.value.fontSize - 1)
  }

  function toggleLineWrapping() {
    state.value.lineWrapping = !state.value.lineWrapping
  }

  function toggleLineNumbers() {
    state.value.lineNumbers = !state.value.lineNumbers
  }

  function updateSettings(newSettings: Partial<EditorSettings>) {
    settings.value = {
      ...settings.value,
      ...newSettings,
    }
  }

  return {
    // State
    state,
    settings,

    // Getters
    cursorPosition,
    hasSelection,
    editorTheme,
    fontSize,

    // Actions
    setCursorPosition,
    setSelection,
    clearSelection,
    setScrollPosition,
    setTheme,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    toggleLineWrapping,
    toggleLineNumbers,
    updateSettings,
  }
})
