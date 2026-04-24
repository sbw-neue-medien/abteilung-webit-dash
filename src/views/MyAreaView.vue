<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">
    <h1 class="text-2xl font-bold text-slate-800">Mein Bereich</h1>

    <div class="card flex items-center gap-5">
      <div class="w-16 h-16 rounded-full bg-brand-100 text-brand-700 text-2xl font-bold flex items-center justify-center shrink-0">
        {{ auth.user?.name?.charAt(0) }}
      </div>
      <div class="flex-1">
        <h2 class="text-xl font-semibold text-slate-800">{{ auth.user?.name }}</h2>
        <p class="text-sm text-slate-500">{{ auth.user?.role === 'leiter' ? 'Abteilungsleiter' : 'Lernender' }}</p>
      </div>
      <button class="btn-secondary" @click="showPwModal = true">Passwort ändern</button>
    </div>

    <section>
      <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Meine Projekte</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <RouterLink v-for="p in projects.list" :key="p.id" :to="`/projekte/${p.id}`"
          class="card hover:shadow-md transition-shadow flex items-start justify-between gap-2 cursor-pointer">
          <div>
            <p class="font-semibold text-slate-800">{{ p.name }}</p>
            <p v-if="p.is_personal" class="text-xs text-brand-600 mt-0.5">Eigenprojekt</p>
          </div>
          <StatusBadge :status="p.status" />
        </RouterLink>
        <div v-if="!projects.list.length" class="col-span-2 text-center py-8 text-slate-400 italic">
          Keine Projekte zugewiesen.
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Meine Stunden</h2>
        <RouterLink to="/zeiterfassung" class="text-sm text-brand-600 hover:underline">Alle anzeigen →</RouterLink>
      </div>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="card text-center">
          <div class="text-2xl font-bold text-brand-600">{{ formatMin(weekMin) }}</div>
          <div class="text-xs text-slate-500 mt-1">Diese Woche</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-slate-700">{{ formatMin(monthMin) }}</div>
          <div class="text-xs text-slate-500 mt-1">Dieser Monat</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-slate-700">{{ recentEntries.length }}</div>
          <div class="text-xs text-slate-500 mt-1">Letzte Einträge</div>
        </div>
      </div>
      <div class="card overflow-hidden p-0">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Datum</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Projekt</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Dauer</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Tätigkeit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="e in recentEntries" :key="e.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 text-slate-600">{{ formatDate(e.date) }}</td>
              <td class="px-4 py-3 text-slate-600">{{ e.project_name }}</td>
              <td class="px-4 py-3 font-medium text-slate-800">{{ formatMin(e.duration_min) }}</td>
              <td class="px-4 py-3 text-slate-500 truncate max-w-xs">{{ e.description || '—' }}</td>
            </tr>
            <tr v-if="!recentEntries.length">
              <td colspan="4" class="px-4 py-6 text-center text-slate-400 italic">Noch keine Einträge.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Modal v-model="showPwModal" title="Passwort ändern">
      <form @submit.prevent="changePw" class="space-y-4">
        <div>
          <label class="label">Neues Passwort</label>
          <input v-model="pw" type="password" class="input" required autocomplete="new-password" />
        </div>
        <div class="flex gap-2 justify-end">
          <button type="button" class="btn-secondary" @click="showPwModal = false">Abbrechen</button>
          <button type="submit" class="btn-primary">Speichern</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useTimeEntriesStore } from '../stores/timeEntries.js'
import { api } from '../api/index.js'
import StatusBadge from '../components/StatusBadge.vue'
import Modal from '../components/Modal.vue'

const auth      = useAuthStore()
const projects  = useProjectsStore()
const timeStore = useTimeEntriesStore()

const showPwModal = ref(false)
const pw          = ref('')

const now        = new Date()
const today      = now.toISOString().slice(0, 10)
const monday     = (() => { const d = new Date(); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); return d.toISOString().slice(0, 10) })()
const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

onMounted(() => Promise.all([projects.fetchAll(), timeStore.fetchAll()]))

const recentEntries = computed(() => timeStore.list.slice(0, 10))
const weekMin  = computed(() => timeStore.list.filter(e => e.date >= monday && e.date <= today).reduce((s, e) => s + Number(e.duration_min), 0))
const monthMin = computed(() => timeStore.list.filter(e => e.date >= monthStart && e.date <= today).reduce((s, e) => s + Number(e.duration_min), 0))

async function changePw() {
  await api.updateUser(auth.user.id, { password: pw.value })
  pw.value = ''; showPwModal.value = false
}

function formatMin(min) { if (!min) return '0h'; const h = Math.floor(min / 60), m = min % 60; return m ? `${h}h ${m}min` : `${h}h` }
function formatDate(d) { return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
</script>
