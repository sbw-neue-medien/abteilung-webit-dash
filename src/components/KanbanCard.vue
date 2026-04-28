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

    <!-- Sprint badge -->
    <div v-if="task.sprint_name" class="mt-2">
      <span class="inline-flex items-center gap-1 text-xs bg-brand-subtle text-brand-700 px-1.5 py-0.5 rounded">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        {{ task.sprint_name }}
      </span>
    </div>

    <!-- Time and assignee row -->
    <div class="mt-2 flex items-center justify-between gap-2 flex-wrap">
      <div v-if="task.assignee_name" class="flex items-center gap-1">
        <UserAvatar :userId="task.assignee_id" :name="task.assignee_name"
                    :hasAvatar="task.assignee_avatar" size="sm" />
        <span class="text-xs text-mid">{{ task.assignee_name }}</span>
      </div>
      <div v-else class="flex-1" />

      <!-- Planned / actual time -->
      <div v-if="task.planned_duration_min || Number(task.actual_duration_min) > 0"
           class="flex items-center gap-1 text-xs">
        <span v-if="task.planned_duration_min" class="text-lo" title="Geplante Zeit">
          {{ formatMin(task.planned_duration_min) }}
        </span>
        <template v-if="task.planned_duration_min && Number(task.actual_duration_min) > 0">
          <span class="text-lo">/</span>
        </template>
        <span v-if="Number(task.actual_duration_min) > 0"
              :class="overtime ? 'text-red-500' : 'text-brand-600'"
              title="Effektive Zeit">
          {{ formatMin(task.actual_duration_min) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UserAvatar from './UserAvatar.vue'

const props = defineProps({ task: Object })
defineEmits(['edit', 'delete'])

const dragging = ref(false)

const overtime = computed(() => {
  const planned = Number(props.task.planned_duration_min)
  const actual  = Number(props.task.actual_duration_min)
  return planned > 0 && actual > planned
})

function formatMin(min) {
  const m = Number(min)
  if (!m) return ''
  const h = Math.floor(m / 60)
  const r = m % 60
  return h ? (r ? `${h}h ${r}min` : `${h}h`) : `${r}min`
}

function onDragStart(e) {
  dragging.value = true
  e.dataTransfer.setData('taskId', String(props.task.id))
  e.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  dragging.value = false
}
</script>
