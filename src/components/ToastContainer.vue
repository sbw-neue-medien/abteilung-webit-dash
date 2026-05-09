<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="[
            'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm',
            t.type === 'success' ? 'bg-emerald-900/90 text-emerald-100 ring-1 ring-emerald-700' :
            t.type === 'info'    ? 'bg-surface text-hi ring-1 ring-line' :
                                   'bg-red-900/90 text-red-100 ring-1 ring-red-700'
          ]">
          <span class="flex-1">{{ t.message }}</span>
          <button class="opacity-60 hover:opacity-100 leading-none" @click="remove(t.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from  { opacity: 0; transform: translateY(8px); }
.toast-leave-to    { opacity: 0; transform: translateY(8px); }
</style>
