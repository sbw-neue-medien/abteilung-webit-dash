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
            Aktueller Sprint
          </button>
          <button
            class="px-3 py-1.5 border-l border-groove transition-colors"
            :class="mode === 'range' ? 'bg-brand-subtle text-brand-600 font-medium' : 'bg-surface text-mid hover:text-hi'"
            @click="setMode('range')">
            Zeitraum
          </button>
        </div>
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
import { ref, onMounted } from 'vue'
import { api } from '../api/index.js'
import UserAvatar from '../components/UserAvatar.vue'

const loading = ref(true)
const rows    = ref([])
const mode    = ref('current')
const from    = ref('')
const to      = ref('')

async function load() {
  loading.value = true
  try {
    const params = mode.value === 'range' && from.value && to.value
      ? { from: from.value, to: to.value }
      : {}
    rows.value = await api.getWerkstattStats(params)
  } finally {
    loading.value = false
  }
}

function setMode(m) {
  mode.value = m
  if (m === 'current') load()
}

onMounted(load)
</script>
