<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label class="label">Datum</label>
      <input v-model="form.date" type="date" class="input" required />
      <p v-if="dayWarning" class="mt-1 text-xs text-amber-600">{{ dayWarning }}</p>
    </div>
    <div>
      <label class="label">Projekt</label>
      <select v-model="form.project_id" class="input" required>
        <option value="">— Projekt wählen —</option>
        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>
    <div v-if="form.project_id">
      <label class="label">Aufgabe <span class="text-lo font-normal">(optional)</span></label>
      <select v-model="form.task_id" class="input" :disabled="tasksLoading">
        <option :value="null">— Keine Aufgabe —</option>
        <option v-for="t in tasks" :key="t.id" :value="t.id">{{ t.title }}</option>
      </select>
    </div>
    <div>
      <label class="label">Dauer</label>
      <div class="flex gap-2 items-center">
        <input v-model.number="hours" type="number" min="0" max="8" class="input w-20" placeholder="Std" />
        <span class="text-mid text-sm">h</span>
        <input v-model.number="minutes" type="number" min="0" max="59" step="5" class="input w-20" placeholder="Min" />
        <span class="text-mid text-sm">min</span>
      </div>
      <p class="mt-1 text-xs text-lo">Reguläre Arbeitszeit: 3h 35min — Ausnahmen möglich</p>
    </div>
    <div>
      <label class="label">Tätigkeit</label>
      <textarea v-model="form.description" class="input" rows="3" placeholder="Was wurde erledigt?" />
    </div>
    <div class="flex gap-2 justify-end pt-2">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Abbrechen</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Speichern…' : (entry ? 'Aktualisieren' : 'Eintragen') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '../api/index.js'

const props = defineProps({ projects: Array, entry: Object, loading: Boolean })
const emit  = defineEmits(['submit', 'cancel'])

const today       = new Date().toISOString().slice(0, 10)
const DEFAULT_MIN = 215

const form         = ref({ date: today, project_id: '', task_id: null, description: '' })
const hours        = ref(Math.floor(DEFAULT_MIN / 60))
const minutes      = ref(DEFAULT_MIN % 60)
const tasks        = ref([])
const tasksLoading = ref(false)

watch(() => props.entry, (e) => {
  if (!e) {
    form.value    = { date: today, project_id: '', task_id: null, description: '' }
    hours.value   = Math.floor(DEFAULT_MIN / 60)
    minutes.value = DEFAULT_MIN % 60
    return
  }
  form.value    = { date: e.date, project_id: e.project_id, task_id: e.task_id ?? null, description: e.description ?? '' }
  hours.value   = Math.floor(e.duration_min / 60)
  minutes.value = e.duration_min % 60
}, { immediate: true })

watch(() => form.value.project_id, async (pid) => {
  tasks.value    = []
  form.value.task_id = null
  if (!pid) return
  tasksLoading.value = true
  try { tasks.value = await api.getTasks(Number(pid)) }
  catch { tasks.value = [] }
  finally { tasksLoading.value = false }

  // restore task_id after tasks load (editing mode)
  if (props.entry?.project_id === pid && props.entry?.task_id) {
    form.value.task_id = props.entry.task_id
  }
})

const dayWarning = computed(() => {
  if (!form.value.date) return null
  const d = new Date(form.value.date).getDay()
  if (d === 3) return 'Achtung: Mittwoch ist kein regulärer Nachmittags-Tag.'
  if (d === 0 || d === 6) return 'Achtung: Wochenende.'
  return null
})

function submit() {
  const totalMin = hours.value * 60 + minutes.value
  if (totalMin <= 0) return
  emit('submit', {
    ...form.value,
    project_id:  Number(form.value.project_id),
    task_id:     form.value.task_id ? Number(form.value.task_id) : null,
    duration_min: totalMin,
  })
}
</script>
