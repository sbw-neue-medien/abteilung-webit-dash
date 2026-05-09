<template>
  <div class="relative" ref="root">
    <button
      @click="toggle"
      class="relative p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
      title="Benachrichtigungen">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
      <span v-if="notifications.unseenCount"
            class="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
        {{ notifications.unseenCount > 99 ? '99+' : notifications.unseenCount }}
      </span>
    </button>

    <Teleport to="body">
      <div v-if="open"
           class="fixed z-50 bg-surface ring-1 ring-line shadow-xl rounded-xl w-80 max-h-[70vh] flex flex-col overflow-hidden"
           :style="panelStyle">
        <div class="flex items-center justify-between px-4 py-3 border-b border-groove shrink-0">
          <span class="text-sm font-semibold text-hi">Benachrichtigungen</span>
          <div class="flex items-center gap-2">
            <span v-if="notifications.loading" class="text-xs text-lo">Laden…</span>
            <a v-if="auth.isLeiter && feedUrl" :href="feedUrl" target="_blank" rel="noopener"
               class="text-xs text-lo hover:text-brand-600 transition-colors" title="RSS Feed abonnieren">
              RSS
            </a>
          </div>
        </div>

        <ul v-if="notifications.list.length" class="overflow-y-auto divide-y divide-groove">
          <li v-for="n in notifications.list" :key="n.correlation_id ?? n.created_at"
              class="px-4 py-3 hover:bg-lift transition-colors">
            <p class="text-sm text-hi font-medium leading-snug">{{ n.subject }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-lo">{{ formatDate(n.created_at) }}</span>
              <span v-if="n.recipient_count > 1" class="text-xs text-lo">· {{ n.recipient_count }} Empfänger</span>
            </div>
          </li>
        </ul>
        <div v-else class="px-4 py-8 text-center text-sm text-lo italic">
          Keine Benachrichtigungen.
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '../stores/notifications.js'
import { useAuthStore } from '../stores/auth.js'
import { api } from '../api/index.js'

const notifications = useNotificationsStore()
const auth     = useAuthStore()
const open     = ref(false)
const root     = ref(null)
const panelStyle = ref({})
const feedUrl  = ref(null)

function toggle() {
  open.value = !open.value
  if (open.value) {
    notifications.markSeen()
    positionPanel()
  }
}

function positionPanel() {
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return
  panelStyle.value = {
    top:   `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
}

function onClickOutside(e) {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.floor((now - d) / 60000)
  if (diffMin < 1)   return 'Gerade eben'
  if (diffMin < 60)  return `vor ${diffMin} Min.`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)    return `vor ${diffH} Std.`
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'short' })
}

onMounted(async () => {
  notifications.fetchAll()
  if (auth.isLeiter) {
    const res = await api.getNotificationFeedUrl()
    feedUrl.value = res?.url ?? null
  }
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>
