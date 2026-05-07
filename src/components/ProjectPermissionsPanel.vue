<template>
  <div class="mt-6 max-w-7xl mx-auto space-y-4">
    <h3 class="text-sm font-semibold text-lo uppercase tracking-wide">Projektberechtigungen</h3>

    <div v-if="loading" class="text-lo italic text-sm">Laden…</div>

    <template v-else>
      <!-- Existing grants per user -->
      <div v-if="grants.length" class="space-y-2">
        <div v-for="g in grants" :key="g.user_id"
             class="card flex flex-wrap items-start gap-3 py-3">
          <span class="font-medium text-hi text-sm min-w-[8rem]">{{ g.user_name }}</span>
          <div class="flex flex-wrap gap-1 flex-1">
            <span v-for="perm in g.permissions" :key="perm"
                  class="inline-flex items-center gap-1 text-xs bg-brand-subtle text-brand-700 rounded-full px-2 py-0.5">
              {{ perm }}
              <button @click="removePermission(g, perm)"
                      class="hover:text-red-500 transition-colors leading-none" title="Entfernen">×</button>
            </span>
          </div>
          <button class="btn btn-sm btn-danger shrink-0" @click="removeAll(g)">Alle entfernen</button>
        </div>
      </div>

      <!-- Add grant form -->
      <div class="card flex flex-wrap gap-2 items-end">
        <div class="flex-1 min-w-[10rem]">
          <label class="label">Benutzer</label>
          <select v-model="form.userId" class="input text-sm py-1">
            <option value="">Benutzer wählen…</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
        </div>
        <div class="flex-1 min-w-[12rem]">
          <label class="label">Berechtigung</label>
          <select v-model="form.permission" class="input text-sm py-1">
            <option value="">Berechtigung wählen…</option>
            <optgroup v-for="group in permGroups" :key="group.label" :label="group.label">
              <option v-for="p in group.permissions" :key="p.key" :value="p.key">{{ p.key }}</option>
            </optgroup>
          </select>
        </div>
        <button class="btn btn-sm btn-primary shrink-0"
                :disabled="!form.userId || !form.permission || saving"
                @click="addPermission">
          Hinzufügen
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api/index.js'

const PERM_GROUPS = {
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
  projectId: { type: Number, required: true },
  users:     { type: Array,  required: true },
})

const loading    = ref(false)
const saving     = ref(false)
const grants     = ref([])
const allPerms   = ref([])
const form       = ref({ userId: '', permission: '' })

const permGroups = computed(() => {
  const map = {}
  for (const p of allPerms.value) {
    const prefix = p.key.split('.')[0]
    if (!map[prefix]) map[prefix] = []
    map[prefix].push(p)
  }
  return Object.entries(map).map(([prefix, permissions]) => ({
    label: PERM_GROUPS[prefix] ?? prefix,
    permissions,
  }))
})

async function load() {
  loading.value = true
  try {
    const [permsData, grantsData] = await Promise.all([
      api.getRoles(),
      api.getProjectPermissions(props.projectId),
    ])
    allPerms.value = permsData.permissions
    grants.value   = grantsData
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function addPermission() {
  if (!form.value.userId || !form.value.permission) return
  saving.value = true
  try {
    const existing = grants.value.find(g => g.user_id === form.value.userId)
    const current  = existing ? [...existing.permissions] : []
    if (!current.includes(form.value.permission)) current.push(form.value.permission)
    await api.updateProjectPermissions(props.projectId, form.value.userId, current)
    form.value.userId = ''
    form.value.permission = ''
    await load()
  } catch (err) {
    alert(err.message)
  } finally {
    saving.value = false
  }
}

async function removePermission(grant, perm) {
  const updated = grant.permissions.filter(p => p !== perm)
  if (updated.length === 0) {
    await api.deleteProjectPermissions(props.projectId, grant.user_id)
  } else {
    await api.updateProjectPermissions(props.projectId, grant.user_id, updated)
  }
  await load()
}

async function removeAll(grant) {
  await api.deleteProjectPermissions(props.projectId, grant.user_id)
  await load()
}
</script>
