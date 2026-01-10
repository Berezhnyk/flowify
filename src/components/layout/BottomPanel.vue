<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import ChatPanel from '@/components/chat/ChatPanel.vue'

const chatStore = useChatStore()
</script>

<template>
  <div class="panel bottom-panel">
    <div class="panel-header">
      <span>AI Assistant</span>
      <span class="message-count">{{ chatStore.messageHistory.length }} messages</span>
    </div>
    <div class="panel-content">
      <ChatPanel />
    </div>
  </div>
</template>

<style scoped>
.bottom-panel {
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
