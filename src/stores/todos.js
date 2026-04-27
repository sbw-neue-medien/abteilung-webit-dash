import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useTodosStore = defineStore('todos', () => {
  const list      = ref([])
  const projectId = ref(null)
  const loading   = ref(false)

  async function fetchForProject(pid) {
    loading.value   = true
    projectId.value = pid
    try { list.value = await api.getTodos(pid) }
    finally { loading.value = false }
  }

  async function create(body) {
    await api.createTodo(projectId.value, body)
    await fetchForProject(projectId.value)
  }

  async function update(id, body) {
    await api.updateTodo(id, body)
    await fetchForProject(projectId.value)
  }

  async function remove(id) {
    await api.deleteTodo(id)
    list.value = list.value.filter(t => t.id !== id)
  }

  return { list, projectId, loading, fetchForProject, create, update, remove }
})
