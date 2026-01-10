import { ref, watch, onUnmounted } from 'vue'
import { usePersistenceStore } from '@/stores/persistence'
import { useTabsStore } from '@/stores/tabs'
import { useLayoutStore } from '@/stores/layout'
import { AUTO_SAVE_DELAY } from '@/utils/constants'

export function useAutoSave() {
  const persistenceStore = usePersistenceStore()
  const tabsStore = useTabsStore()
  const layoutStore = useLayoutStore()

  const isEnabled = ref(true)
  const isSaving = ref(false)
  const lastSaveTime = ref<Date | null>(null)

  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  function debouncedSave() {
    if (!isEnabled.value) return

    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = setTimeout(() => {
      save()
    }, AUTO_SAVE_DELAY)
  }

  function save() {
    if (!isEnabled.value) return

    isSaving.value = true

    const success = persistenceStore.saveToLocalStorage()

    if (success) {
      lastSaveTime.value = new Date()
    }

    isSaving.value = false
  }

  function enable() {
    isEnabled.value = true
  }

  function disable() {
    isEnabled.value = false
  }

  function toggle() {
    isEnabled.value = !isEnabled.value
  }

  // Watch for changes to any tab
  const stopWatchingTabs = watch(
    () => tabsStore.tabs,
    () => {
      if (isEnabled.value) {
        debouncedSave()
      }
    },
    { deep: true }
  )

  // Watch for changes to layout (panel visibility, sizes, collapsed state, theme, etc.)
  const stopWatchingLayout = watch(
    () => [
      layoutStore.panelSizes,
      layoutStore.visibility,
      layoutStore.collapsed,
      layoutStore.theme,
      layoutStore.showGrid,
      layoutStore.gridSize,
    ],
    () => {
      if (isEnabled.value) {
        debouncedSave()
      }
    },
    { deep: true }
  )

  onUnmounted(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    stopWatchingTabs()
    stopWatchingLayout()
  })

  return {
    isEnabled,
    isSaving,
    lastSaveTime,
    save,
    enable,
    disable,
    toggle,
  }
}
