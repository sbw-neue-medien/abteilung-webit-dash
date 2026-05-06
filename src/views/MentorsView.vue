<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-hi">Coaches</h1>
      <button class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Coach anlegen
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-lo italic">Laden…</div>
    <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="m in mentors" :key="m.id" class="card flex flex-col gap-3">
        <div class="flex items-center gap-4">
          <UserAvatar :userId="m.id" :name="m.name" :hasAvatar="m.avatar" size="lg" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-hi">{{ m.name }}</p>
            <p class="text-xs text-lo mt-0.5">{{ m.email || m.username }}</p>
          </div>
        </div>

        <!-- Assigned learners -->
        <div>
          <p class="text-xs font-medium text-lo uppercase tracking-wide mb-1">Zugewiesene Lernpartner</p>
          <div v-if="!assignments[m.id]?.length" class="text-xs text-lo italic">Keine zugewiesen</div>
          <div v-else class="flex flex-wrap gap-1">
            <span v-for="l in assignments[m.id]" :key="l.id"
                  class="inline-flex items-center gap-1 text-xs bg-brand-subtle text-brand-700 rounded-full px-2 py-0.5">
              {{ l.name }}
              <button @click="unassign(m, l)" class="hover:text-red-500 transition-colors" title="Zuweisung aufheben">×</button>
            </span>
          </div>
        </div>

        <!-- Assign learner -->
        <div class="flex gap-2 items-center">
          <select v-model="assignTarget[m.id]" class="input flex-1 text-sm py-1">
            <option value="">Lernpartner zuweisen…</option>
            <option v-for="l in unassignedFor(m)" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
          <button class="btn btn-sm btn-secondary" :disabled="!assignTarget[m.id]"
                  @click="assign(m)">+</button>
        </div>

        <div class="flex gap-1 flex-wrap">
          <button v-if="m.email" class="btn btn-sm btn-secondary" @click="sendReset(m)"
                  title="Passwort-Reset-E-Mail senden">
            Reset-E-Mail
          </button>
          <button class="btn btn-sm btn-secondary" @click="openEdit(m)">Bearbeiten</button>
          <button class="btn btn-sm btn-secondary" @click="openPermissions(m)" title="Berechtigungen anpassen">Berechtigungen</button>
          <button class="btn btn-sm btn-danger" @click="remove(m)">Löschen</button>
        </div>
      </div>

      <div v-if="!mentors.length" class="col-span-3 text-center py-12 text-lo italic">
        Noch keine Coaches erfasst.
      </div>
    </div>

    <UserPermissionsModal v-if="permTarget" v-model="showPermModal"
      :user-id="permTarget.id" :user-name="permTarget.name" />

    <Modal v-model="showModal" :title="editing ? 'Coach bearbeiten' : 'Coach anlegen'">
      <MentorForm :mentor="editing" :loading="saving" @submit="save" @cancel="showModal = false" />
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { api } from '../api/index.js'
import { useUsersStore } from '../stores/users.js'
import Modal from '../components/Modal.vue'
import UserAvatar from '../components/UserAvatar.vue'
import MentorForm from '../components/MentorForm.vue'
import UserPermissionsModal from '../components/UserPermissionsModal.vue'

const usersStore = useUsersStore()

const loading     = ref(false)
const mentors     = ref([])
const assignments = reactive({})
const assignTarget = reactive({})
const showModal     = ref(false)
const editing       = ref(null)
const saving        = ref(false)
const permTarget    = ref(null)
const showPermModal = ref(false)

const learners = computed(() => usersStore.list.filter(u => u.role === 'lernender' && u.active))

function unassignedFor(mentor) {
  const assigned = (assignments[mentor.id] ?? []).map(l => l.id)
  return learners.value.filter(l => !assigned.includes(l.id))
}

async function fetchMentors() {
  loading.value = true
  try {
    mentors.value = await api.getMentors()
    await Promise.all(mentors.value.map(async m => {
      assignments[m.id] = await api.getMentorLernende(m.id)
    }))
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchMentors(); usersStore.fetchAll() })

function openCreate()      { editing.value = null; showModal.value = true }
function openEdit(m)       { editing.value = m;    showModal.value = true }
function openPermissions(m){ permTarget.value = m; showPermModal.value = true }

async function save(body) {
  saving.value = true
  try {
    if (editing.value) await api.updateMentor(editing.value.id, body)
    else               await api.createMentor(body)
    showModal.value = false
    await fetchMentors()
  } finally { saving.value = false }
}

async function remove(m) {
  if (!confirm(`Coach „${m.name}" wirklich löschen?`)) return
  await api.deleteMentor(m.id)
  await fetchMentors()
}

async function assign(mentor) {
  const lernenderId = assignTarget[mentor.id]
  if (!lernenderId) return
  await api.assignLernender(mentor.id, lernenderId)
  assignTarget[mentor.id] = ''
  assignments[mentor.id] = await api.getMentorLernende(mentor.id)
}

async function sendReset(m) {
  if (!confirm(`Passwort-Reset-E-Mail an „${m.name}" (${m.email}) senden?`)) return
  try {
    await api.sendResetEmail(m.id)
    alert(`Reset-E-Mail an ${m.email} gesendet.`)
  } catch (err) {
    alert(err.message)
  }
}

async function unassign(mentor, learner) {
  if (!confirm(`Zuweisung von „${learner.name}" zu „${mentor.name}" aufheben?`)) return
  await api.unassignLernender(mentor.id, learner.id)
  assignments[mentor.id] = await api.getMentorLernende(mentor.id)
}
</script>
