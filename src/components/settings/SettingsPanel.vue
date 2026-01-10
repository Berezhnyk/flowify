<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import AISettingsPanel from './AISettingsPanel.vue'

const layoutStore = useLayoutStore()
</script>

<template>
  <div class="settings-panel">
    <div class="settings-section">
      <AISettingsPanel />
    </div>

    <div class="settings-section">
      <h3 class="section-title">Display</h3>

      <div class="setting-item">
        <label class="setting-label">
          <input
            type="checkbox"
            :checked="layoutStore.isGridVisible"
            @change="layoutStore.toggleGrid()"
          />
          <span>Show grid background</span>
        </label>
        <p class="setting-description">
          Display a grid pattern in the diagram preview area
        </p>
      </div>

      <div v-if="layoutStore.isGridVisible" class="setting-item">
        <label class="setting-label">
          <span>Grid size: {{ layoutStore.currentGridSize }}px</span>
        </label>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          :value="layoutStore.currentGridSize"
          @input="layoutStore.setGridSize(Number(($event.target as HTMLInputElement).value))"
          class="slider"
        />
        <p class="setting-description">
          Adjust the grid spacing (10-100 pixels)
        </p>
      </div>

      <div class="setting-item">
        <label class="setting-label">
          <span>Theme</span>
        </label>
        <button class="theme-button" @click="layoutStore.toggleTheme()">
          {{ layoutStore.currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light' }}
        </button>
        <p class="setting-description">
          Switch between light and dark theme
        </p>
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">Panels</h3>

      <div class="setting-item">
        <label class="setting-label">
          <input
            type="checkbox"
            :checked="layoutStore.isLeftPanelVisible"
            @change="layoutStore.togglePanel('leftPanel')"
          />
          <span>Show left panel</span>
        </label>
      </div>

      <div class="setting-item">
        <label class="setting-label">
          <input
            type="checkbox"
            :checked="layoutStore.isRightPanelVisible"
            @change="layoutStore.togglePanel('rightPanel')"
          />
          <span>Show right panel</span>
        </label>
      </div>

      <div class="setting-item">
        <label class="setting-label">
          <input
            type="checkbox"
            :checked="layoutStore.isBottomPanelVisible"
            @change="layoutStore.togglePanel('bottomPanel')"
          />
          <span>Show bottom panel</span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">Layout</h3>

      <button class="reset-button" @click="layoutStore.resetLayout()">
        Reset Layout
      </button>
      <p class="setting-description">
        Reset all panel sizes and visibility to defaults
      </p>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  padding: var(--spacing-md);
  overflow-y: auto;
}

.settings-section {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.setting-item {
  margin-bottom: var(--spacing-md);
}

.setting-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
}

.setting-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.setting-description {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.theme-button {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-top: var(--spacing-xs);
  background-color: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.theme-button:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.reset-button {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.reset-button:hover {
  background-color: var(--color-error);
  color: white;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin: var(--spacing-xs) 0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.slider::-webkit-slider-thumb:hover {
  background: var(--color-primary-hover);
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.slider::-moz-range-thumb:hover {
  background: var(--color-primary-hover);
  transform: scale(1.1);
}
</style>
