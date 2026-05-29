<template>
  <div class="flex items-center gap-3 flex-wrap">
    <div class="flex rounded-md ring-1 ring-line overflow-hidden text-sm">
      <button
        class="px-3 py-1.5 transition-colors"
        :class="mode === 'current' ? 'bg-brand-subtle text-brand-600 font-medium' : 'bg-surface text-mid hover:text-hi'"
        @click="setMode('current')">
        Sprint
      </button>
      <button
        class="px-3 py-1.5 border-l border-groove transition-colors"
        :class="mode === 'range' ? 'bg-brand-subtle text-brand-600 font-medium' : 'bg-surface text-mid hover:text-hi'"
        @click="setMode('range')">
        Zeitraum
      </button>
    </div>

    <template v-if="mode === 'current'">
      <div class="flex items-center gap-1">
        <button
          class="p-1 rounded text-mid hover:text-hi hover:bg-lift transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="sprintIndex <= 0"
          @click="stepSprint(-1)"
          title="Vorheriger Sprint">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="text-sm text-mid px-1 min-w-[8rem] text-center">
          {{ currentSprint ? currentSprint.name : '–' }}
        </span>
        <button
          class="p-1 rounded text-mid hover:text-hi hover:bg-lift transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="sprintIndex >= sprints.list.length - 1"
          @click="stepSprint(1)"
          title="Nächster Sprint">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </template>

    <div v-if="mode === 'range'" class="flex items-center gap-2">
      <input type="date" v-model="from" class="input text-sm py-1" @change="emitChange" />
      <span class="text-lo text-sm">–</span>
      <input type="date" v-model="to" class="input text-sm py-1" @change="emitChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSprintsStore } from '../stores/sprints.js'

const emit = defineEmits(['change'])

const mode = ref('current')
const from = ref('')
const to   = ref('')

const sprints     = useSprintsStore()
const sprintIndex = ref(0)
const currentSprint = computed(() => sprints.list[sprintIndex.value] ?? null)

function emitChange() {
  if (mode.value === 'range') {
    if (from.value && to.value) emit('change', { from: from.value, to: to.value })
  } else if (currentSprint.value) {
    emit('change', { from: currentSprint.value.start_date, to: currentSprint.value.end_date })
  } else {
    emit('change', {})
  }
}

function stepSprint(dir) {
  const next = sprintIndex.value + dir
  if (next < 0 || next >= sprints.list.length) return
  sprintIndex.value = next
  emitChange()
}

function setMode(m) {
  mode.value = m
  if (m === 'current') emitChange()
}

onMounted(async () => {
  await sprints.fetchAll()
  const today = new Date().toISOString().slice(0, 10)
  const idx = sprints.list.findLastIndex(s => s.start_date <= today)
  sprintIndex.value = idx >= 0 ? idx : 0
  emitChange()
})
</script>
