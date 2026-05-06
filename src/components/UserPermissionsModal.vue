<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
         :title="`Berechtigungen – ${userName}`" :wide="true">

    <div v-if="loading" class="text-lo italic text-center py-8">Laden…</div>

    <template v-else>
      <p class="text-xs text-lo mb-4">
        Überschreibungen gelten sofort. Ohne Überschreibung gilt die Rolle
        <span class="font-mono font-semibold text-mid">{{ roleLabel }}</span>.
      </p>

      <div class="overflow-x-auto -mx-4">
        <table class="min-w-full text-sm">
          <thead class="bg-lift border-b border-groove">
            <tr>
              <th class="px-4 py-2 text-left font-medium text-mid">Berechtigung</th>
              <th class="px-4 py-2 text-center font-medium text-mid w-24">Rolle</th>
              <th class="px-4 py-2 text-center font-medium text-mid w-36">Überschreibung</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in groups" :key="group.label">
              <tr class="bg-brand-subtle/40">
                <td colspan="3" class="px-4 py-1 text-xs font-semibold text-brand-700 uppercase tracking-wide">
                  {{ group.label }}
                </td>
              </tr>
              <tr v-for="perm in group.permissions" :key="perm.key"
                  class="border-t border-groove hover:bg-lift transition-colors">
                <td class="px-4 py-2">
                  <span class="font-mono text-xs text-mid">{{ perm.key }}</span>
                </td>
                <td class="px-4 py-2 text-center">
                  <span v-if="perm.role_granted"
                        class="inline-block w-4 h-4 rounded-full bg-brand-500" title="Durch Rolle gewährt" />
                  <span v-else
                        class="inline-block w-4 h-4 rounded-full bg-lift border border-groove" title="Durch Rolle nicht gewährt" />
                </td>
                <td class="px-4 py-2 text-center">
                  <select
                    :value="overrides[perm.key] ?? ''"
                    :disabled="saving"
                    class="input py-0.5 text-xs w-full"
                    @change="setOverride(perm.key, $event.target.value)"
                  >
                    <option value="">Rolle</option>
                    <option value="1">Gewähren</option>
                    <option value="0">Verweigern</option>
                  </select>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-groove">
        <button class="btn-secondary" @click="$emit('update:modelValue', false)">Schließen</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Speichern…' : 'Speichern' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from './Modal.vue'
import { api } from '../api/index.js'

const ROLE_LABELS = { leiter: 'Leiter', lernender: 'Lernpartner', mentor: 'Coach' }

const GROUP_LABELS = {
  projects:     'Projekte',
  tasks:        'Aufgaben',
  sprints:      'Sprints',
  time_entries: 'Zeiteinträge',
  todos:        'Todos',
  users:        'Benutzer',
  mentors:      'Coaches',
  reports:      'Berichte',
  settings:     'Einstellungen',
  werkstatt:    'Werkstatt',
}

const props = defineProps({
  modelValue: Boolean,
  userId:     { type: Number, required: true },
  userName:   { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const loading     = ref(false)
const saving      = ref(false)
const roleName    = ref('')
const permissions = ref([])
const overrides   = ref({})

const roleLabel = computed(() => ROLE_LABELS[roleName.value] ?? roleName.value)

const groups = computed(() => {
  const map = {}
  for (const p of permissions.value) {
    const prefix = p.key.split('.')[0]
    if (!map[prefix]) map[prefix] = []
    map[prefix].push(p)
  }
  return Object.entries(map).map(([prefix, perms]) => ({
    label:       GROUP_LABELS[prefix] ?? prefix,
    permissions: perms,
  }))
})

watch(() => props.modelValue, async (open) => {
  if (!open) return
  loading.value = true
  const data = await api.getUserPermissions(props.userId)
  roleName.value    = data.role
  permissions.value = data.permissions
  overrides.value   = {}
  for (const p of data.permissions) {
    if (p.override !== null) overrides.value[p.key] = p.override ? '1' : '0'
  }
  loading.value = false
})

function setOverride(key, value) {
  if (value === '') {
    delete overrides.value[key]
  } else {
    overrides.value[key] = value
  }
}

async function save() {
  saving.value = true
  try {
    const payload = {}
    for (const [key, val] of Object.entries(overrides.value)) {
      payload[key] = val === '1'
    }
    await api.updateUserPermissions(props.userId, payload)
    emit('update:modelValue', false)
  } catch (err) {
    alert('Fehler beim Speichern: ' + err.message)
  } finally {
    saving.value = false
  }
}
</script>
