<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-hi">Lernende</h1>
      <button v-if="auth.isLeiter" class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Lernenden anlegen
      </button>
    </div>

    <div v-if="users.loading" class="text-center py-12 text-lo italic">Laden…</div>
    <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="u in learners" :key="u.id" class="card flex flex-col gap-3">

        <!-- Top row: avatar + name/email -->
        <div class="flex items-center gap-4">
          <!-- Avatar: clickable for leiter, static for mentor -->
          <div v-if="auth.isLeiter" class="relative shrink-0 group cursor-pointer" @click="triggerUpload(u)">
            <UserAvatar :userId="u.id" :name="u.name" :hasAvatar="u.avatar" size="lg" />
            <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
                        transition-opacity flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
          <div v-else class="shrink-0">
            <UserAvatar :userId="u.id" :name="u.name" :hasAvatar="u.avatar" size="lg" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-semibold text-hi">{{ u.name }}</p>
            <p class="text-xs text-lo mt-0.5">{{ u.email || u.username }}</p>
            <button v-if="auth.isLeiter && u.avatar" @click.stop="removeAvatar(u)"
                    class="text-xs text-red-500 hover:underline mt-0.5">
              Foto entfernen
            </button>
          </div>
        </div>

        <!-- Bottom row: buttons (leiter only) -->
        <div v-if="auth.isLeiter" class="flex gap-1 flex-wrap">
          <button v-if="u.email" class="btn btn-sm btn-secondary" @click="sendReset(u)"
                  title="Passwort-Reset-E-Mail senden">
            Reset-E-Mail
          </button>
          <button class="btn btn-sm btn-secondary" @click="openEdit(u)">Bearbeiten</button>
          <button class="btn btn-sm btn-danger" @click="remove(u)">Löschen</button>
        </div>
      </div>
      <div v-if="!learners.length" class="col-span-2 text-center py-12 text-lo italic">
        Noch keine Lernenden erfasst.
      </div>
    </div>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp"
           class="hidden" @change="onFileSelected" />

    <Modal v-model="showModal" :title="editing ? 'Lernenden bearbeiten' : 'Lernenden anlegen'">
      <UserForm :user="editing" :loading="saving" @submit="save" @cancel="showModal = false" />
      <p v-if="!editing" class="mt-3 text-xs text-lo">
        Beim Anlegen wird automatisch ein Eigenprojekt erstellt.
      </p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useUsersStore } from '../stores/users.js'
import { api } from '../api/index.js'
import Modal from '../components/Modal.vue'
import UserForm from '../components/UserForm.vue'
import UserAvatar from '../components/UserAvatar.vue'

const auth      = useAuthStore()
const users     = useUsersStore()
const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)
const fileInput = ref(null)
const uploading = ref(null)

const learners = computed(() => users.list.filter(u => u.role === 'lernender'))

onMounted(() => users.fetchAll())

function openCreate() { editing.value = null; showModal.value = true }
function openEdit(u)  { editing.value = u;    showModal.value = true }

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
    alert(err.message)
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
    alert(`Reset-E-Mail an ${u.email} gesendet.`)
  } catch (err) {
    alert(err.message)
  }
}

async function remove(u) {
  if (!confirm(`„${u.name}" und alle zugehörigen Daten löschen?`)) return
  await users.remove(u.id)
}
</script>
