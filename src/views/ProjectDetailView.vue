<template>
  <div class="max-w-full px-4 py-8">
    <div v-if="projects.loading || tasks.loading" class="text-center py-16 text-slate-400 italic">Laden…</div>
    <template v-else-if="projects.current">
      <div class="flex flex-wrap items-start gap-4 mb-6 max-w-7xl mx-auto">
        <div class="flex-1 min-w-0">
          <RouterLink to="/projekte" class="text-brand-600 hover:underline text-sm">← Projekte</RouterLink>
          <h1 class="text-2xl font-bold text-slate-800 truncate mt-1">{{ projects.current.name }}</h1>
          <div class="flex items-center gap-3 mt-1">
            <StatusBadge :status="projects.current.status" />
            <span v-if="projects.current.client" class="text-sm text-slate-400">{{ projects.current.client }}</span>
          </div>
          <p v-if="projects.current.description" class="mt-2 text-sm text-slate-600">{{ projects.current.description }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button v-if="auth.isLeiter" class="btn-secondary" @click="showEdit = true">Bearbeiten</button>
          <button class="btn-primary" @click="addTask('offen')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Aufgabe
          </button>
        </div>
      </div>

      <KanbanBoard :tasks="tasks.list" @move="moveTask" @add="addTask" @edit="openEditTask" @delete="deleteTask" />

      <div class="mt-8 max-w-7xl mx-auto">
        <TodoList />
      </div>

      <div v-if="auth.isLeiter && projects.current.members?.length" class="mt-6 max-w-7xl mx-auto">
        <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Mitglieder</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="m in projects.current.members" :key="m.id"
                class="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
            {{ m.name }}
          </span>
        </div>
      </div>
    </template>
    <div v-else class="text-center py-16 text-slate-400">Projekt nicht gefunden.</div>

    <Modal v-model="showTaskModal" :title="editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'">
      <form @submit.prevent="saveTask" class="space-y-4">
        <div>
          <label class="label">Titel *</label>
          <input v-model="taskForm.title" class="input" required />
        </div>
        <div>
          <label class="label">Beschreibung</label>
          <textarea v-model="taskForm.description" class="input" rows="3" />
        </div>
        <div>
          <label class="label">Spalte</label>
          <select v-model="taskForm.status" class="input">
            <option value="offen">Offen</option>
            <option value="in_arbeit">In Arbeit</option>
            <option value="review">Review</option>
            <option value="erledigt">Erledigt</option>
          </select>
        </div>
        <div v-if="projects.current?.members?.length">
          <label class="label">Zugewiesen an</label>
          <select v-model="taskForm.assignee_id" class="input">
            <option :value="null">— Niemanden —</option>
            <option v-for="m in projects.current.members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button type="button" class="btn-secondary" @click="showTaskModal = false">Abbrechen</button>
          <button type="submit" class="btn-primary">{{ editingTask ? 'Aktualisieren' : 'Erstellen' }}</button>
        </div>
      </form>
    </Modal>

    <Modal v-model="showEdit" title="Projekt bearbeiten">
      <ProjectForm :project="projects.current" :users="allUsers" :loading="saving"
        @submit="saveProject" @cancel="showEdit = false" />
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useTasksStore } from '../stores/tasks.js'
import { useUsersStore } from '../stores/users.js'
import { useTodosStore } from '../stores/todos.js'
import KanbanBoard from '../components/KanbanBoard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import Modal from '../components/Modal.vue'
import ProjectForm from '../components/ProjectForm.vue'
import TodoList from '../components/TodoList.vue'

const route      = useRoute()
const auth       = useAuthStore()
const projects   = useProjectsStore()
const tasks      = useTasksStore()
const todos      = useTodosStore()
const usersStore = useUsersStore()

const showTaskModal = ref(false)
const showEdit      = ref(false)
const editingTask   = ref(null)
const saving        = ref(false)
const allUsers      = ref([])
const taskForm      = ref({ title: '', description: '', status: 'offen', assignee_id: null })

onMounted(async () => {
  const id = Number(route.params.id)
  await Promise.all([projects.fetchOne(id), tasks.fetchForProject(id), todos.fetchForProject(id)])
  if (auth.isLeiter) {
    await usersStore.fetchAll()
    allUsers.value = usersStore.list.filter(u => u.role === 'lernender')
  }
})

function addTask(status) {
  editingTask.value   = null
  taskForm.value      = { title: '', description: '', status, assignee_id: null }
  showTaskModal.value = true
}

function openEditTask(task) {
  editingTask.value   = task
  taskForm.value      = { title: task.title, description: task.description ?? '', status: task.status, assignee_id: task.assignee_id ?? null }
  showTaskModal.value = true
}

async function saveTask() {
  if (editingTask.value) await tasks.update(editingTask.value.id, taskForm.value)
  else                   await tasks.create(taskForm.value)
  showTaskModal.value = false
}

async function moveTask(id, status) { await tasks.move(id, status) }

async function deleteTask(id) {
  if (!confirm('Aufgabe wirklich löschen?')) return
  await tasks.remove(id)
}

async function saveProject(body) {
  saving.value = true
  try { await projects.update(Number(route.params.id), body); showEdit.value = false }
  finally { saving.value = false }
}
</script>
