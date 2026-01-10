<script setup lang="ts">
import { onMounted } from 'vue'
import { usePersistenceStore } from '@/stores/persistence'
import { useLayoutStore } from '@/stores/layout'
import { useAutoSave } from '@/composables/useAutoSave'
import AppToolbar from '@/components/toolbar/AppToolbar.vue'
import DiagramTabs from '@/components/tabs/DiagramTabs.vue'
import EditorLayout from '@/components/layout/EditorLayout.vue'

const persistenceStore = usePersistenceStore()
const layoutStore = useLayoutStore()

// Initialize auto-save (watches both tabs and layout changes)
useAutoSave()

onMounted(() => {
  // Load saved state from localStorage
  persistenceStore.loadFromLocalStorage()

  // Apply saved theme
  if (layoutStore.theme) {
    document.documentElement.setAttribute('data-theme', layoutStore.theme)
  }
})
</script>

<template>
  <div class="editor-view">
    <DiagramTabs />
    <AppToolbar />

    <EditorLayout>
      <template #default>
        <!-- This will be handled by the panels themselves -->
      </template>
    </EditorLayout>
  </div>
</template>

<style scoped>
.editor-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
