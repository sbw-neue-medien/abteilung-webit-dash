import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index.js'

const SEEN_KEY = 'notifications-last-seen'

export const useNotificationsStore = defineStore('notifications', () => {
  const list    = ref([])
  const loading = ref(false)

  const lastSeen = ref(localStorage.getItem(SEEN_KEY) ?? '1970-01-01T00:00:00')

  const unseenCount = computed(() =>
    list.value.filter(n => n.created_at > lastSeen.value).length
  )

  async function fetchAll() {
    loading.value = true
    try { list.value = await api.getNotifications() }
    finally { loading.value = false }
  }

  function markSeen() {
    const now = new Date().toISOString()
    lastSeen.value = now
    localStorage.setItem(SEEN_KEY, now)
  }

  return { list, loading, unseenCount, fetchAll, markSeen }
})
