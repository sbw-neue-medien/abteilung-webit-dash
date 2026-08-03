import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index.js'

export const useSprintsStore = defineStore('sprints', () => {
  const list    = ref([])
  const loading = ref(false)
  const cutoff  = ref(null)

  const visibleList = computed(() =>
    cutoff.value ? list.value.filter(s => s.start_date >= cutoff.value) : list.value
  )

  async function fetchAll() {
    loading.value = true
    try { list.value = await api.getSprints() }
    finally { loading.value = false }
  }

  async function fetchCutoff() {
    const res = await api.getSprintCutoff()
    cutoff.value = res.cutoff
  }

  async function create(body) {
    const res = await api.createSprint(body)
    await fetchAll()
    return res
  }

  async function createPeriod(rows) {
    const res = await api.createSprintPeriod(rows)
    await Promise.all([fetchAll(), fetchCutoff()])
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

  return { list, loading, cutoff, visibleList, fetchAll, fetchCutoff, create, createPeriod, update, remove }
})
