import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue)
  const error = ref<Error | null>(null)

  function load(): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        data.value = parsed
        return parsed
      }
      return null
    } catch (err) {
      console.error(`Error loading from localStorage (${key}):`, err)
      error.value = err as Error
      return null
    }
  }

  function save(value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      data.value = value
      error.value = null
      return true
    } catch (err) {
      console.error(`Error saving to localStorage (${key}):`, err)
      error.value = err as Error
      return false
    }
  }

  function remove(): boolean {
    try {
      localStorage.removeItem(key)
      data.value = defaultValue
      error.value = null
      return true
    } catch (err) {
      console.error(`Error removing from localStorage (${key}):`, err)
      error.value = err as Error
      return false
    }
  }

  function clear(): boolean {
    try {
      localStorage.clear()
      data.value = defaultValue
      error.value = null
      return true
    } catch (err) {
      console.error('Error clearing localStorage:', err)
      error.value = err as Error
      return false
    }
  }

  // Auto-save on data change
  function enableAutoSave() {
    watch(data, (newValue) => {
      save(newValue)
    }, { deep: true })
  }

  // Load initial value
  load()

  return {
    data,
    error,
    load,
    save,
    remove,
    clear,
    enableAutoSave,
  }
}
