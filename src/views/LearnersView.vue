<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Lernende</h1>
      <button class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Lernenden anlegen
      </button>
    </div>

    <div v-if="users.loading" class="text-center py-12 text-slate-400 italic">Laden…</div>
    <div v-else class="grid sm:grid-cols-2 gap-4">
      <div v-for="u in learners" :key="u.id" class="card flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-brand-100 text-brand-700 text-lg font-bold flex items-center justify-center shrink-0">
          {{ u.name.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-800">{{ u.name }}</p>
          <p class="text-sm text-slate-500 truncate">{{ u.email }}</p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button class="btn btn-sm btn-secondary" @click="openEdit(u)">Bearbeiten</button>
          <button class="btn btn-sm btn-danger" @click="remove(u)">Löschen</button>
        </div>
      </div>
      <div v-if="!learners.length" class="col-span-2 text-center py-12 text-slate-400 italic">
        Noch keine Lernenden erfasst.
      </div>
    </div>

    <Modal v-model="showModal" :title="editing ? 'Lernenden bearbeiten' : 'Lernenden anlegen'">
      <UserForm :user="editing" :loading="saving" @submit="save" @cancel="showModal = false" />
      <p v-if="!editing" class="mt-3 text-xs text-slate-400">
        Beim Anlegen wird automatisch ein Eigenprojekt erstellt.
      </p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '../stores/users.js'
import Modal from '../components/Modal.vue'
import UserForm from '../components/UserForm.vue'

const users     = useUsersStore()
const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)

const learners = computed(() => users.list.filter(u => u.role === 'lernender'))

onMounted(() => users.fetchAll())

function openCreate() { editing.value = null; showModal.value = true }
function openEdit(u)  { editing.value = u;    showModal.value = true }

async function save(body) {
  saving.value = true
  try {
    if (editing.value) await users.update(editing.value.id, body)
    else               await users.create(body)
    showModal.value = false
  } finally { saving.value = false }
}

async function remove(u) {
  if (!confirm(`„${u.name}" und alle zugehörigen Daten löschen?`)) return
  await users.remove(u.id)
}
</script>
