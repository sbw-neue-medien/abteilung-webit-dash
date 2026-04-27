<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-hi">Projekte</h1>
      <button v-if="auth.isLeiter" class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Neues Projekt
      </button>
    </div>

    <div class="flex flex-wrap gap-2 mb-5">
      <button v-for="f in filters" :key="f.value" class="btn btn-sm"
        :class="activeFilter === f.value ? 'btn-primary' : 'btn-secondary'"
        @click="activeFilter = f.value">
        {{ f.label }}
      </button>
    </div>

    <div v-if="projects.loading" class="text-lo italic py-8 text-center">Laden…</div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="p in filtered" :key="p.id"
           class="card hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3"
           @click="router.push(`/projekte/${p.id}`)">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-semibold text-hi">{{ p.name }}</p>
            <p v-if="p.client" class="text-xs text-lo mt-0.5">{{ p.client }}</p>
          </div>
          <StatusBadge :status="p.status" />
        </div>
        <p v-if="p.description" class="text-sm text-mid line-clamp-2">{{ p.description }}</p>
        <div class="flex items-center justify-between mt-auto pt-2 border-t border-groove">
          <span class="text-xs text-lo">{{ p.owner_name }}</span>
          <div v-if="auth.isLeiter" class="flex gap-1" @click.stop>
            <button class="btn btn-sm btn-secondary" @click="openEdit(p)">Bearbeiten</button>
            <button class="btn btn-sm btn-danger" @click="confirmDelete(p)">Löschen</button>
          </div>
        </div>
      </div>
      <div v-if="!filtered.length" class="col-span-full text-center py-12 text-lo italic">Keine Projekte.</div>
    </div>

    <Modal v-model="showModal" :title="editing ? 'Projekt bearbeiten' : 'Neues Projekt'">
      <ProjectForm
        :project="editing"
        :users="users.list.filter(u => u.role === 'lernender')"
        :loading="saving"
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
import StatusBadge from '../components/StatusBadge.vue'
import Modal from '../components/Modal.vue'
import ProjectForm from '../components/ProjectForm.vue'

const auth     = useAuthStore()
const projects = useProjectsStore()
const users    = useUsersStore()
const router   = useRouter()

const showModal    = ref(false)
const editing      = ref(null)
const saving       = ref(false)
const activeFilter = ref('alle')

const filters = [
  { value: 'alle',          label: 'Alle' },
  { value: 'aktiv',         label: 'Aktiv' },
  { value: 'geplant',       label: 'Geplant' },
  { value: 'pausiert',      label: 'Pausiert' },
  { value: 'abgeschlossen', label: 'Abgeschlossen' },
]

const filtered = computed(() =>
  activeFilter.value === 'alle' ? projects.list : projects.list.filter(p => p.status === activeFilter.value)
)

onMounted(() => { projects.fetchAll(); if (auth.isLeiter) users.fetchAll() })

function openCreate() { editing.value = null; showModal.value = true }
function openEdit(p)  { editing.value = p;    showModal.value = true }

async function save(body) {
  saving.value = true
  try {
    if (editing.value) await projects.update(editing.value.id, body)
    else               await projects.create(body)
    showModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete(p) {
  if (!confirm(`Projekt „${p.name}" wirklich löschen?`)) return
  await projects.remove(p.id)
}
</script>
