<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label class="label">Benutzername *</label>
      <input v-model="form.username" type="text" class="input" required
             autocomplete="username" placeholder="z.B. m.mueller" />
    </div>
    <div>
      <label class="label">Vollständiger Name *</label>
      <input v-model="form.name" class="input" required placeholder="z.B. Max Müller" />
    </div>
    <div>
      <label class="label">E-Mail</label>
      <input v-model="form.email" type="email" class="input" placeholder="z.B. max.mueller@betrieb.ch" />
    </div>
    <div>
      <label class="label">{{ mentor ? 'Neues Passwort (leer = unverändert)' : 'Passwort *' }}</label>
      <input v-model="form.password" type="password" class="input" :required="!mentor" autocomplete="new-password" />
    </div>
    <div class="flex gap-2 justify-end pt-2">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Abbrechen</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Speichern…' : (mentor ? 'Aktualisieren' : 'Anlegen') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ mentor: Object, loading: Boolean })
const emit  = defineEmits(['submit', 'cancel'])

const form = ref({ username: '', name: '', email: '', password: '' })

watch(() => props.mentor, (m) => {
  if (!m) return
  form.value = { username: m.username, name: m.name, email: m.email ?? '', password: '' }
}, { immediate: true })

function submit() { emit('submit', { ...form.value }) }
</script>
