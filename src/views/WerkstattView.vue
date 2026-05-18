<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h1 class="text-2xl font-bold text-hi">Werkstatt-Übersicht</h1>

      <!-- Filter -->
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

        <!-- Sprint navigation -->
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

        <template v-if="mode === 'range'">
          <input type="date" v-model="from" class="input text-sm py-1" @change="load" />
          <span class="text-lo text-sm">–</span>
          <input type="date" v-model="to" class="input text-sm py-1" @change="load" />
        </template>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-lo italic">Laden…</div>

    <div v-else-if="!rows.length" class="text-center py-12 text-lo italic">
      Keine Lernpartner erfasst.
    </div>

    <div v-else class="overflow-x-auto rounded-xl ring-1 ring-line">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-groove bg-lift">
            <th class="text-left px-4 py-3 font-medium text-mid">Lernpartner</th>
            <th class="text-center px-4 py-3 font-medium text-mid">Aktive Projekte</th>
            <th class="text-center px-4 py-3 font-medium text-mid">Offen / In Arbeit</th>
            <th class="text-center px-4 py-3 font-medium text-mid">Review / Erledigt</th>
            <th class="text-center px-4 py-3 font-medium text-mid">Stunden</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-groove">
          <tr v-for="r in rows" :key="r.id" class="hover:bg-lift transition-colors">
            <!-- Name + Avatar -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <UserAvatar :userId="r.id" :name="r.name" :hasAvatar="r.avatar" size="sm" />
                <div>
                  <p class="font-medium text-hi">{{ r.name }}</p>
                  <p class="text-xs text-lo">{{ r.email }}</p>
                </div>
              </div>
            </td>

            <!-- Active projects -->
            <td class="px-4 py-3 text-center">
              <span class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-semibold bg-lift ring-1 ring-line text-mid">
                {{ r.active_project_count }}
              </span>
            </td>

            <!-- Sprint open/in-progress -->
            <td class="px-4 py-3 text-center">
              <span v-if="r.sprint_open === null" class="text-lo">–</span>
              <span v-else class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="r.sprint_open > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-lift ring-1 ring-line text-lo'">
                {{ r.sprint_open }}
              </span>
            </td>

            <!-- Sprint review/done -->
            <td class="px-4 py-3 text-center">
              <span v-if="r.sprint_done === null" class="text-lo">–</span>
              <span v-else class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="r.sprint_done > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-lift ring-1 ring-line text-lo'">
                {{ r.sprint_done }}
              </span>
            </td>

            <!-- Declared hours -->
            <td class="px-4 py-3 text-center">
              <span class="font-medium text-hi">{{ r.declared_hours }}</span>
              <span class="text-lo ml-0.5">h</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api/index.js'
import { useSprintsStore } from '../stores/sprints.js'
import UserAvatar from '../components/UserAvatar.vue'

const loading = ref(true)
const rows    = ref([])
const mode    = ref('current')
const from    = ref('')
const to      = ref('')

const sprints     = useSprintsStore()
const sprintIndex = ref(0)
const currentSprint = computed(() => sprints.list[sprintIndex.value] ?? null)

async function load() {
  loading.value = true
  try {
    let params = {}
    if (mode.value === 'range' && from.value && to.value) {
      params = { from: from.value, to: to.value }
    } else if (mode.value === 'current' && currentSprint.value) {
      params = { from: currentSprint.value.start_date, to: currentSprint.value.end_date }
    }
    rows.value = await api.getWerkstattStats(params)
  } finally {
    loading.value = false
  }
}

function stepSprint(dir) {
  const next = sprintIndex.value + dir
  if (next < 0 || next >= sprints.list.length) return
  sprintIndex.value = next
  load()
}

function setMode(m) {
  mode.value = m
  if (m === 'current') load()
}

onMounted(async () => {
  await sprints.fetchAll()
  // default to current sprint (last one whose start_date <= today)
  const today = new Date().toISOString().slice(0, 10)
  const idx = sprints.list.findLastIndex(s => s.start_date <= today)
  sprintIndex.value = idx >= 0 ? idx : 0
  load()
})
</script>
