import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useTasksStore = defineStore('tasks', () => {
  const list      = ref([])
  const projectId = ref(null)
  const loading   = ref(false)

  async function fetchForProject(pid) {
    loading.value   = true
    projectId.value = pid
    try { list.value = await api.getTasks(pid) }
    finally { loading.value = false }
  }

  async function create(body) {
    const res = await api.createTask(projectId.value, body)
    await fetchForProject(projectId.value)
    return res
  }

  async function update(id, body) {
    await api.updateTask(id, body)
    await fetchForProject(projectId.value)
  }

  async function move(id, status) {
    const task = list.value.find(t => t.id === id)
    if (task) task.status = status
    try {
      await api.moveTask(id, status)
    } catch {
      await fetchForProject(projectId.value)
    }
  }

  async function remove(id) {
    await api.deleteTask(id)
    list.value = list.value.filter(t => t.id !== id)
  }

  return { list, projectId, loading, fetchForProject, create, update, move, remove }
})
