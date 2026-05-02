import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useFooterLinksStore = defineStore('footerLinks', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try { list.value = await api.getFooterLinks() }
    finally { loading.value = false }
  }

  async function create(body) {
    const res = await api.createFooterLink(body)
    await fetchAll()
    return res
  }

  async function update(id, body) {
    await api.updateFooterLink(id, body)
    await fetchAll()
  }

  async function remove(id) {
    await api.deleteFooterLink(id)
    list.value = list.value.filter(l => l.id !== id)
  }

  return { list, loading, fetchAll, create, update, remove }
})
