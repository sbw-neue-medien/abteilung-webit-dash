import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useTimeEntriesStore = defineStore('timeEntries', () => {
  const list    = ref([])
  const report  = ref({ summary: [], entries: [] })
  const loading = ref(false)

  async function fetchAll(params = {}) {
    loading.value = true
    try { list.value = await api.getTimeEntries(params) }
    finally { loading.value = false }
  }

  async function fetchReport(params = {}) {
    loading.value = true
    try { report.value = await api.getReport(params) }
    finally { loading.value = false }
  }

  async function create(body) {
    const res = await api.createTimeEntry(body)
    await fetchAll()
    return res
  }

  async function update(id, body) {
    await api.updateTimeEntry(id, body)
    await fetchAll()
  }

  async function remove(id) {
    await api.deleteTimeEntry(id)
    list.value = list.value.filter(e => e.id !== id)
  }

  return { list, report, loading, fetchAll, fetchReport, create, update, remove }
})
