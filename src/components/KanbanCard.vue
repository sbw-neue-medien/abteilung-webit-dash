<template>
  <div
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    class="bg-surface rounded-lg shadow-sm ring-1 ring-line p-3 cursor-grab active:cursor-grabbing
           hover:shadow-md transition-shadow select-none"
    :class="{ 'opacity-50 scale-95': dragging }"
  >
    <div class="flex items-start justify-between gap-2">
      <p class="text-sm font-medium text-hi leading-snug">{{ task.title }}</p>
      <div class="flex gap-1 shrink-0">
        <button @click.stop="$emit('edit', task)"
                class="text-lo hover:text-brand-600 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button @click.stop="$emit('delete', task.id)"
                class="text-lo hover:text-red-500 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
    <p v-if="task.description" class="mt-1 text-xs text-mid line-clamp-2">{{ task.description }}</p>
    <div v-if="task.assignee_name" class="mt-2 flex items-center gap-1">
      <div class="w-5 h-5 rounded-full bg-brand-subtle text-brand-600 text-xs flex items-center justify-center font-medium">
        {{ task.assignee_name.charAt(0) }}
      </div>
      <span class="text-xs text-mid">{{ task.assignee_name }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ task: Object })
defineEmits(['edit', 'delete'])

const dragging = ref(false)

function onDragStart(e) {
  dragging.value = true
  e.dataTransfer.setData('taskId', String(props.task.id))
  e.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  dragging.value = false
}
</script>
