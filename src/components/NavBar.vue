<template>
  <nav class="bg-brand-700 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
      <div class="flex items-center gap-6">
        <span class="font-bold text-lg tracking-tight">WebIT Abteilung</span>
        <div class="hidden sm:flex items-center gap-1">
          <RouterLink v-for="link in links" :key="link.to" :to="link.to"
            class="px-3 py-1.5 rounded-md text-sm font-medium text-indigo-200 hover:text-white hover:bg-brand-600 transition-colors"
            active-class="!text-white !bg-brand-600">
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-indigo-200">{{ auth.user?.name }}</span>
        <button @click="logout"
          class="text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
          Abmelden
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth   = useAuthStore()
const router = useRouter()

const links = computed(() => {
  const base = [
    { to: '/',              label: 'Dashboard' },
    { to: '/projekte',      label: 'Projekte' },
    { to: '/zeiterfassung', label: 'Zeiterfassung' },
    { to: '/mein-bereich',  label: 'Mein Bereich' },
  ]
  if (auth.isLeiter) base.push({ to: '/lernende', label: 'Lernende' })
  return base
})

function logout() {
  auth.logout()
  router.push('/login')
}
</script>
