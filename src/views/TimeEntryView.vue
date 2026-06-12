<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-hi">Zeiterfassung</h1>
      <button v-if="auth.can('time_entries.create')" class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Eintragen
      </button>
    </div>

    <div class="card flex flex-wrap gap-4 items-end">
      <PeriodSelector @change="onPeriodChange" />

      <div v-if="auth.can('time_entries.read_all')">
        <label class="label">Lernpartner</label>
        <select v-model="filter.user_id" class="input w-48">
          <option value="">Alle</option>
          <option v-for="u in learners" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">Projekt</label>
        <ProjectSelect v-model="filter.project_id" :projects="projects.list" placeholder="Alle" class="w-48" />
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div class="card text-center">
        <div class="text-2xl font-bold text-brand-600">{{ formatMin(totalMin) }}</div>
        <div class="text-xs text-lo mt-1">Gesamt</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-hi">{{ entries.length }}</div>
        <div class="text-xs text-lo mt-1">Einträge</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-hi">{{ avgMin > 0 ? formatMin(avgMin) : '—' }}</div>
        <div class="text-xs text-lo mt-1">Ø pro Tag</div>
      </div>
    </div>

    <div class="card overflow-x-auto p-0">
      <table class="min-w-full w-full table-fixed text-sm">
        <thead class="bg-lift border-b border-line">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-mid w-28">Datum</th>
            <th v-if="auth.can('time_entries.read_all')" class="px-4 py-3 text-left font-medium text-mid w-32">Person</th>
            <th class="px-4 py-3 text-left font-medium text-mid w-64">Projekt / Aufgabe</th>
            <th class="px-4 py-3 text-left font-medium text-mid w-28">Dauer</th>
            <th class="px-4 py-3 text-left font-medium text-mid">Tätigkeit</th>
            <th class="px-4 py-3 w-16"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-groove">
          <tr v-for="e in entries" :key="e.id" class="hover:bg-lift transition-colors">
            <td class="px-4 py-3 text-mid">{{ formatDate(e.date) }}</td>
            <td v-if="auth.can('time_entries.read_all')" class="px-4 py-3 text-mid">{{ e.user_name }}</td>
            <td class="px-4 py-3">
              <RouterLink :to="`/projekte/${e.project_id}`" class="text-mid hover:text-brand-600 hover:underline">{{ e.project_name }}</RouterLink>
              <span v-if="e.task_title" class="block text-xs text-lo mt-0.5">{{ e.task_title }}</span>
            </td>
            <td class="px-4 py-3 font-medium">
              <span v-if="Number(e.duration_min) === 0"
                class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ausstehend
              </span>
              <span v-else class="text-hi">{{ formatMin(e.duration_min) }}</span>
            </td>
            <td class="px-4 py-3 text-mid">
              <div class="max-w-md truncate">{{ e.description || '—' }}</div>
            </td>
            <td class="px-4 py-3 flex gap-1 justify-end">
              <template v-if="canEdit(e)">
                <button class="btn btn-sm btn-secondary" @click="openEdit(e)">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                  </svg>
                </button>
                <ConfirmButton class="btn btn-sm btn-danger" label="Eintrag wirklich löschen?" @confirm="remove(e.id)">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </ConfirmButton>
              </template>
            </td>
          </tr>
          <tr v-if="!entries.length">
            <td :colspan="(auth.can('time_entries.read_all')) ? 6 : 5" class="px-4 py-8 text-center text-lo italic">Keine Einträge.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-model="showModal" :title="editing ? 'Eintrag bearbeiten' : 'Zeit eintragen'">
      <TimeEntryForm :projects="projects.list" :entry="editing" :loading="saving"
        @submit="save" @cancel="showModal = false" />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useUsersStore } from '../stores/users.js'
import { useTimeEntriesStore } from '../stores/timeEntries.js'
import { useSprintsStore } from '../stores/sprints.js'
import ConfirmButton from '../components/ConfirmButton.vue'
import Modal from '../components/Modal.vue'
import TimeEntryForm from '../components/TimeEntryForm.vue'
import PeriodSelector from '../components/PeriodSelector.vue'
import ProjectSelect from '../components/ProjectSelect.vue'

const route      = useRoute()
const auth       = useAuthStore()
const projects   = useProjectsStore()
const usersStore = useUsersStore()
const timeStore  = useTimeEntriesStore()
const sprints    = useSprintsStore()

const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)

function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const today      = localDate()
const monday     = (() => { const d = new Date(); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); return localDate(d) })()

const filter   = ref({ from: monday, to: today, user_id: '', project_id: route.query.project_id ?? '' })
const entries  = computed(() => timeStore.list)
const learners = computed(() => usersStore.list.filter(u => u.role === 'lernender' && u.active))
const totalMin = computed(() => entries.value.reduce((s, e) => s + Number(e.duration_min), 0))
const avgMin   = computed(() => { const days = new Set(entries.value.map(e => e.date)).size; return days ? Math.round(totalMin.value / days) : 0 })

function canEdit(e) { return auth.can('time_entries.update_all') || (auth.can('time_entries.update_own') && e.user_id === auth.user?.id) }

onMounted(async () => {
  const calls = [projects.fetchAll(), sprints.fetchAll()]
  if (auth.can('time_entries.read_all')) calls.push(usersStore.fetchAll())
  await Promise.all(calls)
  await load()
  watch(filter, load, { deep: true })
})

async function load() {
  const params = Object.fromEntries(Object.entries(filter.value).filter(([, v]) => v !== ''))
  await timeStore.fetchAll(params)
}

function openCreate() { editing.value = null; showModal.value = true }
function openEdit(e) { editing.value = e; showModal.value = true }

async function save(body) {
  saving.value = true
  try {
    if (editing.value) await timeStore.update(editing.value.id, body)
    else               await timeStore.create(body)
    showModal.value = false
  } finally { saving.value = false }
}

async function remove(id) {
  await timeStore.remove(id)
}

async function onPeriodChange({ from, to } = {}) {
  filter.value.from = from
  filter.value.to = to
  await load();
}
function formatMin(min) { if (!min) return '0h'; const h = Math.floor(min / 60), m = min % 60; return m ? `${h}h ${m}min` : `${h}h` }
function formatDate(d) { return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
</script>
