<template>
  <div class="min-h-screen flex flex-col bg-bg text-hi">
    <NavBar v-if="auth.isLoggedIn" />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer v-if="auth.isLoggedIn" />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from './stores/auth.js'

const auth = useAuthStore()
</script>
