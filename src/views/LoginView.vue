<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-slate-800">WebIT Abteilung</h1>
        <p class="text-slate-500 text-sm mt-1">Bitte anmelden</p>
      </div>
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="label">Benutzername</label>
          <input v-model="username" type="text" class="input" required autofocus
                 autocomplete="username" placeholder="benutzername" />
        </div>
        <div>
          <label class="label">Passwort</label>
          <input v-model="password" type="password" class="input" required autocomplete="current-password" />
        </div>
        <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</p>
        <button type="submit" class="btn-primary w-full justify-center" :disabled="loading">
          {{ loading ? 'Anmelden…' : 'Anmelden' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth     = useAuthStore()
const router   = useRouter()
const username = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref(null)

async function login() {
  loading.value = true
  error.value   = null
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
