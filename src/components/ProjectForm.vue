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

    <div class="flex items-center gap-2">
      <input id="is_personal" type="checkbox" v-model="form.is_personal"
             class="rounded border-line text-brand-600" />
      <label for="is_personal" class="text-sm text-hi cursor-pointer select-none">Eigenprojekt (einem Lernenden zuordnen)</label>
    </div>

    <div v-if="form.is_personal && users.length">
      <label class="label">Lernender *</label>
      <select v-model="form.owner_id" class="input" required>
        <option :value="null">— Bitte wählen —</option>
        <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
      </select>
    </div>

    <div v-if="!form.is_personal && users.length">
      <label class="label">Lernende zuweisen</label>
      <div class="space-y-1 max-h-40 overflow-y-auto border border-line rounded-lg p-2 bg-lift">
        <label v-for="u in users" :key="u.id" class="flex items-center gap-2 text-sm cursor-pointer text-hi">
          <input type="checkbox" :value="u.id" v-model="form.member_ids"
                 class="rounded border-line text-brand-600" />
          {{ u.name }}
        </label>
      </div>
    </div>

    <template v-if="!project">
      <div v-if="templates.length && !form.is_template">
        <label class="label">Vorlage verwenden</label>
        <select v-model="form.template_id" class="input">
          <option :value="null">— Keine Vorlage —</option>
          <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <input id="is_template" type="checkbox" v-model="form.is_template"
               class="rounded border-line text-brand-600" />
        <label for="is_template" class="text-sm text-hi cursor-pointer select-none">Als Vorlage speichern</label>
      </div>
    </template>

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

const props = defineProps({
  project:   Object,
  users:     { type: Array, default: () => [] },
  templates: { type: Array, default: () => [] },
  loading:   Boolean,
})
const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  name: '', client: '', description: '', status: 'geplant',
  is_personal: false, owner_id: null, member_ids: [],
  is_template: false, template_id: null,
})

watch(() => props.project, (p) => {
  if (!p) return
  form.value = {
    name:        p.name,
    client:      p.client       ?? '',
    description: p.description  ?? '',
    status:      p.status,
    is_personal: !!p.is_personal,
    owner_id:    p.is_personal ? (p.owner_id ?? null) : null,
    member_ids:  (p.members ?? []).map(m => m.id),
    is_template: false,
    template_id: null,
  }
}, { immediate: true })

function submit() {
  const payload = { ...form.value }
  if (payload.is_personal && payload.owner_id) {
    if (!payload.member_ids.includes(payload.owner_id)) {
      payload.member_ids = [payload.owner_id]
    }
  }
  if (payload.is_template) payload.template_id = null
  emit('submit', payload)
}
</script>
