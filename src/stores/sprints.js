import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useSprintsStore = defineStore('sprints', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try { list.value = await api.getSprints() }
    finally { loading.value = false }
  }

  async function create(body) {
    const res = await api.createSprint(body)
    await fetchAll()
    return res
  }

  async function update(id, body) {
    await api.updateSprint(id, body)
    await fetchAll()
  }

  async function remove(id) {
    await api.deleteSprint(id)
    list.value = list.value.filter(s => s.id !== id)
  }

  return { list, loading, fetchAll, create, update, remove }
})
