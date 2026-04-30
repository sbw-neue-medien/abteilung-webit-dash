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

    <!-- Mentor: assigned learner hours -->
    <section v-if="auth.isMentor && learnerHours.length">
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">Aufwand meiner Lernenden</h2>
      <div class="card overflow-hidden p-0">
        <table class="min-w-full text-sm">
          <thead class="bg-lift border-b border-line">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-mid">Lernende/r</th>
              <th class="px-4 py-3 text-right font-medium text-mid">Stunden total</th>
              <th class="px-4 py-3 text-right font-medium text-mid">Ausstehend</th>
              <th class="px-4 py-3 w-40"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-groove">
            <tr v-for="l in learnerHours" :key="l.id" class="hover:bg-lift">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <UserAvatar :userId="l.id" :name="l.name" :hasAvatar="l.avatar" size="sm" />
                  <span class="font-medium text-hi">{{ l.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-semibold text-hi">{{ formatMin(l.total_min) }}</td>
              <td class="px-4 py-3 text-right">
                <span v-if="Number(l.pending_count) > 0" class="text-amber-500 font-medium">
                  {{ l.pending_count }} ×
                </span>
                <span v-else class="text-lo">—</span>
              </td>
              <td class="px-4 py-2">
                <div class="h-1.5 bg-lift rounded-full overflow-hidden">
                  <div class="h-full bg-brand-500 rounded-full transition-all"
                       :style="{ width: Math.min(100, (l.total_min / maxLearnerMin) * 100) + '%' }" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Mentor: current sprint overview -->
    <section v-if="auth.isMentor && sprintStats.length">
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">Aktueller Sprint</h2>
      <div class="space-y-3">
        <div v-for="s in sprintStats" :key="s.sprint_id" class="card">
          <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span class="font-semibold text-hi">{{ s.sprint_name }}</span>
            <span class="text-xs text-lo">{{ formatDate(s.start_date) }} – {{ formatDate(s.end_date) }}</span>
          </div>
          <div class="grid grid-cols-4 gap-3 text-center">
            <div class="bg-lift rounded-lg py-3">
              <div class="text-2xl font-bold text-lo">{{ s.offen }}</div>
              <div class="text-xs text-lo mt-1">Offen</div>
            </div>
            <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg py-3">
              <div class="text-2xl font-bold text-amber-500">{{ s.in_arbeit }}</div>
              <div class="text-xs text-lo mt-1">In Arbeit</div>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg py-3">
              <div class="text-2xl font-bold text-blue-500">{{ s.review }}</div>
              <div class="text-xs text-lo mt-1">Review</div>
            </div>
            <div class="bg-brand-subtle rounded-lg py-3">
              <div class="text-2xl font-bold text-brand-600">{{ s.erledigt }}</div>
              <div class="text-xs text-lo mt-1">Erledigt</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Leiter only: current sprint task status -->
    <section v-if="auth.isLeiter && sprintStats.length">
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">Aktueller Sprint</h2>
      <div class="space-y-3">
        <div v-for="s in sprintStats" :key="s.sprint_id" class="card">
          <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <span class="font-semibold text-hi">{{ s.sprint_name }}</span>
              <span class="text-xs text-lo ml-2">{{ s.project_name }}</span>
            </div>
            <span class="text-xs text-lo">
              {{ formatDate(s.start_date) }} – {{ formatDate(s.end_date) }}
            </span>
          </div>
          <div class="grid grid-cols-4 gap-3 text-center">
            <div class="bg-lift rounded-lg py-3">
              <div class="text-2xl font-bold text-lo">{{ s.offen }}</div>
              <div class="text-xs text-lo mt-1">Offen</div>
            </div>
            <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg py-3">
              <div class="text-2xl font-bold text-amber-500">{{ s.in_arbeit }}</div>
              <div class="text-xs text-lo mt-1">In Arbeit</div>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg py-3">
              <div class="text-2xl font-bold text-blue-500">{{ s.review }}</div>
              <div class="text-xs text-lo mt-1">Review</div>
            </div>
            <div class="bg-brand-subtle rounded-lg py-3">
              <div class="text-2xl font-bold text-brand-600">{{ s.erledigt }}</div>
              <div class="text-xs text-lo mt-1">Erledigt</div>
            </div>
          </div>
          <!-- Progress bar -->
          <div v-if="totalTasks(s) > 0" class="mt-3">
            <div class="flex h-2 rounded-full overflow-hidden bg-lift gap-px">
              <div class="bg-lo/40 transition-all"           :style="{ width: pct(s.offen, s) + '%' }" />
              <div class="bg-amber-400 transition-all"       :style="{ width: pct(s.in_arbeit, s) + '%' }" />
              <div class="bg-blue-400 transition-all"        :style="{ width: pct(s.review, s) + '%' }" />
              <div class="bg-brand-500 transition-all"       :style="{ width: pct(s.erledigt, s) + '%' }" />
            </div>
            <div class="flex justify-between text-xs text-lo mt-1">
              <span>{{ totalTasks(s) }} Aufgaben total</span>
              <span>{{ Math.round(pct(s.erledigt, s)) }}% erledigt</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Leiter only: hours per learner -->
    <section v-if="auth.isLeiter && learnerHours.length">
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">Aufwand pro Lernende</h2>
      <div class="card overflow-hidden p-0">
        <table class="min-w-full text-sm">
          <thead class="bg-lift border-b border-line">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-mid">Lernende/r</th>
              <th class="px-4 py-3 text-right font-medium text-mid">Stunden total</th>
              <th class="px-4 py-3 text-right font-medium text-mid">Ausstehend</th>
              <th class="px-4 py-3 w-40"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-groove">
            <tr v-for="l in learnerHours" :key="l.id" class="hover:bg-lift">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <UserAvatar :userId="l.id" :name="l.name" :hasAvatar="l.avatar" size="sm" />
                  <span class="font-medium text-hi">{{ l.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-semibold text-hi">{{ formatMin(l.total_min) }}</td>
              <td class="px-4 py-3 text-right">
                <span v-if="Number(l.pending_count) > 0" class="text-amber-500 font-medium">
                  {{ l.pending_count }} ×
                </span>
                <span v-else class="text-lo">—</span>
              </td>
              <td class="px-4 py-2">
                <div class="h-1.5 bg-lift rounded-full overflow-hidden">
                  <div class="h-full bg-brand-500 rounded-full transition-all"
                       :style="{ width: Math.min(100, (l.total_min / maxLearnerMin) * 100) + '%' }" />
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-lift border-t border-line">
            <tr>
              <td class="px-4 py-3 text-sm font-semibold text-mid">Total</td>
              <td class="px-4 py-3 text-right font-bold text-hi">{{ formatMin(totalLearnerMin) }}</td>
              <td colspan="2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <section v-if="!auth.isLeiter && !auth.isMentor" class="card max-w-xs">
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">Stunden diese Woche</h2>
      <div class="text-3xl font-bold text-brand-600">{{ formatMin(myWeekMin) }}</div>
      <div class="text-sm text-mid mt-1">{{ myWeekEntries }} Einträge diese Woche</div>
    </section>

    <section>
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">
        {{ auth.isLeiter ? 'Projektübersicht' : auth.isMentor ? 'Projekte meiner Lernenden' : 'Meine Projekte' }}
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useTimeEntriesStore } from '../stores/timeEntries.js'
import { api } from '../api/index.js'
import StatusBadge from '../components/StatusBadge.vue'
import UserAvatar from '../components/UserAvatar.vue'

const auth      = useAuthStore()
const projects  = useProjectsStore()
const timeStore = useTimeEntriesStore()
const router    = useRouter()

const monday = (() => {
  const d = new Date(); const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1); return d.toISOString().slice(0, 10)
})()
const today = new Date().toISOString().slice(0, 10)

const sprintStats  = ref([])
const learnerHours = ref([])

onMounted(async () => {
  const calls = [projects.fetchAll()]
  if (!auth.isMentor) calls.push(timeStore.fetchReport({ from: monday, to: today }))
  if (auth.isLeiter) calls.push(
    api.getDashboardStats().then(d => {
      sprintStats.value  = d.sprint_stats
      learnerHours.value = d.learner_hours
    })
  )
  if (auth.isMentor) calls.push(
    api.getMentorStats().then(d => {
      sprintStats.value  = d.sprint_stats
      learnerHours.value = d.learner_hours
    })
  )
  await Promise.all(calls)
})

const statusStats = computed(() => [
  { status: 'geplant',       label: 'Geplant',       color: 'text-lo',          count: projects.list.filter(p => p.status === 'geplant').length },
  { status: 'aktiv',         label: 'Aktiv',         color: 'text-emerald-500', count: projects.list.filter(p => p.status === 'aktiv').length },
  { status: 'pausiert',      label: 'Pausiert',      color: 'text-amber-500',   count: projects.list.filter(p => p.status === 'pausiert').length },
  { status: 'abgeschlossen', label: 'Abgeschlossen', color: 'text-lo',          count: projects.list.filter(p => p.status === 'abgeschlossen').length },
])

const myWeekEntries = computed(() => timeStore.report.entries?.length ?? 0)
const myWeekMin     = computed(() => (timeStore.report.entries ?? []).reduce((s, e) => s + Number(e.duration_min), 0))

const totalLearnerMin = computed(() => learnerHours.value.reduce((s, l) => s + Number(l.total_min), 0))
const maxLearnerMin   = computed(() => Math.max(1, ...learnerHours.value.map(l => Number(l.total_min))))

function totalTasks(s) { return Number(s.offen) + Number(s.in_arbeit) + Number(s.review) + Number(s.erledigt) }
function pct(val, s)   { const t = totalTasks(s); return t ? (Number(val) / t) * 100 : 0 }

function formatMin(min) {
  if (!min) return '0h'
  const h = Math.floor(min / 60), m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
}
</script>
