import { saveAs } from 'file-saver'
import type { Diagram } from '@/types'
import { FILE_EXTENSIONS } from '@/utils/constants'

export function useFileOperations() {
  function exportToMermaid(diagram: Diagram): void {
    const blob = new Blob([diagram.content], { type: 'text/plain;charset=utf-8' })
    const filename = `${diagram.metadata.title.replace(/\s+/g, '_')}${FILE_EXTENSIONS.MERMAID}`
    saveAs(blob, filename)
  }

  function exportToJSON(diagram: Diagram): void {
    const data = {
      ...diagram,
      createdAt: diagram.createdAt.toISOString(),
      updatedAt: diagram.updatedAt.toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const filename = `${diagram.metadata.title.replace(/\s+/g, '_')}${FILE_EXTENSIONS.JSON}`
    saveAs(blob, filename)
  }

  async function importFromFile(file: File): Promise<Diagram | null> {
    try {
      const text = await file.text()

      if (file.name.endsWith(FILE_EXTENSIONS.MERMAID)) {
        // Import as Mermaid file
        return {
          id: crypto.randomUUID(),
          type: 'classDiagram' as any,
          content: text,
          metadata: {
            title: file.name.replace(FILE_EXTENSIONS.MERMAID, ''),
            description: '',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      if (file.name.endsWith(FILE_EXTENSIONS.JSON)) {
        // Import as JSON file
        const data = JSON.parse(text)
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        }
      }

      throw new Error('Unsupported file format')
    } catch (error) {
      console.error('Error importing file:', error)
      return null
    }
  }

  function downloadFile(content: string, filename: string, mimeType = 'text/plain'): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    saveAs(blob, filename)
  }

  async function openFilePicker(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.mmd,.json'

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        resolve(file || null)
      }

      input.oncancel = () => {
        resolve(null)
      }

      input.click()
    })
  }

  return {
    exportToMermaid,
    exportToJSON,
    importFromFile,
    downloadFile,
    openFilePicker,
  }
}
