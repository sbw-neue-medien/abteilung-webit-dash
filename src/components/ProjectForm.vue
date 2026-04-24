<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label class="label">Projektname *</label>
      <input v-model="form.name" class="input" required placeholder="z.B. Schulwebsite Gymnasium" />
    </div>
    <div>
      <label class="label">Kunde / Auftraggeber</label>
      <input v-model="form.client" class="input" placeholder="optional" />
    </div>
    <div>
      <label class="label">Beschreibung</label>
      <textarea v-model="form.description" class="input" rows="3" />
    </div>
    <div>
      <label class="label">Status</label>
      <select v-model="form.status" class="input">
        <option value="geplant">Geplant</option>
        <option value="aktiv">Aktiv</option>
        <option value="pausiert">Pausiert</option>
        <option value="abgeschlossen">Abgeschlossen</option>
      </select>
    </div>
    <div v-if="users.length">
      <label class="label">Lernende zuweisen</label>
      <div class="space-y-1 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2">
        <label v-for="u in users" :key="u.id" class="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" :value="u.id" v-model="form.member_ids"
                 class="rounded border-slate-300 text-brand-600" />
          {{ u.name }}
        </label>
      </div>
    </div>
    <div class="flex gap-2 justify-end pt-2">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Abbrechen</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Speichern…' : (project ? 'Aktualisieren' : 'Erstellen') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ project: Object, users: { type: Array, default: () => [] }, loading: Boolean })
const emit  = defineEmits(['submit', 'cancel'])

const form = ref({ name: '', client: '', description: '', status: 'geplant', member_ids: [] })

watch(() => props.project, (p) => {
  if (!p) return
  form.value = {
    name:        p.name,
    client:      p.client      ?? '',
    description: p.description ?? '',
    status:      p.status,
    member_ids:  (p.members ?? []).map(m => m.id),
  }
}, { immediate: true })

function submit() { emit('submit', { ...form.value }) }
</script>
