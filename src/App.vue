<template>
  <div class="min-h-screen flex flex-col">
    <NavBar v-if="auth.isLoggedIn" />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth.js'

const auth = useAuthStore()
</script>
