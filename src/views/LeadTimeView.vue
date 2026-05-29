<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h1 class="text-2xl font-bold text-hi">Lead Time</h1>
      <PeriodSelector @change="onPeriodChange" />
    </div>

    <div v-if="loading" class="text-center py-12 text-lo italic">Laden…</div>

    <div v-else-if="!rows.length" class="text-center py-12 text-lo italic">
      Keine Lernpartner erfasst.
    </div>

    <div v-else>
      <!-- Summary bar -->
      <div class="text-sm text-mid mb-4">
        <span v-if="availableHours">Brutto verfügbar: <strong class="text-hi">{{ availableHours }}h</strong> pro Lernpartner</span>
        <span v-else class="text-lo italic">Kein Zeitraum gewählt</span>
      </div>

      <!-- Per-learner rows -->
      <div class="space-y-3">
        <div
          v-for="r in rows"
          :key="r.id"
          class="flex items-center gap-4 p-4 rounded-xl ring-1 ring-line bg-surface">

          <UserAvatar :userId="r.id" :name="r.name" :hasAvatar="r.avatar" size="sm" class="shrink-0" />
          <p class="font-medium text-hi text-sm w-36 shrink-0 truncate" :title="r.name">{{ r.name }}</p>

          <!-- Horizontal progress bar -->
          <div class="flex-1 relative h-5 rounded-full overflow-hidden bg-lift">
            <div
              class="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              :class="barColor(r)"
              :style="{ width: barPct(r) + '%' }">
            </div>
            <span
              v-if="barPct(r) >= 10"
              class="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-white/90">
              {{ barPct(r) }}%
            </span>
          </div>

          <!-- Hours label -->
          <div class="text-right shrink-0 w-24 text-sm">
            <span class="font-semibold text-hi">{{ r.declared_hours }}h</span>
            <span class="text-lo"> / {{ availableHours ?? '–' }}h</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from '../api/index.js'
import PeriodSelector from '../components/PeriodSelector.vue'
import UserAvatar from '../components/UserAvatar.vue'

const MINUTES_PER_DAY = 225

const loading  = ref(true)
const rows     = ref([])
const dateFrom = ref('')
const dateTo   = ref('')

function countWorkingDays(from, to) {
  if (!from || !to) return 0
  let count = 0
  const end = new Date(to + 'T00:00:00')
  const d   = new Date(from + 'T00:00:00')
  while (d <= end) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

const availableHours = computed(() => {
  const days = countWorkingDays(dateFrom.value, dateTo.value)
  if (!days) return null
  return Math.round(days * MINUTES_PER_DAY / 60 * 10) / 10
})

function barPct(r) {
  if (!availableHours.value) return 0
  return Math.min(100, Math.round(r.declared_hours / availableHours.value * 100))
}

function barColor(r) {
  const pct = barPct(r)
  if (pct >= 80) return 'bg-emerald-500 dark:bg-emerald-400'
  if (pct >= 50) return 'bg-amber-400 dark:bg-amber-300'
  return 'bg-red-400 dark:bg-red-500'
}

async function load(params) {
  loading.value = true
  try {
    rows.value = await api.getLeadTimeStats(params)
  } finally {
    loading.value = false
  }
}

function onPeriodChange({ from, to } = {}) {
  dateFrom.value = from ?? ''
  dateTo.value   = to ?? ''
  load(from && to ? { from, to } : {})
}
</script>
