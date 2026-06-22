<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-hi">Projekte</h1>
      <button v-if="auth.can('projects.create') || auth.can('projects.create_own')" class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        {{ activeTab === 'vorlagen' ? 'Neue Vorlage' : (auth.can('projects.create') ? 'Neues Projekt' : 'Neues Eigenprojekt') }}
      </button>
    </div>

    <div v-if="auth.can('projects.create')" class="flex gap-1 mb-5 border-b border-groove">
      <button
        v-for="tab in tabs" :key="tab.value"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === tab.value
          ? 'border-b-2 border-brand-600 text-brand-600 -mb-px'
          : 'text-lo hover:text-mid'"
        @click="activeTab = tab.value">
        {{ tab.label }}
        <span v-if="tab.value === 'vorlagen' && projects.templates.length"
              class="ml-1 text-xs bg-brand-subtle text-brand-700 rounded-full px-1.5 py-0.5">
          {{ projects.templates.length }}
        </span>
      </button>
    </div>

    <template v-if="activeTab === 'projekte'">
      <div class="flex flex-wrap items-center gap-2 mb-5">
        <button v-for="f in filters" :key="f.value" class="btn btn-sm"
          :class="activeFilter === f.value ? 'btn-primary' : 'btn-secondary'"
          @click="setFilter(f.value)">
          {{ f.label }}
        </button>
        <label class="flex items-center gap-1.5 text-sm text-mid cursor-pointer select-none ml-1">
          <input type="checkbox" :checked="showPersonal" @change="togglePersonal" class="rounded accent-brand-600" />
          Eigenprojekte
        </label>
        <select v-if="auth.can('projects.create') && lernende.length"
                v-model="learnerFilter"
                class="ml-auto input py-1 text-sm w-auto">
          <option :value="null">Alle Lernpartner</option>
          <option v-for="u in lernende" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>

      <div v-if="projects.loading" class="text-lo italic py-8 text-center">Laden…</div>
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCard v-for="p in filtered" :key="p.id"
          :project="p" :can-edit="canEditProject(p)" :member-names="memberNames(p)"
          @open="router.push(`/projekte/${p.id}`)" @edit="openEdit(p)" @delete="confirmDelete(p)" />
        <div v-if="!filtered.length" class="col-span-full text-center py-12 text-lo italic">Keine Projekte.</div>
      </div>
    </template>

    <template v-else>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCard v-for="t in projects.templates" :key="t.id"
          :project="t" is-template can-edit
          @open="router.push(`/projekte/${t.id}`)" @edit="openEdit(t)" @delete="confirmDelete(t)" />
        <div v-if="!projects.templates.length" class="col-span-full text-center py-12 text-lo italic">
          Noch keine Vorlagen. Erstelle ein Projekt und aktiviere «Als Vorlage speichern».
        </div>
      </div>
    </template>

    <Modal v-model="showModal" :title="modalTitle">
      <ProjectForm
        :project="editing"
        :users="auth.can('projects.create') ? users.list.filter(u => u.role === 'lernender' && u.active) : []"
        :mentors="auth.can('projects.create') ? mentors : []"
        :templates="activeTab === 'projekte' ? projects.templates : []"
        :loading="saving"
        :personal-only="!auth.can('projects.create')"
        @submit="save"
        @cancel="showModal = false"
      />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useUsersStore } from '../stores/users.js'
import { api } from '../api/index.js'
import Modal from '../components/Modal.vue'
import ProjectForm from '../components/ProjectForm.vue'
import ProjectCard from '../components/ProjectCard.vue'

const auth     = useAuthStore()
const projects = useProjectsStore()
const users    = useUsersStore()
const router   = useRouter()

const mentors        = ref([])
const showModal      = ref(false)
const editing        = ref(null)
const saving         = ref(false)
const activeFilter   = ref(localStorage.getItem('project-filter') || 'aktiv')
const activeTab      = ref('projekte')
const learnerFilter  = ref(null)
const showPersonal   = ref(localStorage.getItem('show-personal') !== 'false')

const tabs = [
  { value: 'projekte', label: 'Projekte' },
  { value: 'vorlagen', label: 'Vorlagen' },
]

const filters = [
  { value: 'alle',          label: 'Alle' },
  { value: 'aktiv',         label: 'Aktiv' },
  { value: 'geplant',       label: 'Geplant' },
  { value: 'pausiert',      label: 'Pausiert' },
  { value: 'abgeschlossen', label: 'Abgeschlossen' },
]

const lernende = computed(() =>
  users.list.filter(u => u.role === 'lernender' && u.active).sort((a, b) => a.name.localeCompare(b.name))
)

const filtered = computed(() => {
  let list = projects.list
  if (!showPersonal.value) list = list.filter(p => !p.is_personal)
  if (activeFilter.value !== 'alle') list = list.filter(p => p.status === activeFilter.value)
  if (learnerFilter.value) {
    const id = learnerFilter.value
    list = list.filter(p => p.owner_id === id || (p.member_ids ?? []).includes(id))
  }
  return list
})

const modalTitle = computed(() => {
  if (editing.value) return editing.value.is_template ? 'Vorlage bearbeiten' : 'Projekt bearbeiten'
  return activeTab.value === 'vorlagen' ? 'Neue Vorlage' : 'Neues Projekt'
})

function canEditProject(p) {
  if (auth.can('projects.create') || auth.can('projects.update')) return true
  return auth.can('projects.update_own') && p.is_personal && p.owner_id === auth.user?.id
}

function memberNames(p) {
  if (!p.member_ids?.length || !auth.can('projects.create')) return []
  return p.member_ids.map(uid => users.list.find(u => u.id === uid)?.name ?? '?')
}

onMounted(async () => {
  projects.fetchAll()
  if (auth.can('projects.create')) {
    users.fetchAll()
    projects.fetchTemplates()
    mentors.value = await api.getMentors()
  }
})

function openCreate() { editing.value = null; showModal.value = true }
function openEdit(p)  { editing.value = p;    showModal.value = true }
function togglePersonal() {
  showPersonal.value = !showPersonal.value
  localStorage.setItem('show-personal', String(showPersonal.value))
}
function setFilter(filter) {
  activeFilter.value = filter
  localStorage.setItem('project-filter', filter)
}
async function save(body) {
  saving.value = true
  try {
    if (editing.value) {
      await projects.update(editing.value.id, body)
      if (editing.value.is_template || body.is_template) await projects.fetchTemplates()
    } else {
      if (activeTab.value === 'vorlagen') body.is_template = true
      await projects.create(body)
      if (body.is_template) await projects.fetchTemplates()
    }
    showModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete(p) {
  await projects.remove(p.id)
  if (p.is_template) await projects.fetchTemplates()
}
</script>
