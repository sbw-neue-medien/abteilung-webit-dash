<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label class="label">Benutzername *</label>
      <input v-model="form.username" type="text" class="input" required
             autocomplete="username" placeholder="z.B. anna.berger" />
    </div>
    <div>
      <label class="label">Vollständiger Name *</label>
      <input v-model="form.name" class="input" required placeholder="z.B. Anna Berger" />
    </div>
    <div>
      <label class="label">E-Mail</label>
      <input v-model="form.email" type="email" class="input" placeholder="z.B. anna.berger@schule.ch" />
    </div>
    <div>
      <label class="label">{{ user ? 'Neues Passwort (leer = unverändert)' : 'Passwort *' }}</label>
      <input v-model="form.password" type="password" class="input" :required="!user" autocomplete="new-password" />
    </div>
    <div class="flex gap-2 justify-end pt-2">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Abbrechen</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Speichern…' : (user ? 'Aktualisieren' : 'Anlegen') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ user: Object, loading: Boolean })
const emit  = defineEmits(['submit', 'cancel'])

const form = ref({ username: '', name: '', email: '', password: '' })

watch(() => props.user, (u) => {
  if (!u) return
  form.value = { username: u.username, name: u.name, email: u.email ?? '', password: '' }
}, { immediate: true })

function submit() { emit('submit', { ...form.value }) }
</script>
