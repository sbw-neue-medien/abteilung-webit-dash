<template>
  <header class="h-14 bg-black dark:bg-zinc-950 text-white flex items-center justify-between px-4 shrink-0">
    <div class="flex items-center gap-4">
      <span class="font-bold text-lg tracking-tight">WebIT Abteilung</span>
      <RouterLink v-if="auth.can('werkstatt.view')" to="/werkstatt"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        :class="{ '!text-white !bg-white/15': route.path === '/werkstatt' }">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="hidden sm:inline">Werkstatt</span>
      </RouterLink>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm text-neutral-400 hidden sm:block mr-1">{{ auth.user?.name }}</span>
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
  </header>
  <HelpModal v-model="showHelp" />
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useDarkMode } from '../composables/useDarkMode.js'
import HelpModal from './HelpModal.vue'

const auth     = useAuthStore()
const route    = useRoute()
const { isDark, toggle } = useDarkMode()
const showHelp = ref(false)

function logout() {
  auth.logout()
  window.location.href = '/login'
}
</script>
