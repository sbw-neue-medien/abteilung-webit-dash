import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useProjectsStore = defineStore('projects', () => {
  const list    = ref([])
  const current = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try { list.value = await api.getProjects() }
    catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function fetchOne(id) {
    loading.value = true
    error.value   = null
    try { current.value = await api.getProject(id) }
    catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function create(body) {
    const res = await api.createProject(body)
    await fetchAll()
    return res
  }

  async function update(id, body) {
    await api.updateProject(id, body)
    await fetchAll()
    if (current.value?.id === id) await fetchOne(id)
  }

  async function remove(id) {
    await api.deleteProject(id)
    list.value = list.value.filter(p => p.id !== id)
  }

  return { list, current, loading, error, fetchAll, fetchOne, create, update, remove }
})
