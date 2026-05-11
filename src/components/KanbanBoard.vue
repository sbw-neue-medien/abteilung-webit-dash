<template>
  <div class="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
    <div v-for="col in columns" :key="col.status"
      class="flex-shrink-0 w-60 flex flex-col gap-2"
      @dragover.prevent
      @dragenter.prevent="onDragEnter(col.status)"
      @dragleave="dragOver = null"
      @drop="handleDrop($event, col.status)"
      :class="{ 'ring-2 ring-brand-500 ring-offset-2 ring-offset-bg rounded-xl': !readonly && dragOver === col.status }">

      <div class="flex items-center justify-between px-1">
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

  <TaskZoomModal :task="zoomedTask" @close="zoomedTask = null" />
</template>

<script setup>
import { ref } from 'vue'
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

const dragOver  = ref(null)
const zoomedTask = ref(null)

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
