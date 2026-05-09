<template>
  <div class="max-w-full px-4 py-8">
    <div v-if="projects.loading || tasks.loading" class="text-center py-16 text-lo italic">Laden…</div>
    <template v-else-if="projects.current">
      <div class="flex flex-wrap items-start gap-4 mb-6 max-w-7xl mx-auto">
        <div class="flex-1 min-w-0">
          <RouterLink to="/projekte" class="text-brand-600 hover:underline text-sm">← Projekte</RouterLink>
          <h1 class="text-2xl font-bold text-hi truncate mt-1">{{ projects.current.name }}</h1>
          <div class="flex items-center gap-3 mt-1">
            <StatusBadge :status="projects.current.status" />
            <span v-if="projects.current.client" class="text-sm text-lo">{{ projects.current.client }}</span>
          </div>
          <MarkdownRenderer v-if="projects.current.description" class="mt-2" :content="projects.current.description" />
        </div>
        <div class="flex gap-2 shrink-0">
          <button v-if="canEditOwnDescription" class="btn-secondary" @click="openDescEdit">Beschreibung</button>
          <button v-if="auth.can('projects.update')" class="btn-secondary" @click="showEdit = true">Bearbeiten</button>
          <button v-if="auth.can('tasks.create')" class="btn-primary" @click="addTask('offen')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Aufgabe
          </button>
        </div>
      </div>

      <!-- Sprint filter bar -->
      <div class="max-w-7xl mx-auto mb-4 flex items-center gap-2 flex-wrap">
        <span class="text-xs text-lo font-medium uppercase tracking-wide">Anzeigen:</span>
        <button @click="sprintFilter = null"
                class="text-xs px-3 py-1 rounded-full transition-colors"
                :class="sprintFilter === null ? 'bg-brand-600 text-white' : 'bg-lift text-mid hover:text-hi'">
          Alle
        </button>
        <button v-for="sprint in sprints.list" :key="sprint.id"
                @click="sprintFilter = sprint.id"
                class="text-xs px-3 py-1 rounded-full transition-colors"
                :class="sprintFilter === sprint.id ? 'bg-brand-600 text-white' : 'bg-lift text-mid hover:text-hi'">
          {{ sprint.name }}
        </button>
        <button @click="sprintFilter = 'backlog'"
                class="text-xs px-3 py-1 rounded-full transition-colors"
                :class="sprintFilter === 'backlog' ? 'bg-amber-500 text-white' : 'bg-lift text-mid hover:text-hi'">
          Backlog
        </button>
      </div>

      <div class="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
        <div class="flex-1 min-w-0">
          <KanbanBoard :tasks="filteredTasks" :readonly="!auth.can('tasks.create')"
                       @move="moveTask" @add="addTask" @duplicate="duplicateTask" @edit="openEditTask" @delete="deleteTask" />
        </div>
        <div class="xl:w-60 shrink-0">
          <TodoList />
        </div>
      </div>

      <div v-if="auth.can('projects.manage_members') && projects.current.members?.length" class="mt-6 max-w-7xl mx-auto">
        <h3 class="text-sm font-semibold text-lo uppercase tracking-wide mb-2">Mitglieder</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="m in projects.current.members" :key="m.id"
                class="px-3 py-1 bg-brand-subtle text-brand-700 rounded-full text-sm font-medium">
            {{ m.name }}
          </span>
        </div>
      </div>

      <ProjectPermissionsPanel
        v-if="auth.can('projects.manage_members')"
        :project-id="Number(route.params.id)"
        :users="allUsers" />
    </template>
    <div v-else class="text-center py-16 text-lo">Projekt nicht gefunden.</div>

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
        <div v-if="!editingTask">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="isSerie" class="rounded" />
            <span class="label mb-0">Serienbuchung (über mehrere Sprints)</span>
          </label>
        </div>
        <div>
          <label class="label">{{ isSerie && !editingTask ? 'Sprints' : 'Sprint' }}</label>
          <select v-if="!isSerie || editingTask" v-model="taskForm.sprint_id" class="input">
            <option :value="null">— Kein Sprint (Backlog) —</option>
            <option v-for="s in sprints.list" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <template v-else>
            <div class="border border-groove rounded-lg p-2 bg-surface max-h-44 overflow-y-auto space-y-1">
              <label v-for="s in sprints.list" :key="s.id"
                     class="flex items-center gap-2 cursor-pointer py-1 px-1 rounded hover:bg-lift">
                <input type="checkbox" :value="s.id" v-model="serieSprintIds" class="rounded shrink-0" />
                <span class="text-sm text-hi">{{ s.name }}</span>
              </label>
              <p v-if="!sprints.list.length" class="text-sm text-lo italic px-1">Keine Sprints vorhanden.</p>
            </div>
            <p v-if="serieSprintIds.length === 0" class="text-xs text-amber-600 mt-1">
              Bitte mindestens einen Sprint auswählen.
            </p>
            <p v-else class="text-xs text-lo mt-1">
              {{ serieSprintIds.length }} Sprint(s) ausgewählt — es werden {{ serieSprintIds.length }} Aufgaben erstellt.
            </p>
          </template>
        </div>
        <div>
          <label class="label">Geplante Zeit (Minuten)</label>
          <input v-model.number="taskForm.planned_duration_min" type="number" min="0" step="15"
                 class="input" placeholder="z.B. 120 (= 2h)" />
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button type="button" class="btn-secondary" @click="showTaskModal = false">Abbrechen</button>
          <button type="submit" class="btn-primary"
                  :disabled="isSerie && !editingTask && serieSprintIds.length === 0">
            <template v-if="editingTask">Aktualisieren</template>
            <template v-else-if="isSerie && serieSprintIds.length > 1">{{ serieSprintIds.length }} Aufgaben erstellen</template>
            <template v-else>Erstellen</template>
          </button>
        </div>
      </form>
    </Modal>

    <Modal v-model="showEdit" title="Projekt bearbeiten">
      <ProjectForm :project="projects.current" :users="allUsers" :loading="saving"
        @submit="saveProject" @cancel="showEdit = false" />
    </Modal>

    <Modal v-model="showDescEdit" title="Beschreibung bearbeiten">
      <form @submit.prevent="saveDescription" class="space-y-4">
        <textarea v-model="descDraft" class="input" rows="6" placeholder="Beschreibung (Markdown möglich)" />
        <div class="flex gap-2 justify-end">
          <button type="button" class="btn-secondary" @click="showDescEdit = false">Abbrechen</button>
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Speichern…' : 'Speichern' }}</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useTasksStore } from '../stores/tasks.js'
import { useUsersStore } from '../stores/users.js'
import { useTodosStore } from '../stores/todos.js'
import { useSprintsStore } from '../stores/sprints.js'
import { api } from '../api/index.js'
import KanbanBoard from '../components/KanbanBoard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import Modal from '../components/Modal.vue'
import ProjectForm from '../components/ProjectForm.vue'
import TodoList from '../components/TodoList.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import ProjectPermissionsPanel from '../components/ProjectPermissionsPanel.vue'

