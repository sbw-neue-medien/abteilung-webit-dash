import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index.js'

function tokenExp(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))?.exp ?? 0
  } catch { return 0 }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user  = ref(JSON.parse(localStorage.getItem('user') ?? 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isLeiter   = computed(() => user.value?.role === 'leiter')
  const isMentor   = computed(() => user.value?.role === 'mentor')

  let refreshTimer = null

  function startRefreshInterval() {
    stopRefreshInterval()
    refreshTimer = setInterval(async () => {
      if (!token.value) return
      const remaining = tokenExp(token.value) - Math.floor(Date.now() / 1000)
      if (remaining < 1800) {
        try {
          const res = await api.refreshToken()
          token.value = res.token
          localStorage.setItem('token', res.token)
        } catch { /* 401 wird von req() behandelt */ }
      }
    }, 5 * 60 * 1000)
  }

  function stopRefreshInterval() {
    clearInterval(refreshTimer)
    refreshTimer = null
  }

  async function login(username, password) {
    const data = await api.login({ username, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    startRefreshInterval()
  }

  function logout() {
    stopRefreshInterval()
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (token.value) startRefreshInterval()

  return { token, user, isLoggedIn, isLeiter, isMentor, login, logout }
})
