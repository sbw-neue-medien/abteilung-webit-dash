<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-lo uppercase tracking-wide">Todo-Liste</h3>
      <button class="btn-primary text-xs py-1 px-3" @click="openAdd">
        <svg class="w-3 h-3 inline -mt-0.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Todo
      </button>
    </div>

    <div v-if="todos.loading" class="text-lo italic text-sm py-4 text-center">Laden…</div>

    <div v-else-if="todos.list.length === 0" class="text-lo text-sm py-4 text-center">
      Noch keine Todos vorhanden.
    </div>

    <ul v-else class="space-y-2">
      <li v-for="todo in todos.list" :key="todo.id"
          class="flex items-start gap-3 bg-surface rounded-lg border border-line px-4 py-3 shadow-sm"
          :class="{ 'opacity-50': todo.done }">
        <button @click="toggleDone(todo)" class="mt-0.5 shrink-0 text-brand-600 hover:text-brand-700">
          <svg v-if="todo.done" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <svg v-else class="w-5 h-5 text-lo hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" stroke-width="2"/>
          </svg>
        </button>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-hi" :class="{ 'line-through text-lo': todo.done }">
            {{ todo.title }}
          </p>
          <MarkdownRenderer v-if="todo.description" class="mt-0.5 text-xs" :content="todo.description" />
          <div class="flex flex-wrap items-center gap-3 mt-1.5">
            <span class="flex items-center gap-1" :class="priorityColor(todo.priority)" :title="priorityLabel(todo.priority)">
              <PriorityIcon :level="Number(todo.priority)" class="w-4 h-4" />
              <span class="text-xs">{{ priorityLabel(todo.priority) }}</span>
            </span>
            <span class="text-xs text-lo">{{ todo.creator_name }}</span>
          </div>
        </div>

        <div v-if="canModify(todo)" class="flex gap-1 shrink-0">
          <button @click="openEdit(todo)" class="text-lo hover:text-brand-600 p-1 rounded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <ConfirmButton label="Todo wirklich löschen?" @confirm="remove(todo.id)" class="text-lo hover:text-red-500 p-1 rounded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </ConfirmButton>
        </div>
      </li>
    </ul>

    <Modal v-model="showModal" :title="editing ? 'Todo bearbeiten' : 'Neues Todo'">
      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="label">Titel *</label>
          <input v-model="form.title" class="input" required />
        </div>
        <div>
          <MarkdownTextarea label="Beschreibung" v-model="form.description" :rows="2" />
        </div>
        <div>
          <label class="label">Priorität</label>
          <div class="flex gap-2 mt-1">
            <button
              v-for="lvl in [1,2,3,4,5]" :key="lvl"
              type="button"
              @click="form.priority = lvl"
              class="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg ring-1 transition-colors"
              :class="form.priority === lvl
                ? 'ring-2 ring-brand-500 bg-brand-subtle ' + priorityColor(lvl)
                : 'ring-line text-lo hover:text-mid'"
            >
              <PriorityIcon :level="lvl" class="w-4 h-4" />
              <span class="text-xs">{{ lvl }}</span>
            </button>
          </div>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button type="button" class="btn-secondary" @click="showModal = false">Abbrechen</button>
          <button type="submit" class="btn-primary">{{ editing ? 'Aktualisieren' : 'Erstellen' }}</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTodosStore } from '../stores/todos.js'
import { useAuthStore } from '../stores/auth.js'
import ConfirmButton from './ConfirmButton.vue'
import Modal from './Modal.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import MarkdownTextarea from './MarkdownTextarea.vue'
import PriorityIcon from './PriorityIcon.vue'

const todos = useTodosStore()
const auth  = useAuthStore()

const showModal = ref(false)
const editing   = ref(null)
const form      = ref({ title: '', description: '', priority: 3 })

const PRIORITY_LABELS = ['', 'Niedrig', 'Gering', 'Mittel', 'Hoch', 'Kritisch']
const PRIORITY_COLORS = ['', 'text-lo', 'text-blue-400', 'text-amber-400', 'text-orange-500', 'text-red-500']

function priorityLabel(p) { return PRIORITY_LABELS[Number(p)] ?? 'Mittel' }
function priorityColor(p) { return PRIORITY_COLORS[Number(p)] ?? 'text-lo' }

function canModify(todo) {
  return auth.can('todos.update_all') || Number(todo.created_by) === Number(auth.user?.id)
}

function openAdd() {
  editing.value   = null
  form.value      = { title: '', description: '', priority: 3 }
  showModal.value = true
}

function openEdit(todo) {
  editing.value = todo
  form.value = {
    title:       todo.title,
    description: todo.description ?? '',
    priority:    Number(todo.priority) || 3,
  }
  showModal.value = true
}

async function save() {
  if (editing.value) {
    await todos.update(editing.value.id, form.value)
  } else {
    await todos.create(form.value)
  }
  showModal.value = false
}

async function toggleDone(todo) {
  await todos.update(todo.id, { done: !todo.done })
}

async function remove(id) {
  await todos.remove(id)
}
</script>
