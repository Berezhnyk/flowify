import { ref, onMounted, onUnmounted } from 'vue'
import mermaid from 'mermaid'
import type { MermaidConfig, ValidationError } from '@/types'
import { validateMermaidSyntax } from '@/utils/mermaid/validator'

export function useMermaid() {
  const isInitialized = ref(false)
  const error = ref<ValidationError | null>(null)
  const isRendering = ref(false)

  let mermaidInstance: typeof mermaid | null = null

  async function initialize(config?: MermaidConfig) {
    if (isInitialized.value) return

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: config?.theme || 'dark',
        securityLevel: 'loose',
        themeVariables: config?.themeVariables || {},
      })

      mermaidInstance = mermaid
      isInitialized.value = true
    } catch (err) {
      console.error('Failed to initialize Mermaid:', err)
      error.value = { message: 'Failed to initialize Mermaid renderer' }
    }
  }

  async function render(elementId: string, content: string): Promise<boolean> {
    if (!mermaidInstance) {
      await initialize()
    }

    error.value = null
    isRendering.value = true

    // Validate syntax first
    const validationError = validateMermaidSyntax(content)
    if (validationError) {
      error.value = validationError
      isRendering.value = false
      return false
    }

    try {
      const element = document.getElementById(elementId)
      if (!element) {
        error.value = { message: `Element #${elementId} not found` }
        isRendering.value = false
        return false
      }

      // Clear previous content
      element.innerHTML = ''

      // Render the diagram
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, content)
      element.innerHTML = svg

      isRendering.value = false
      return true
    } catch (err: any) {
      console.error('Mermaid render error:', err)
      error.value = {
        message: err?.message || 'Failed to render diagram',
      }
      isRendering.value = false
      return false
    }
  }

  function updateConfig(config: MermaidConfig) {
    // Re-initialize Mermaid with new config
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: config.theme || 'dark',
        securityLevel: 'loose',
        themeVariables: config.themeVariables || {},
      })
      mermaidInstance = mermaid
    } catch (err) {
      console.error('Failed to update Mermaid config:', err)
    }
  }

  function clearError() {
    error.value = null
  }

  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    mermaidInstance = null
    isInitialized.value = false
  })

  return {
    isInitialized,
    error,
    isRendering,
    initialize,
    render,
    updateConfig,
    clearError,
  }
}
