import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useSprintsStore = defineStore('sprints', () => {
  const list      = ref([])
  const projectId = ref(null)
  const loading   = ref(false)

  async function fetchForProject(pid) {
    loading.value   = true
    projectId.value = pid
    try { list.value = await api.getSprints(pid) }
    finally { loading.value = false }
  }

  async function create(body) {
    const res = await api.createSprint(projectId.value, body)
    await fetchForProject(projectId.value)
    return res
  }

  async function update(id, body) {
    await api.updateSprint(id, body)
    await fetchForProject(projectId.value)
  }

  async function remove(id) {
    await api.deleteSprint(id)
    list.value = list.value.filter(s => s.id !== id)
  }

  return { list, projectId, loading, fetchForProject, create, update, remove }
})