const route      = useRoute()
const auth       = useAuthStore()
const projects   = useProjectsStore()
const tasks      = useTasksStore()
const todos      = useTodosStore()
const sprints    = useSprintsStore()
const usersStore = useUsersStore()

const showTaskModal  = ref(false)
const showEdit       = ref(false)
const showDescEdit   = ref(false)
const descDraft      = ref('')
const editingTask    = ref(null)
const saving         = ref(false)

const canEditOwnDescription = computed(() =>
  !auth.can('projects.update') &&
  !!projects.current?.is_personal &&
  projects.current?.owner_id === auth.user?.id
)
const allUsers       = ref([])
const sprintFilter   = ref(null)
const isSerie        = ref(false)
const serieSprintIds = ref([])
const taskForm       = ref({
  title: '', description: '', status: 'offen',
  assignee_id: null, sprint_id: null, planned_duration_min: null,
})

const filteredTasks = computed(() => {
  if (sprintFilter.value === null) return tasks.list
  if (sprintFilter.value === 'backlog') return tasks.list.filter(t => !t.sprint_id)
  return tasks.list.filter(t => Number(t.sprint_id) === sprintFilter.value)
})

onMounted(async () => {
  const id = Number(route.params.id)
  await Promise.all([
    projects.fetchOne(id),
    tasks.fetchForProject(id),
    todos.fetchForProject(id),
    sprints.fetchAll(),
  ])
  if (auth.can('projects.manage_members')) {
    await usersStore.fetchAll()
    allUsers.value = usersStore.list.filter(u => u.role === 'lernender' && u.active)
  }
})

function addTask(status) {
  editingTask.value    = null
  isSerie.value        = false
  serieSprintIds.value = []
  taskForm.value       = { title: '', description: '', status, assignee_id: null, sprint_id: null, planned_duration_min: null }
  showTaskModal.value  = true
}

function duplicateTask(task) {
  editingTask.value    = null
  isSerie.value        = false
  serieSprintIds.value = []
  taskForm.value       = {
    title:                task.title,
    description:          task.description ?? '',
    status:               task.status,
    assignee_id:          null,
    sprint_id:            task.sprint_id   ?? null,
    planned_duration_min: task.planned_duration_min ?? null,
  }
  showTaskModal.value = true
}

function openEditTask(task) {
  editingTask.value   = task
  taskForm.value      = {
    title:                task.title,
    description:          task.description ?? '',
    status:               task.status,
    assignee_id:          task.assignee_id ?? null,
    sprint_id:            task.sprint_id   ?? null,
    planned_duration_min: task.planned_duration_min ?? null,
  }
  showTaskModal.value = true
}

async function saveTask() {
  const payload = { ...taskForm.value }
  if (!payload.planned_duration_min) payload.planned_duration_min = null
  if (editingTask.value) {
    await tasks.update(editingTask.value.id, payload)
  } else if (isSerie.value && serieSprintIds.value.length > 0) {
    await Promise.all(
      serieSprintIds.value.map(sprintId => api.createTask(tasks.projectId, { ...payload, sprint_id: sprintId }))
    )
    await tasks.fetchForProject(tasks.projectId)
  } else {
    await tasks.create(payload)
  }
  showTaskModal.value = false
}

async function moveTask(id, status) { await tasks.move(id, status) }

async function deleteTask(id) {
  await tasks.remove(id)
}

async function saveProject(body) {
  saving.value = true
  try { await projects.update(Number(route.params.id), body); showEdit.value = false }
  finally { saving.value = false }
}

function openDescEdit() {
  descDraft.value    = projects.current?.description ?? ''
  showDescEdit.value = true
}

async function saveDescription() {
  saving.value = true
  try {
    await projects.update(Number(route.params.id), { description: descDraft.value })
    showDescEdit.value = false
  } finally {
    saving.value = false
  }
}
</script>
