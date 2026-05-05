<template>
  <div class="h-screen flex flex-col bg-bg text-hi overflow-hidden">
    <template v-if="auth.isLoggedIn">
      <TopBar />
      <div class="flex flex-1 overflow-hidden">
        <SideBar />
        <main class="flex-1 overflow-y-auto">
          <RouterView />
          <Footer />
        </main>
      </div>

      <!-- Mobile bottom nav -->
      <nav class="sm:hidden flex shrink-0 bg-black dark:bg-zinc-950 border-t border-white/10">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :title="link.label"
          :class="[
            'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
            isActive(link) ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          ]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="link.icon" />
          </svg>
        </RouterLink>
      </nav>
    </template>

    <main v-else class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import TopBar from './components/TopBar.vue'
import SideBar from './components/SideBar.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from './stores/auth.js'
import { useNavLinks } from './composables/useNavLinks.js'

const auth  = useAuthStore()
const route = useRoute()
const { links } = useNavLinks()

function isActive(link) {
  if (link.to === '/') return route.path === '/'
  return route.path.startsWith(link.to)
}
</script>
