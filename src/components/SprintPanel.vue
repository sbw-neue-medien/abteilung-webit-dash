<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-hi">Sprint-Planung</h2>
      <button v-if="auth.can('sprints.manage')" class="btn-primary" @click="openNew">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Neuer Sprint
      </button>
    </div>

    <div v-if="sprints.loading" class="text-lo italic text-sm">Laden…</div>

    <div v-else-if="sprints.list.length === 0" class="text-lo text-sm italic py-4">
      Noch keine Sprints angelegt.
    </div>

    <div v-else class="space-y-3">
      <div v-for="sprint in visibleSprints" :key="sprint.id"
           class="bg-surface rounded-xl ring-1 ring-line p-4"
           :class="sprintClass(sprint)">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    :class="badgeClass(sprint)">
                {{ statusLabel(sprint) }}
              </span>
              <h3 class="font-semibold text-hi truncate">{{ sprint.name }}</h3>
            </div>
            <p class="text-xs text-mid mt-1">
              {{ formatDate(sprint.start_date) }} – {{ formatDate(sprint.end_date) }}
            </p>
            <MarkdownRenderer v-if="sprint.goal" class="mt-1" :content="sprint.goal" />
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-xs text-lo">{{ sprint.task_count }} Aufgaben</span>
            <template v-if="auth.can('sprints.manage')">
              <button @click="openEdit(sprint)" class="text-lo hover:text-brand-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <ConfirmButton label="Sprint löschen? Aufgaben bleiben erhalten." @confirm="removeSprint(sprint.id)" class="text-lo hover:text-red-500 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </ConfirmButton>
            </template>
          </div>
        </div>

        <!-- Task chips (passed in from parent for context) -->
        <div v-if="sprintTasks(sprint.id).length" class="mt-3 pt-3 border-t border-line">
          <div class="flex flex-wrap gap-2">
            <span v-for="t in sprintTasks(sprint.id)" :key="t.id"
                  class="inline-flex items-center gap-1 text-xs bg-lift px-2 py-1 rounded-lg text-mid">
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="statusDot(t.status)" />
              {{ t.title }}
              <span v-if="t.planned_duration_min" class="text-lo">
                ({{ formatMin(t.planned_duration_min) }})
              </span>
            </span>
          </div>
        </div>
      </div>

      <button v-if="hiddenCount > 0 || expanded" @click="expanded = !expanded"
              class="w-full text-xs text-lo hover:text-hi py-1 transition-colors">
        {{ expanded ? '↑ Weniger anzeigen' : `↓ ${hiddenCount} weitere Sprint${hiddenCount !== 1 ? 's' : ''} anzeigen` }}
      </button>
    </div>

    <!-- Modal (Leiter only) -->
    <Modal v-if="auth.can('sprints.manage')" v-model="showModal" :title="editing ? 'Sprint bearbeiten' : 'Neuer Sprint'">
      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="label">Name *</label>
          <input v-model="form.name" class="input" placeholder="z.B. KW 18" required />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Startdatum *</label>
            <input v-model="form.start_date" type="date" class="input" required />
          </div>
          <div>
            <label class="label">Enddatum *</label>
            <input v-model="form.end_date" type="date" class="input" required />
          </div>
        </div>
        <div>
          <MarkdownTextarea label="Sprint-Ziel" v-model="form.goal" :rows="2" placeholder="Was soll dieser Sprint erreichen?" />
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button type="button" class="btn-secondary" @click="showModal = false">Abbrechen</button>
          <button type="submit" class="btn-primary">{{ editing ? 'Aktualisieren' : 'Erstellen' }}</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSprintsStore } from '../stores/sprints.js'
import { useAuthStore } from '../stores/auth.js'
import ConfirmButton from './ConfirmButton.vue'
import Modal from './Modal.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import MarkdownTextarea from './MarkdownTextarea.vue'

const props = defineProps({ tasks: { type: Array, default: () => [] } })

const sprints   = useSprintsStore()
const auth      = useAuthStore()
const showModal = ref(false)
const editing   = ref(null)
const expanded  = ref(false)
const form      = ref({ name: '', start_date: '', end_date: '', goal: '' })

const today = new Date().toISOString().slice(0, 10)

const sorted = computed(() =>
  [...sprints.list].sort((a, b) => a.start_date.localeCompare(b.start_date))
)

const visibleSprints = computed(() => {
  if (expanded.value) return sorted.value
  const current = sorted.value.find(s => s.start_date <= today && s.end_date >= today)
  if (current) return [current]
  const next = sorted.value.find(s => s.start_date > today)
  if (next) return [next]
  return sorted.value.slice(-1)
})

const hiddenCount = computed(() => sorted.value.length - visibleSprints.value.length)

function sprintTasks(sprintId) {
  return props.tasks.filter(t => Number(t.sprint_id) === Number(sprintId))
}

function statusLabel(sprint) {
  if (sprint.end_date < today)   return 'Abgeschlossen'
  if (sprint.start_date > today) return 'Geplant'
  return 'Aktiv'
}

function sprintClass(sprint) {
  if (sprint.end_date < today)   return ''
  if (sprint.start_date > today) return 'ring-dashed'
  return 'ring-brand-400'
}

function badgeClass(sprint) {
  if (sprint.end_date < today)   return 'bg-lift text-lo'
  if (sprint.start_date > today) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-brand-subtle text-brand-700'
}

function statusDot(status) {
  return { offen: 'bg-lo', in_arbeit: 'bg-amber-400', review: 'bg-blue-400', erledigt: 'bg-brand-500' }[status] ?? 'bg-lo'
}

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatMin(min) {
  const m = Number(min)
  if (!m) return ''
  const h = Math.floor(m / 60), r = m % 60
  return h ? (r ? `${h}h ${r}min` : `${h}h`) : `${r}min`
}

function openNew() {
  editing.value = null
  let mon
  if (sorted.value.length) {
    const last = sorted.value[sorted.value.length - 1]
    const d    = new Date(last.end_date + 'T00:00:00')
    const day  = d.getDay()                          // 0=Sun … 6=Sat
    d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day)) // next Monday after end
    mon = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } else {
    mon = mondayOfNextWeek()
  }
  const kw = isoWeekNumber(new Date(mon + 'T00:00:00'))
  form.value = { name: `KW ${kw}`, start_date: mon, end_date: fridayOfWeek(mon), goal: '' }
  showModal.value = true
}

function openEdit(sprint) {
  editing.value = sprint
  form.value = { name: sprint.name, start_date: sprint.start_date, end_date: sprint.end_date, goal: sprint.goal ?? '' }
  showModal.value = true
}

async function save() {
  if (editing.value) await sprints.update(editing.value.id, form.value)
  else               await sprints.create(form.value)
  showModal.value = false
}

async function removeSprint(id) {
  await sprints.remove(id)
}

function mondayOfNextWeek() {
  const d = new Date(), day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isoWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

function fridayOfWeek(mondayStr) {
  const d = new Date(mondayStr + 'T00:00:00')
  d.setDate(d.getDate() + 4)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>
