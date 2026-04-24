<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Zeiterfassung</h1>
      <button class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Eintragen
      </button>
    </div>

    <div class="card flex flex-wrap gap-4 items-end">
      <div><label class="label">Von</label><input v-model="filter.from" type="date" class="input w-40" /></div>
      <div><label class="label">Bis</label><input v-model="filter.to" type="date" class="input w-40" /></div>
      <div v-if="auth.isLeiter">
        <label class="label">Lernender</label>
        <select v-model="filter.user_id" class="input w-48">
          <option value="">Alle</option>
          <option v-for="u in learners" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">Projekt</label>
        <select v-model="filter.project_id" class="input w-48">
          <option value="">Alle</option>
          <option v-for="p in projects.list" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
      <button class="btn-secondary" @click="load">Anwenden</button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div class="card text-center">
        <div class="text-2xl font-bold text-brand-600">{{ formatMin(totalMin) }}</div>
        <div class="text-xs text-slate-500 mt-1">Gesamt</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-slate-700">{{ entries.length }}</div>
        <div class="text-xs text-slate-500 mt-1">Einträge</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-slate-700">{{ avgMin > 0 ? formatMin(avgMin) : '—' }}</div>
        <div class="text-xs text-slate-500 mt-1">Ø pro Tag</div>
      </div>
    </div>

    <div class="card overflow-hidden p-0">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-slate-600">Datum</th>
            <th v-if="auth.isLeiter" class="px-4 py-3 text-left font-medium text-slate-600">Person</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">Projekt</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">Dauer</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">Tätigkeit</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="e in entries" :key="e.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 text-slate-700">{{ formatDate(e.date) }}</td>
            <td v-if="auth.isLeiter" class="px-4 py-3 text-slate-600">{{ e.user_name }}</td>
            <td class="px-4 py-3 text-slate-600">{{ e.project_name }}</td>
            <td class="px-4 py-3 font-medium text-slate-800">{{ formatMin(e.duration_min) }}</td>
            <td class="px-4 py-3 text-slate-500 max-w-xs truncate">{{ e.description || '—' }}</td>
            <td class="px-4 py-3 flex gap-1 justify-end">
              <button v-if="canEdit(e)" class="btn btn-sm btn-secondary" @click="openEdit(e)">Bearbeiten</button>
              <button v-if="canEdit(e)" class="btn btn-sm btn-danger" @click="remove(e.id)">Löschen</button>
            </td>
          </tr>
          <tr v-if="!entries.length">
            <td :colspan="auth.isLeiter ? 6 : 5" class="px-4 py-8 text-center text-slate-400 italic">Keine Einträge.</td>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useUsersStore } from '../stores/users.js'
import { useTimeEntriesStore } from '../stores/timeEntries.js'
import Modal from '../components/Modal.vue'
import TimeEntryForm from '../components/TimeEntryForm.vue'

const auth       = useAuthStore()
const projects   = useProjectsStore()
const usersStore = useUsersStore()
const timeStore  = useTimeEntriesStore()

const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)

const today  = new Date().toISOString().slice(0, 10)
const monday = (() => { const d = new Date(); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); return d.toISOString().slice(0, 10) })()

const filter   = ref({ from: monday, to: today, user_id: '', project_id: '' })
const entries  = computed(() => timeStore.list)
const learners = computed(() => usersStore.list.filter(u => u.role === 'lernender'))
const totalMin = computed(() => entries.value.reduce((s, e) => s + Number(e.duration_min), 0))
const avgMin   = computed(() => { const days = new Set(entries.value.map(e => e.date)).size; return days ? Math.round(totalMin.value / days) : 0 })

function canEdit(e) { return auth.isLeiter || e.user_id === auth.user?.id }

onMounted(async () => { await Promise.all([projects.fetchAll(), usersStore.fetchAll()]); await load() })

async function load() {
  const params = Object.fromEntries(Object.entries(filter.value).filter(([, v]) => v !== ''))
  await timeStore.fetchAll(params)
}

function openCreate() { editing.value = null; showModal.value = true }
function openEdit(e)  { editing.value = e;    showModal.value = true }

async function save(body) {
  saving.value = true
  try {
    if (editing.value) await timeStore.update(editing.value.id, body)
    else               await timeStore.create(body)
    showModal.value = false
  } finally { saving.value = false }
}

async function remove(id) {
  if (!confirm('Eintrag wirklich löschen?')) return
  await timeStore.remove(id)
}

function formatMin(min) { if (!min) return '0h'; const h = Math.floor(min / 60), m = min % 60; return m ? `${h}h ${m}min` : `${h}h` }
function formatDate(d) { return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
</script>
