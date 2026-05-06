<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">
    <h1 class="text-2xl font-bold text-hi">Mein Bereich</h1>

    <div class="card flex items-center gap-5">
      <UserAvatar :userId="auth.user?.id" :name="auth.user?.name" :hasAvatar="auth.user?.avatar" size="lg" class="w-16 h-16 text-2xl" />
      <div class="flex-1">
        <h2 class="text-xl font-semibold text-hi">{{ auth.user?.name }}</h2>
        <p class="text-sm text-mid">{{ auth.user?.role === 'leiter' ? 'Abteilungsleiter' : auth.user?.role === 'mentor' ? 'Coach' : 'Lernpartner' }}</p>
      </div>
      <button class="btn-secondary" @click="showPwModal = true">Passwort ändern</button>
    </div>

    <div v-if="auth.can('settings.manage')" class="card flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-hi">E-Mail-Benachrichtigungen</p>
        <p class="text-xs text-lo mt-0.5">Benachrichtigung wenn eine Aufgabe zur Review verschoben wird</p>
      </div>
      <button @click="toggleNotifications"
              :class="emailNotifications ? 'bg-brand-600' : 'bg-lift'"
              class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ring-1 ring-line">
        <span :class="emailNotifications ? 'translate-x-5' : 'translate-x-0'"
              class="inline-block h-5 w-5 mt-0.5 ml-0.5 rounded-full bg-surface shadow transition-transform" />
      </button>
    </div>

    <section>
      <h2 class="text-sm font-semibold text-lo uppercase tracking-wide mb-3">Meine Projekte</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <RouterLink v-for="p in projects.list" :key="p.id" :to="`/projekte/${p.id}`"
          class="card hover:shadow-md transition-shadow flex items-start justify-between gap-2 cursor-pointer">
          <div>
            <p class="font-semibold text-hi">{{ p.name }}</p>
            <p v-if="p.is_personal" class="text-xs text-brand-600 mt-0.5">Eigenprojekt</p>
          </div>
          <StatusBadge :status="p.status" />
        </RouterLink>
        <div v-if="!projects.list.length" class="col-span-2 text-center py-8 text-lo italic">
          Keine Projekte zugewiesen.
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-lo uppercase tracking-wide">Meine Stunden</h2>
        <RouterLink to="/zeiterfassung" class="text-sm text-brand-600 hover:underline">Alle anzeigen →</RouterLink>
      </div>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="card text-center">
          <div class="text-2xl font-bold text-brand-600">{{ formatMin(weekMin) }}</div>
          <div class="text-xs text-lo mt-1">Diese Woche</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-hi">{{ formatMin(monthMin) }}</div>
          <div class="text-xs text-lo mt-1">Dieser Monat</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-hi">{{ recentEntries.length }}</div>
          <div class="text-xs text-lo mt-1">Letzte Einträge</div>
        </div>
      </div>
      <div class="card overflow-hidden p-0">
        <table class="min-w-full text-sm">
          <thead class="bg-lift border-b border-line">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-mid">Datum</th>
              <th class="px-4 py-3 text-left font-medium text-mid">Projekt</th>
              <th class="px-4 py-3 text-left font-medium text-mid">Dauer</th>
              <th class="px-4 py-3 text-left font-medium text-mid">Tätigkeit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-groove">
            <tr v-for="e in recentEntries" :key="e.id" class="hover:bg-lift">
              <td class="px-4 py-3 text-mid">{{ formatDate(e.date) }}</td>
              <td class="px-4 py-3 text-mid">{{ e.project_name }}</td>
              <td class="px-4 py-3 font-medium text-hi">{{ formatMin(e.duration_min) }}</td>
              <td class="px-4 py-3 text-mid truncate max-w-xs">{{ e.description || '—' }}</td>
            </tr>
            <tr v-if="!recentEntries.length">
              <td colspan="4" class="px-4 py-6 text-center text-lo italic">Noch keine Einträge.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Modal v-model="showPwModal" title="Passwort ändern">
      <form @submit.prevent="changePw" class="space-y-4">
        <div>
          <label class="label">Aktuelles Passwort</label>
          <input v-model="currentPw" type="password" class="input" required autocomplete="current-password" />
        </div>
        <div>
          <label class="label">Neues Passwort <span class="text-lo font-normal">(min. 8 Zeichen)</span></label>
          <input v-model="newPw" type="password" class="input" required autocomplete="new-password" minlength="8" />
        </div>
        <div>
          <label class="label">Neues Passwort bestätigen</label>
          <input v-model="confirmPw" type="password" class="input" required autocomplete="new-password" />
        </div>
        <p v-if="pwError" class="text-sm text-red-500">{{ pwError }}</p>
        <p v-if="pwSuccess" class="text-sm text-brand-600">{{ pwSuccess }}</p>
        <div class="flex gap-2 justify-end">
          <button type="button" class="btn-secondary" @click="closePwModal">Abbrechen</button>
          <button type="submit" class="btn-primary" :disabled="pwLoading">
            {{ pwLoading ? 'Speichern…' : 'Speichern' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'
import { useTimeEntriesStore } from '../stores/timeEntries.js'
import { api } from '../api/index.js'
import StatusBadge from '../components/StatusBadge.vue'
import Modal from '../components/Modal.vue'
import UserAvatar from '../components/UserAvatar.vue'

const auth      = useAuthStore()
const projects  = useProjectsStore()
const timeStore = useTimeEntriesStore()

const emailNotifications = ref(!!auth.user?.email_notifications)

async function toggleNotifications() {
  const next = !emailNotifications.value
  try {
    await api.updateUser(auth.user.id, { email_notifications: next })
    emailNotifications.value = next
    auth.user.email_notifications = next ? 1 : 0
  } catch (e) { /* ignorieren, Toggle springt nicht um */ }
}

const showPwModal = ref(false)
const currentPw   = ref('')
const newPw       = ref('')
const confirmPw   = ref('')
const pwError     = ref('')
const pwSuccess   = ref('')
const pwLoading   = ref(false)

function closePwModal() {
  showPwModal.value = false
  currentPw.value = ''; newPw.value = ''; confirmPw.value = ''
  pwError.value = ''; pwSuccess.value = ''
}

function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const now        = new Date()
const today      = localDate()
const monday     = (() => { const d = new Date(); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); return localDate(d) })()
const monthStart = localDate(new Date(now.getFullYear(), now.getMonth(), 1))

onMounted(() => Promise.all([projects.fetchAll(), timeStore.fetchAll()]))

const recentEntries = computed(() => timeStore.list.slice(0, 10))
const weekMin  = computed(() => timeStore.list.filter(e => e.date >= monday && e.date <= today).reduce((s, e) => s + Number(e.duration_min), 0))
const monthMin = computed(() => timeStore.list.filter(e => e.date >= monthStart && e.date <= today).reduce((s, e) => s + Number(e.duration_min), 0))

async function changePw() {
  pwError.value = ''; pwSuccess.value = ''
  if (newPw.value !== confirmPw.value) {
    pwError.value = 'Passwörter stimmen nicht überein'
    return
  }
  pwLoading.value = true
  try {
    await api.changePassword(auth.user.id, { current_password: currentPw.value, new_password: newPw.value })
    pwSuccess.value = 'Passwort erfolgreich geändert'
    currentPw.value = ''; newPw.value = ''; confirmPw.value = ''
  } catch (e) {
    pwError.value = e.message
  } finally {
    pwLoading.value = false
  }
}

function formatMin(min) { if (!min) return '0h'; const h = Math.floor(min / 60), m = min % 60; return m ? `${h}h ${m}min` : `${h}h` }
function formatDate(d) { return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
</script>
