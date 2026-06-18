<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h1 class="text-2xl font-bold text-hi">Werkstatt-Übersicht</h1>

      <PeriodSelector @change="onPeriodChange" />
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
            <th class="text-center px-4 py-3 font-medium text-mid">Kapazität</th>
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

            <!-- Capacity -->
            <td class="px-4 py-3 text-center">
              <span v-if="r.capacity_min === null" class="text-lo">–</span>
              <div v-else class="inline-flex flex-col items-center gap-1 min-w-[5.5rem]">
                <span class="text-xs" :class="r.declared_min > r.capacity_min ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-mid'">
                  {{ r.declared_min }} / {{ r.capacity_min }} min
                </span>
                <span class="w-full h-1.5 rounded-full bg-lift ring-1 ring-line overflow-hidden">
                  <span class="block h-full rounded-full"
                        :class="r.declared_min > r.capacity_min ? 'bg-red-500' : 'bg-brand-500'"
                        :style="{ width: Math.min(100, (r.declared_min / r.capacity_min) * 100) + '%' }" />
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api/index.js'
import UserAvatar from '../components/UserAvatar.vue'
import PeriodSelector from '../components/PeriodSelector.vue'

const loading = ref(true)
const rows    = ref([])

async function load(params) {
  loading.value = true
  try {
    rows.value = await api.getWerkstattStats(params)
  } finally {
    loading.value = false
  }
}

function onPeriodChange({ from, to } = {}) {
  load(from && to ? { from, to } : {})
}
</script>
