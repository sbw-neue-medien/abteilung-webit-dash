import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user  = ref(JSON.parse(localStorage.getItem('user') ?? 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isLeiter   = computed(() => user.value?.role === 'leiter')
  const isMentor   = computed(() => user.value?.role === 'mentor')

  async function login(username, password) {
    const data = await api.login({ username, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isLoggedIn, isLeiter, isMentor, login, logout }
})
