<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <!-- Allgemeine Berechtigungen (Rollenverwaltung) -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-hi">Berechtigungen</h1>
      </div>

      <p class="text-sm text-lo">
        Änderungen gelten sofort für alle API-Zugriffe. Frontend-Sichtbarkeit (Buttons, Nav-Einträge)
        wird erst nach erneutem Anmelden aktualisiert.
      </p>

      <h2 class="text-lg font-semibold text-hi">Allgemeine Berechtigungen</h2>

      <div v-if="loading" class="text-lo italic text-center py-12">Laden…</div>

      <div v-else class="card overflow-x-auto p-0">
        <table class="min-w-full text-sm">
          <thead class="bg-lift border-b border-groove">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-mid w-full">Berechtigung</th>
              <th v-for="role in roles" :key="role"
                  class="px-6 py-3 text-center font-semibold text-hi whitespace-nowrap capitalize min-w-[110px]">
                {{ ROLE_LABELS[role] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in groups" :key="group.label">
              <tr class="bg-brand-subtle/40">
                <td :colspan="roles.length + 1"
                    class="px-4 py-1.5 text-xs font-semibold text-brand-700 uppercase tracking-wide">
                  {{ group.label }}
                </td>
              </tr>
              <tr v-for="perm in group.permissions" :key="perm.key"
                  class="border-t border-groove hover:bg-lift transition-colors">
                <td class="px-4 py-2.5">
                  <span class="font-mono text-xs text-mid">{{ perm.key }}</span>
                  <span class="text-lo text-xs ml-2">{{ perm.description }}</span>
                </td>
                <td v-for="role in roles" :key="role" class="px-6 py-2.5 text-center">
                  <input
                    type="checkbox"
                    :checked="perm.grants.includes(role)"
                    :disabled="saving[role]"
                    class="rounded border-line text-brand-600 focus:ring-brand-500 cursor-pointer"
                    @change="toggle(role, perm.key, $event.target.checked)"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Projektberechtigungen -->
    <section class="space-y-4 border-t border-groove pt-8">
      <h2 class="text-lg font-semibold text-hi">Projektberechtigungen</h2>

      <!-- Project Filter -->
      <div class="card flex items-end gap-3">
        <div class="flex-1 min-w-[15rem]">
          <label class="label">Projekt auswählen</label>
          <select v-model="selectedProjectId" class="input text-sm py-2">
            <option :value="null">--- Projekt wählen ---</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div v-if="selectedProjectId" class="text-sm text-lo">
          {{ projectUsers.length }} Benutzer
        </div>
      </div>

      <!-- Project Permissions Management -->
      <div v-if="selectedProjectId">
        <div v-if="projectLoading" class="text-lo italic text-center py-8">Laden…</div>

        <template v-else>
          <!-- Existing grants per user -->
          <div v-if="projectGrants.length" class="space-y-2 mb-4">
            <div v-for="g in projectGrants" :key="g.user_id"
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
              <select v-model="projectForm.userId" class="input text-sm py-1">
                <option value="">Benutzer wählen…</option>
                <option v-for="u in projectUsers" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
            <div class="flex-1 min-w-[12rem]">
              <label class="label">Berechtigung</label>
              <select v-model="projectForm.permission" class="input text-sm py-1">
                <option value="">Berechtigung wählen…</option>
                <optgroup v-for="group in permGroups" :key="group.label" :label="group.label">
                  <option v-for="p in group.permissions" :key="p.key" :value="p.key">{{ p.key }}</option>
                </optgroup>
              </select>
            </div>
            <button class="btn btn-sm btn-primary shrink-0"
                    :disabled="!projectForm.userId || !projectForm.permission || projectSaving"
                    @click="addPermission">
              Hinzufügen
            </button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../api/index.js'
import { useProjectsStore } from '../stores/projects.js'

const ROLE_LABELS = {
  leiter:    'Leiter',
  lernender: 'Lernpartner',
  mentor:    'Coach',
}

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

const PERM_GROUPS = GROUP_LABELS

const projectsStore = useProjectsStore()

// General permissions
const loading     = ref(true)
const roles       = ref([])
const permissions = ref([])
const saving      = ref({})

// Project permissions
const selectedProjectId = ref(null)
const projectLoading    = ref(false)
const projectSaving     = ref(false)
const projectGrants     = ref([])
const projectUsers      = ref([])
const projectForm       = ref({ userId: '', permission: '' })
const allPerms          = ref([])

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

const projects = computed(() => projectsStore.list)

const permGroups = computed(() => {
  const map = {}
  for (const p of allPerms.value) {
    const prefix = p.key.split('.')[0]
    if (!map[prefix]) map[prefix] = []
    map[prefix].push(p)
  }
  return Object.entries(map).map(([prefix, perms]) => ({
    label: PERM_GROUPS[prefix] ?? prefix,
    permissions: perms,
  }))
})

onMounted(async () => {
  // Load general permissions
  const data = await api.getRoles()
  roles.value = data.roles
  permissions.value = data.permissions
  allPerms.value = data.permissions
  roles.value.forEach(r => (saving.value[r] = false))
  loading.value = false

  // Load projects
  await projectsStore.fetchAll()
})

async function loadProjectPermissions() {
  if (!selectedProjectId.value) return
  
  projectLoading.value = true
  try {
    const project = projects.value.find(p => p.id === selectedProjectId.value)
    projectUsers.value = project?.members || []
    projectGrants.value = await api.getProjectPermissions(selectedProjectId.value)
    projectForm.value.userId = ''
    projectForm.value.permission = ''
  } catch (err) {
    alert('Fehler beim Laden: ' + err.message)
  } finally {
    projectLoading.value = false
  }
}

// Watch for project selection changes
watch(selectedProjectId, (newVal) => {
  if (newVal) {
    loadProjectPermissions()
  } else {
    projectGrants.value = []
    projectUsers.value = []
  }
})

async function toggle(role, key, granted) {
  const perm = permissions.value.find(p => p.key === key)
  if (!perm) return

  // Optimistic update
  if (granted) {
    perm.grants.push(role)
  } else {
    perm.grants = perm.grants.filter(r => r !== role)
  }

  saving.value[role] = true
  try {
    const current = permissions.value
      .filter(p => p.grants.includes(role))
      .map(p => p.key)
    await api.updateRolePermissions(role, current)
  } catch (err) {
    // Roll back on error
    if (granted) {
      perm.grants = perm.grants.filter(r => r !== role)
    } else {
      perm.grants.push(role)
    }
    alert('Fehler beim Speichern: ' + err.message)
  } finally {
    saving.value[role] = false
  }
}

async function addPermission() {
  if (!projectForm.value.userId || !projectForm.value.permission) return
  projectSaving.value = true
  try {
    const existing = projectGrants.value.find(g => g.user_id === projectForm.value.userId)
    const current = existing ? [...existing.permissions] : []
    if (!current.includes(projectForm.value.permission)) current.push(projectForm.value.permission)
    await api.updateProjectPermissions(selectedProjectId.value, projectForm.value.userId, current)
    projectForm.value.userId = ''
    projectForm.value.permission = ''
    await loadProjectPermissions()
  } catch (err) {
    alert(err.message)
  } finally {
    projectSaving.value = false
  }
}

async function removePermission(grant, perm) {
  const updated = grant.permissions.filter(p => p !== perm)
  if (updated.length === 0) {
    await api.deleteProjectPermissions(selectedProjectId.value, grant.user_id)
  } else {
    await api.updateProjectPermissions(selectedProjectId.value, grant.user_id, updated)
  }
  await loadProjectPermissions()
}

async function removeAll(grant) {
  await api.deleteProjectPermissions(selectedProjectId.value, grant.user_id)
  await loadProjectPermissions()
}
</script>
