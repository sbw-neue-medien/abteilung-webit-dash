<template>
  <nav class="bg-black dark:bg-zinc-950 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
      <div class="flex items-center gap-6">
        <span class="font-bold text-lg tracking-tight">WebIT Abteilung</span>
        <div class="hidden sm:flex items-center gap-1">
          <RouterLink v-for="link in links" :key="link.to" :to="link.to"
            class="px-3 py-1.5 rounded-md text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            active-class="!text-brand-500 !bg-white/10">
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-neutral-400 hidden sm:block">{{ auth.user?.name }}</span>
        <button @click="toggle"
          class="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          :title="isDark ? 'Helles Design' : 'Dunkles Design'">
          <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>
        <button @click="showHelp = true"
          class="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Hilfe">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
        <button @click="logout"
          class="text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
          Abmelden
        </button>
      </div>
    </div>
  </nav>
  <HelpModal v-model="showHelp" />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useDarkMode } from '../composables/useDarkMode.js'
import HelpModal from './HelpModal.vue'

const auth     = useAuthStore()
const { isDark, toggle } = useDarkMode()
const showHelp = ref(false)

const links = computed(() => {
  const base = [
    { to: '/',              label: 'Dashboard' },
    { to: '/projekte',      label: 'Projekte' },
    { to: '/zeiterfassung', label: 'Zeiterfassung' },
  ]
  if (!auth.isMentor)             base.push({ to: '/mein-bereich',  label: 'Mein Bereich' })
  if (auth.can('sprints.manage')) base.push({ to: '/sprints',       label: 'Sprints' })
  if (auth.can('users.list'))     base.push({ to: '/lernende',      label: 'Lernpartner' })
  if (auth.can('mentors.manage')) base.push({ to: '/mentoren',      label: 'Coaches' })
  if (auth.can('werkstatt.view')) base.push({ to: '/werkstatt',     label: 'Werkstatt' })
  return base
})

function logout() {
  auth.logout()
  window.location.href = '/login'
}
</script>
