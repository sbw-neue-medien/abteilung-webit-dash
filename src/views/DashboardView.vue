<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <h1 class="text-2xl font-bold text-hi">Dashboard</h1>

    <section>
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">Projekte</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="s in statusStats" :key="s.status" class="card text-center">
          <div class="text-3xl font-bold" :class="s.color">{{ s.count }}</div>
          <div class="text-xs text-lo mt-1">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">Stunden diese Woche</h2>
      <div v-if="auth.isLeiter" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div v-for="row in weekReport" :key="row.user_id" class="card text-center">
          <div class="w-9 h-9 rounded-full bg-brand-subtle text-brand-600 font-bold text-sm mx-auto flex items-center justify-center mb-2">
            {{ row.user_name.charAt(0) }}
          </div>
          <div class="text-sm font-semibold text-hi">{{ formatMin(row.total_min) }}</div>
          <div class="text-xs text-lo truncate">{{ row.user_name }}</div>
        </div>
        <div v-if="!weekReport.length" class="col-span-full text-lo text-sm italic">
          Noch keine Einträge diese Woche.
        </div>
      </div>
      <div v-else class="card max-w-xs">
        <div class="text-3xl font-bold text-brand-600">{{ formatMin(myWeekMin) }}</div>
        <div class="text-sm text-mid mt-1">{{ myWeekEntries }} Einträge diese Woche</div>
      </div>
    </section>

    <section>
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">
        {{ auth.isLeiter ? 'Projektübersicht' : 'Meine Projekte' }}
      </h2>
      <div class="card overflow-hidden p-0">
        <table class="min-w-full text-sm">
          <thead class="bg-lift border-b border-line">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-mid">Projekt</th>
              <th class="px-4 py-3 text-left font-medium text-mid">Status</th>
              <th class="px-4 py-3 text-left font-medium text-mid">Kunde</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-groove">
            <tr v-for="p in projects.list" :key="p.id"
                class="hover:bg-lift cursor-pointer transition-colors"
                @click="router.push(`/projekte/${p.id}`)">
              <td class="px-4 py-3 font-medium text-hi">{{ p.name }}</td>
              <td class="px-4 py-3"><StatusBadge :status="p.status" /></td>
              <td class="px-4 py-3 text-mid">{{ p.client || '—' }}</td>
            </tr>
            <tr v-if="!projects.list.length">
              <td colspan="3" class="px-4 py-6 text-center text-lo italic">Noch keine Projekte.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useTimeEntriesStore } from '../stores/timeEntries.js'
import StatusBadge from '../components/StatusBadge.vue'

const auth      = useAuthStore()
const projects  = useProjectsStore()
const timeStore = useTimeEntriesStore()
const router    = useRouter()

const monday = (() => {
  const d = new Date(); const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1); return d.toISOString().slice(0, 10)
})()
const today = new Date().toISOString().slice(0, 10)

onMounted(() => Promise.all([
  projects.fetchAll(),
  timeStore.fetchReport({ from: monday, to: today }),
]))

const statusStats = computed(() => [
  { status: 'geplant',       label: 'Geplant',       color: 'text-lo',          count: projects.list.filter(p => p.status === 'geplant').length },
  { status: 'aktiv',         label: 'Aktiv',         color: 'text-emerald-500', count: projects.list.filter(p => p.status === 'aktiv').length },
  { status: 'pausiert',      label: 'Pausiert',       color: 'text-amber-500',   count: projects.list.filter(p => p.status === 'pausiert').length },
  { status: 'abgeschlossen', label: 'Abgeschlossen', color: 'text-lo',          count: projects.list.filter(p => p.status === 'abgeschlossen').length },
])

const weekReport    = computed(() => timeStore.report.summary)
const myWeekEntries = computed(() => timeStore.report.entries?.length ?? 0)
const myWeekMin     = computed(() => (timeStore.report.entries ?? []).reduce((s, e) => s + Number(e.duration_min), 0))

function formatMin(min) {
  if (!min) return '0h'
  const h = Math.floor(min / 60), m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}
</script>
