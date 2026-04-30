<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-surface rounded-2xl shadow-xl p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-hi">Neues Passwort</h1>
        <p class="text-mid text-sm mt-1">WebIT Abteilung</p>
      </div>

      <!-- Invalid / missing token -->
      <div v-if="!token" class="text-center space-y-4">
        <p class="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-lg px-3 py-2">
          Ungültiger oder fehlender Reset-Link.
        </p>
        <router-link to="/login" class="text-sm text-brand-600 hover:underline">Zurück zum Login</router-link>
      </div>

      <!-- Success -->
      <div v-else-if="success" class="text-center space-y-4">
        <p class="text-sm text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-400 rounded-lg px-3 py-2">
          Passwort erfolgreich geändert.
        </p>
        <router-link to="/login" class="btn-primary inline-flex justify-center w-full">Zum Login</router-link>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="label">Neues Passwort</label>
          <input v-model="password" type="password" class="input" required minlength="8"
                 autocomplete="new-password" placeholder="Mindestens 8 Zeichen" />
        </div>
        <div>
          <label class="label">Passwort bestätigen</label>
          <input v-model="confirm" type="password" class="input" required autocomplete="new-password" />
        </div>
        <p v-if="error" class="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-lg px-3 py-2">
          {{ error }}
        </p>
        <button type="submit" class="btn-primary w-full justify-center" :disabled="loading">
          {{ loading ? 'Speichern…' : 'Passwort speichern' }}
        </button>
        <p class="text-center">
          <router-link to="/login" class="text-sm text-brand-600 hover:underline">Zurück zum Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api/index.js'

const route   = useRoute()
const token   = route.query.token || ''
const password = ref('')
const confirm  = ref('')
const loading  = ref(false)
const error    = ref(null)
const success  = ref(false)

async function submit() {
  error.value = null
  if (password.value !== confirm.value) {
    error.value = 'Passwörter stimmen nicht überein'
    return
  }
  loading.value = true
  try {
    await api.resetPassword({ token, password: password.value })
    success.value = true
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
