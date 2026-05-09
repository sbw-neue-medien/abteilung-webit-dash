<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-hi">Lernpartner</h1>
      <button v-if="auth.can('users.create')" class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Lernpartner anlegen
      </button>
    </div>

    <div v-if="users.loading" class="text-center py-12 text-lo italic">Laden…</div>
    <template v-else>
      <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="u in activeLearners" :key="u.id" class="card flex flex-col gap-3">
          <LearnerCard :u="u" :auth="auth"
            @triggerUpload="triggerUpload" @removeAvatar="removeAvatar"
            @sendReset="sendReset" @edit="openEdit" @editPermissions="openPermissions" @remove="remove"
            @toggleActive="handleToggleActive" />
        </div>
        <div v-if="!activeLearners.length" class="col-span-3 text-center py-12 text-lo italic">
          Noch keine Lernpartner erfasst.
        </div>
      </div>

      <template v-if="inactiveLearners.length">
        <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mt-8 mb-3">Inaktive Lernpartner</h2>
        <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="u in inactiveLearners" :key="u.id" class="card flex flex-col gap-3 opacity-60">
            <LearnerCard :u="u" :auth="auth"
              @triggerUpload="triggerUpload" @removeAvatar="removeAvatar"
              @sendReset="sendReset" @edit="openEdit" @remove="remove"
              @toggleActive="handleToggleActive" />
          </div>
        </div>
      </template>
    </template>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp"
           class="hidden" @change="onFileSelected" />

    <UserPermissionsModal v-if="permTarget" v-model="showPermModal"
      :user-id="permTarget.id" :user-name="permTarget.name" />

    <Modal v-model="showModal" :title="editing ? 'Lernpartner bearbeiten' : 'Lernpartner anlegen'">
      <UserForm :user="editing" :loading="saving" @submit="save" @cancel="showModal = false" />
      <p v-if="!editing" class="mt-3 text-xs text-lo">
        Beim Anlegen wird automatisch ein Eigenprojekt erstellt.
      </p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '../composables/useToast.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsersStore } from '../stores/users.js'
import { api } from '../api/index.js'
import Modal from '../components/Modal.vue'
import UserForm from '../components/UserForm.vue'
import LearnerCard from '../components/LearnerCard.vue'
import UserPermissionsModal from '../components/UserPermissionsModal.vue'

const auth              = useAuthStore()
const users             = useUsersStore()
const { toast, toastSuccess, toastError } = useToast()
const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)
const permTarget    = ref(null)
const showPermModal = ref(false)
const fileInput = ref(null)
const uploading = ref(null)

const activeLearners   = computed(() => users.list.filter(u => u.role === 'lernender' && u.active))
const inactiveLearners = computed(() => users.list.filter(u => u.role === 'lernender' && !u.active))

onMounted(() => users.fetchAll())

function openCreate()      { editing.value = null; showModal.value = true }
function openEdit(u)       { editing.value = u;    showModal.value = true }
function openPermissions(u){ permTarget.value = u; showPermModal.value = true }

function triggerUpload(u) {
  uploading.value = u
  fileInput.value.value = ''
  fileInput.value.click()
}

async function onFileSelected(e) {
  const file = e.target.files[0]
  if (!file || !uploading.value) return
  try {
    await api.uploadAvatar(uploading.value.id, file)
    await users.fetchAll()
  } catch (err) {
    toastError(err.message)
  } finally {
    uploading.value = null
  }
}

async function removeAvatar(u) {
  if (!confirm(`Foto von „${u.name}" entfernen?`)) return
  await api.deleteAvatar(u.id)
  await users.fetchAll()
}

async function save(body) {
  saving.value = true
  try {
    if (editing.value) await users.update(editing.value.id, body)
    else               await users.create(body)
    showModal.value = false
  } finally { saving.value = false }
}

async function sendReset(u) {
  if (!confirm(`Passwort-Reset-E-Mail an „${u.name}" (${u.email}) senden?`)) return
  try {
    await api.sendResetEmail(u.id)
    toastSuccess(`Reset-E-Mail an ${u.email} gesendet.`)
  } catch (err) {
    toastError(err.message)
  }
}

async function handleToggleActive(u, active) {
  await users.toggleActive(u.id, active)
  toast(active ? `„${u.name}" wurde aktiviert.` : `„${u.name}" wurde deaktiviert.`)
}

async function remove(u) {
  if (!confirm(`„${u.name}" und alle zugehörigen Daten löschen?`)) return
  await users.remove(u.id)
}
</script>
