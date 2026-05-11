<template>
  <Teleport to="body">
    <div v-if="task" class="fixed inset-0 z-50 flex sm:items-center sm:justify-center"
         @keydown.esc.window="$emit('close')">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

      <!-- Mobile: fullscreen panel; Desktop: constrained centered panel -->
      <div class="relative z-10 w-full h-full sm:h-auto overflow-y-auto
                  bg-surface p-6
                  sm:rounded-2xl sm:shadow-xl sm:ring-1 sm:ring-line
                  sm:max-w-[800px] sm:mx-[25px] sm:max-h-[calc(100vh-50px)]">

        <!-- Header -->
        <div class="flex items-start justify-between gap-4 mb-5">
          <h2 class="text-xl font-semibold text-hi leading-snug">{{ task.title }}</h2>
          <button @click="$emit('close')"
                  class="shrink-0 text-lo hover:text-mid transition-colors mt-0.5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Meta row -->
        <div class="flex flex-wrap gap-2 mb-5">
          <!-- Status -->
          <span class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ring-1 ring-line bg-lift text-mid">
            <span class="w-2 h-2 rounded-full" :class="statusDot" />
            {{ statusLabel }}
          </span>

          <!-- Sprint -->
          <span v-if="task.sprint_name"
                class="inline-flex items-center gap-1 text-xs bg-brand-subtle text-brand-700 px-2 py-1 rounded-full">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            {{ task.sprint_name }}
          </span>
        </div>

        <!-- Assignee + time -->
        <div class="flex flex-wrap items-center gap-4 mb-5">
          <div v-if="task.assignee_name" class="flex items-center gap-2">
            <UserAvatar :userId="task.assignee_id" :name="task.assignee_name"
                        :hasAvatar="task.assignee_avatar" size="sm" />
            <span class="text-sm text-mid">{{ task.assignee_name }}</span>
          </div>

          <div v-if="task.planned_duration_min || Number(task.actual_duration_min) > 0"
               class="flex items-center gap-1.5 text-sm">
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

        <!-- Description -->
        <MarkdownRenderer v-if="task.description" :content="task.description"
                          class="text-sm text-mid prose-sm max-w-none" />
        <p v-else class="text-sm text-lo italic">Keine Beschreibung</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import UserAvatar from './UserAvatar.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

const props = defineProps({ task: Object })
defineEmits(['close'])

const STATUS_LABELS = {
  offen:     { label: 'Offen',     dot: 'bg-lo' },
  in_arbeit: { label: 'In Arbeit', dot: 'bg-amber-400' },
  review:    { label: 'Review',    dot: 'bg-blue-400' },
  erledigt:  { label: 'Erledigt',  dot: 'bg-brand-500' },
}

const statusLabel = computed(() => STATUS_LABELS[props.task?.status]?.label ?? props.task?.status)
const statusDot   = computed(() => STATUS_LABELS[props.task?.status]?.dot ?? 'bg-lo')

const overtime = computed(() => {
  const planned = Number(props.task?.planned_duration_min)
  const actual  = Number(props.task?.actual_duration_min)
  return planned > 0 && actual > planned
})

function formatMin(min) {
  const m = Number(min)
  if (!m) return ''
  const h = Math.floor(m / 60)
  const r = m % 60
  return h ? (r ? `${h}h ${r}min` : `${h}h`) : `${r}min`
}
</script>
