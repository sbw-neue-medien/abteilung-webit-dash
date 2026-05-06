import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index.js'

function tokenExp(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))?.exp ?? 0
  } catch { return 0 }
}

const ROLE_PERMISSIONS = {
  leiter: new Set([
    'projects.list', 'projects.read', 'projects.create', 'projects.update',
    'projects.delete', 'projects.manage_members',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete', 'tasks.move',
    'sprints.read', 'sprints.manage',
    'time_entries.create', 'time_entries.read_own', 'time_entries.read_all',
    'time_entries.update_own', 'time_entries.update_all',
    'time_entries.delete_own', 'time_entries.delete_all',
    'todos.read', 'todos.create', 'todos.update_own', 'todos.update_all',
    'todos.delete_own', 'todos.delete_all',
    'users.list', 'users.read', 'users.create', 'users.update', 'users.delete',
    'users.update_own_password',
    'mentors.list', 'mentors.manage', 'mentors.assign',
    'reports.view_own', 'reports.view_all',
    'settings.manage', 'werkstatt.view',
  ]),
  lernender: new Set([
    'projects.list', 'projects.read',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete', 'tasks.move',
    'sprints.read',
    'time_entries.create', 'time_entries.read_own',
    'time_entries.update_own', 'time_entries.delete_own',
    'todos.read', 'todos.create', 'todos.update_own', 'todos.delete_own',
    'users.read', 'users.update_own_password',
    'reports.view_own',
  ]),
  mentor: new Set([
    'projects.list', 'projects.read',
    'tasks.read',
    'sprints.read',
    'time_entries.read_own', 'time_entries.read_all',
    'todos.read',
    'users.list', 'users.read', 'users.update_own_password',
    'reports.view_own', 'reports.view_all',
  ]),
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user  = ref(JSON.parse(localStorage.getItem('user') ?? 'null'))

  // Effective permissions fetched from API; falls back to role map until loaded
  const storedPerms = localStorage.getItem('permissions')
  const permissions = ref(
    storedPerms ? new Set(JSON.parse(storedPerms)) : ROLE_PERMISSIONS[user.value?.role] ?? new Set()
  )

  const isLoggedIn = computed(() => !!token.value)
  const isLeiter   = computed(() => user.value?.role === 'leiter')
  const isMentor   = computed(() => user.value?.role === 'mentor')

  const can = (permission) => permissions.value.has(permission)

  function setPermissions(list) {
    permissions.value = new Set(list)
    localStorage.setItem('permissions', JSON.stringify(list))
  }

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
          if (res.permissions) setPermissions(res.permissions)
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
    setPermissions(data.permissions ?? [])
    startRefreshInterval()
  }

  function logout() {
    stopRefreshInterval()
    token.value = null
    user.value  = null
    permissions.value = new Set()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
  }

  // Hydrate permissions from API on page load (ensures overrides are reflected)
  if (token.value) {
    startRefreshInterval()
    api.getMyPermissions().then(data => setPermissions(data.permissions)).catch(() => {})
  }

  return { token, user, isLoggedIn, isLeiter, isMentor, can, login, logout }
})
