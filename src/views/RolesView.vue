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

      <div class="card flex items-end gap-3">
        <div class="flex-1 min-w-[15rem]">
          <label class="label">Projekt auswählen</label>
          <select v-model="selectedProjectId" class="input text-sm py-2">
            <option :value="null">— Projekt wählen —</option>
            <option v-for="p in projectsStore.list" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
      </div>

      <ProjectPermissionsPanel
        v-if="selectedProjectId"
        :project-id="selectedProjectId"
        :users="lernende" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '../composables/useToast.js'
import { api } from '../api/index.js'
import { useProjectsStore } from '../stores/projects.js'
import { useUsersStore } from '../stores/users.js'
import ProjectPermissionsPanel from '../components/ProjectPermissionsPanel.vue'

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

const projectsStore = useProjectsStore()
const usersStore    = useUsersStore()
const { toastError } = useToast()

const loading          = ref(true)
const roles            = ref([])
const permissions      = ref([])
const saving           = ref({})
const selectedProjectId = ref(null)

const lernende = computed(() =>
  usersStore.list.filter(u => u.role === 'lernender' && u.active)
)

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

onMounted(async () => {
  const [data] = await Promise.all([
    api.getRoles(),
    projectsStore.fetchAll(),
    usersStore.list.length ? Promise.resolve() : usersStore.fetchAll(),
  ])
  roles.value = data.roles
  permissions.value = data.permissions
  roles.value.forEach(r => (saving.value[r] = false))
  loading.value = false
})

async function toggle(role, key, granted) {
  const perm = permissions.value.find(p => p.key === key)
  if (!perm) return

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
    if (granted) {
      perm.grants = perm.grants.filter(r => r !== role)
    } else {
      perm.grants.push(role)
    }
    toastError('Fehler beim Speichern: ' + err.message)
  } finally {
    saving.value[role] = false
  }
}
</script>
