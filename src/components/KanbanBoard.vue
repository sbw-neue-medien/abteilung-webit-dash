<template>
  <div class="max-w-7xl mx-auto">

    <!-- Fixed header row: nav arrows + column labels -->
    <div class="flex items-center gap-1 mb-2">
      <button
        :class="canScrollLeft ? 'text-mid hover:text-hi' : 'invisible'"
        @click="scrollBy(-1)"
        class="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-surface ring-1 ring-line shadow-sm transition-colors"
        aria-label="Nach links scrollen"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <div ref="headerEl" class="flex-1 flex gap-2 overflow-x-hidden">
        <div v-for="col in columns" :key="col.status"
             class="flex-shrink-0 w-[19rem] flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="col.dot" />
            <h3 class="text-sm font-semibold text-hi">{{ col.label }}</h3>
            <span class="text-xs text-lo bg-lift rounded-full px-1.5">
              {{ tasksFor(col.status).length }}
            </span>
          </div>
          <button v-if="!readonly" @click="$emit('add', col.status)"
                  class="text-lo hover:text-brand-600 transition-colors" title="Aufgabe hinzufügen">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
      </div>

      <button
        :class="canScrollRight ? 'text-mid hover:text-hi' : 'invisible'"
        @click="scrollBy(1)"
        class="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-surface ring-1 ring-line shadow-sm transition-colors"
        aria-label="Nach rechts scrollen"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <!-- Scrollable card area (no column headers) -->
    <div
      ref="scrollEl"
      class="flex gap-2 overflow-x-auto pb-4 min-h-[60vh] snap-x snap-mandatory scrollbar-hide"
      @scroll.passive="onScroll"
    >
      <div v-for="col in columns" :key="col.status"
        class="flex-shrink-0 w-[19rem] flex flex-col gap-2 snap-center"
        @dragover.prevent
        @dragenter.prevent="onDragEnter(col.status)"
        @dragleave="dragOver = null"
        @drop="handleDrop($event, col.status)"
        :class="{ 'ring-2 ring-brand-500 ring-offset-2 ring-offset-bg rounded-xl': !readonly && dragOver === col.status }">

        <div class="flex flex-col gap-2 flex-1 rounded-xl p-2 bg-lift/60 min-h-[100px]">
          <KanbanCard
            v-for="task in tasksFor(col.status)"
            :key="task.id"
            :task="task"
            :readonly="readonly"
            @duplicate="$emit('duplicate', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @zoom="zoomedTask = $event"
          />
          <div v-if="tasksFor(col.status).length === 0"
               class="flex-1 flex items-center justify-center text-xs text-lo italic py-4">
            Leer
          </div>
        </div>
      </div>
    </div>

  </div>

  <TaskZoomModal :task="zoomedTask" @close="zoomedTask = null" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import KanbanCard from './KanbanCard.vue'
import TaskZoomModal from './TaskZoomModal.vue'

const props = defineProps({ tasks: Array, readonly: Boolean })
const emit  = defineEmits(['move', 'add', 'duplicate', 'edit', 'delete'])

const columns = [
  { status: 'offen',     label: 'Offen',    dot: 'bg-lo' },
  { status: 'in_arbeit', label: 'In Arbeit', dot: 'bg-amber-400' },
  { status: 'review',    label: 'Review',    dot: 'bg-blue-400' },
  { status: 'erledigt',  label: 'Erledigt',  dot: 'bg-brand-500' },
]

const dragOver   = ref(null)
const zoomedTask = ref(null)
const scrollEl   = ref(null)
const headerEl   = ref(null)
const canScrollLeft  = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = scrollEl.value
  if (!el) return
  canScrollLeft.value  = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

function onScroll() {
  updateScrollState()
  if (headerEl.value) headerEl.value.scrollLeft = scrollEl.value.scrollLeft
}

function scrollBy(dir) {
  const el = scrollEl.value
  if (!el) return
  const colWidth = 304 + 8 // w-[19rem] (304px) + gap-2 (8px)
  el.scrollBy({ left: dir * colWidth, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('resize', updateScrollState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollState)
})

function tasksFor(status) {
  return (props.tasks ?? []).filter(t => t.status === status)
}

function onDragEnter(status) {
  if (!props.readonly) dragOver.value = status
}

function handleDrop(e, status) {
  if (props.readonly) return
  const id = Number(e.dataTransfer.getData('taskId'))
  dragOver.value = null
  if (id) emit('move', id, status)
}
</script>
