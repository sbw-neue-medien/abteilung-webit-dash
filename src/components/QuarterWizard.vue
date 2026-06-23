<template>
  <Modal :model-value="modelValue" @update:model-value="close" title="Quartalswechsel" wide>
    <div class="space-y-8">
      <!-- Step 1: Sprints anlegen -->
      <section>
        <h4 class="font-semibold text-hi mb-2">1. Neue Sprints anlegen</h4>
        <p class="text-xs text-lo mb-3">Lege die Sprints für das neue Quartal an. Sie schliessen direkt an den letzten bestehenden Sprint an.</p>
        <div class="flex items-center gap-3 mb-3">
          <label class="label mb-0">Anzahl Sprints</label>
          <input v-model.number="sprintCount" type="number" min="1" max="20" class="input w-20" @change="regenerateSprints" />
          <label class="label mb-0">Sprintgröße (Min.)</label>
          <input v-model.number="defaultCapacity" type="number" min="0" step="15" class="input w-24" @change="applyCapacityToAll" />
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div v-for="(row, i) in sprintRows" :key="i" class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
            <input v-model="row.name" class="input" />
            <input v-model="row.start_date" type="date" class="input" />
            <input v-model="row.end_date" type="date" class="input" />
            <input v-model.number="row.capacity_min" type="number" min="0" step="15" class="input w-24" />
          </div>
        </div>
        <div class="flex justify-end mt-3">
          <button class="btn-primary" :disabled="creatingSprints || !sprintRows.length" @click="createSprints">
            {{ creatingSprints ? 'Wird erstellt…' : `${sprintRows.length} Sprint${sprintRows.length !== 1 ? 's' : ''} erstellen` }}
          </button>
        </div>
      </section>

      <!-- Step 2: Lernende deaktivieren -->
      <section>
        <h4 class="font-semibold text-hi mb-2">2. Lernende deaktivieren</h4>
        <p class="text-xs text-lo mb-3">Eigenprojekte werden pausiert, offene Aufgaben dieser Lernpartner verlieren ihre Zuweisung.</p>
        <div v-if="!activeLearners.length" class="text-lo italic text-sm">Keine aktiven Lernpartner.</div>
        <div v-else class="space-y-1 max-h-48 overflow-y-auto">
          <label v-for="u in activeLearners" :key="u.id" class="flex items-center gap-2 text-sm py-1">
            <input type="checkbox" :value="u.id" v-model="toDeactivate" />
            {{ u.name }}
          </label>
        </div>
        <div class="flex justify-end mt-3">
          <button class="btn-secondary" :disabled="deactivating || !toDeactivate.length" @click="deactivateSelected">
            {{ deactivating ? 'Wird deaktiviert…' : `${toDeactivate.length} deaktivieren` }}
          </button>
        </div>
      </section>

      <!-- Step 3: Lernende aktivieren -->
      <section>
        <h4 class="font-semibold text-hi mb-2">3. Lernende (re-)aktivieren</h4>
        <p class="text-xs text-lo mb-3">Eigenprojekte werden, falls pausiert, wieder aktiviert.</p>
        <div v-if="!inactiveLearners.length" class="text-lo italic text-sm">Keine inaktiven Lernpartner.</div>
        <div v-else class="space-y-1 max-h-48 overflow-y-auto">
          <label v-for="u in inactiveLearners" :key="u.id" class="flex items-center gap-2 text-sm py-1">
            <input type="checkbox" :value="u.id" v-model="toActivate" />
            {{ u.name }}
          </label>
        </div>
        <div class="flex justify-end mt-3">
          <button class="btn-secondary" :disabled="activating || !toActivate.length" @click="activateSelected">
            {{ activating ? 'Wird aktiviert…' : `${toActivate.length} aktivieren` }}
          </button>
        </div>
      </section>

      <div class="flex justify-end pt-2 border-t border-line">
        <button class="btn-primary" @click="close">Fertig</button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSprintsStore } from '../stores/sprints.js'
import { useUsersStore } from '../stores/users.js'
import { useToast } from '../composables/useToast.js'
import Modal from './Modal.vue'
import { mondayOfNextWeek, fridayOfWeek, isoWeekNumber, mondayAfter } from '../utils/sprintDates.js'

const props = defineProps({ modelValue: Boolean })
const emit  = defineEmits(['update:modelValue'])

const sprints = useSprintsStore()
const users   = useUsersStore()
const { toastSuccess, toastError } = useToast()

const sprintCount     = ref(12)
const defaultCapacity = ref(900)
const sprintRows      = ref([])
const creatingSprints = ref(false)

const toDeactivate = ref([])
const toActivate   = ref([])
const deactivating = ref(false)
const activating   = ref(false)

const activeLearners   = computed(() => users.list.filter(u => u.role === 'lernender' && u.active))
const inactiveLearners = computed(() => users.list.filter(u => u.role === 'lernender' && !u.active))

watch(() => props.modelValue, (open) => {
  if (open) {
    toDeactivate.value = []
    toActivate.value   = []
    regenerateSprints()
  }
})

function regenerateSprints() {
  const sorted = [...sprints.list].sort((a, b) => a.start_date.localeCompare(b.start_date))
  let mon = sorted.length ? mondayAfter(sorted[sorted.length - 1].end_date) : mondayOfNextWeek()
  const rows = []
  for (let i = 0; i < sprintCount.value; i++) {
    const kw = isoWeekNumber(new Date(mon + 'T00:00:00'))
    rows.push({ name: `KW ${kw}`, start_date: mon, end_date: fridayOfWeek(mon), capacity_min: defaultCapacity.value })
    mon = mondayAfter(rows[rows.length - 1].end_date)
  }
  sprintRows.value = rows
}

function applyCapacityToAll() {
  sprintRows.value.forEach(r => { r.capacity_min = defaultCapacity.value })
}

async function createSprints() {
  creatingSprints.value = true
  try {
    await Promise.all(sprintRows.value.map(row => sprints.create(row)))
    toastSuccess(`${sprintRows.value.length} Sprints erstellt.`)
    regenerateSprints()
  } catch (err) {
    toastError(err.message)
  } finally {
    creatingSprints.value = false
  }
}

async function deactivateSelected() {
  deactivating.value = true
  try {
    const results = await Promise.all(toDeactivate.value.map(id => users.toggleActive(id, false)))
    const unassigned = results.reduce((sum, r) => sum + (r?.unassigned_tasks ?? 0), 0)
    toastSuccess(`${toDeactivate.value.length} deaktiviert${unassigned ? `, ${unassigned} Aufgabe(n) freigegeben.` : '.'}`)
    toDeactivate.value = []
  } catch (err) {
    toastError(err.message)
  } finally {
    deactivating.value = false
  }
}

async function activateSelected() {
  activating.value = true
  try {
    await Promise.all(toActivate.value.map(id => users.toggleActive(id, true)))
    toastSuccess(`${toActivate.value.length} aktiviert.`)
    toActivate.value = []
  } catch (err) {
    toastError(err.message)
  } finally {
    activating.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>
