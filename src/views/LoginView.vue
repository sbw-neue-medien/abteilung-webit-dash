<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-surface rounded-2xl shadow-xl p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-hi">WebIT Abteilung</h1>
        <p class="text-mid text-sm mt-1">Bitte anmelden</p>
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
        <p v-if="error" class="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-lg px-3 py-2">{{ error }}</p>
        <button type="submit" class="btn-primary w-full justify-center" :disabled="loading">
          {{ loading ? 'Anmelden…' : 'Anmelden' }}
        </button>
        <p class="text-center">
          <button type="button" class="text-sm text-brand-600 hover:underline" @click="showForgot = true">
            Passwort vergessen?
          </button>
        </p>
      </form>
    </div>

    <Modal v-model="showForgot" title="Passwort zurücksetzen">
      <div v-if="forgotSent" class="text-sm text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-400 rounded-lg px-3 py-2">
        Wenn diese E-Mail-Adresse registriert ist, wurde eine Reset-E-Mail versandt.
      </div>
      <form v-else @submit.prevent="requestReset" class="space-y-4">
        <p class="text-sm text-mid">Gib deine E-Mail-Adresse ein. Du erhältst einen Link zum Zurücksetzen deines Passworts.</p>
        <div>
          <label class="label">E-Mail-Adresse</label>
          <input v-model="forgotEmail" type="email" class="input" required autocomplete="email" />
        </div>
        <p v-if="forgotError" class="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-lg px-3 py-2">
          {{ forgotError }}
        </p>
        <div class="flex gap-2 justify-end">
          <button type="button" class="btn btn-secondary" @click="showForgot = false">Abbrechen</button>
          <button type="submit" class="btn-primary" :disabled="forgotLoading">
            {{ forgotLoading ? 'Senden…' : 'Link senden' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { api } from '../api/index.js'
import Modal from '../components/Modal.vue'

const auth     = useAuthStore()
const router   = useRouter()
const username = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref(null)

const showForgot   = ref(false)
const forgotEmail  = ref('')
const forgotLoading = ref(false)
const forgotError  = ref(null)
const forgotSent   = ref(false)

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

async function requestReset() {
  forgotLoading.value = true
  forgotError.value   = null
  try {
    await api.forgotPassword({ email: forgotEmail.value })
    forgotSent.value = true
  } catch (e) {
    forgotError.value = e.message
  } finally {
    forgotLoading.value = false
  }
}
</script>
