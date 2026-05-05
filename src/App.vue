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
    </template>
    <main v-else class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import TopBar from './components/TopBar.vue'
import SideBar from './components/SideBar.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from './stores/auth.js'

const auth = useAuthStore()
</script>
