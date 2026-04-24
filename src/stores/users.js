import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useUsersStore = defineStore('users', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try { list.value = await api.getUsers() }
    finally { loading.value = false }
  }

  async function create(body) {
    const res = await api.createUser(body)
    await fetchAll()
    return res
  }

  async function update(id, body) {
    await api.updateUser(id, body)
    await fetchAll()
  }

  async function remove(id) {
    await api.deleteUser(id)
    list.value = list.value.filter(u => u.id !== id)
  }

  return { list, loading, fetchAll, create, update, remove }
})
