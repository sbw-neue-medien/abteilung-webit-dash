<template>
  <footer class="bg-black dark:bg-zinc-950 text-neutral-400 text-xs mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-4">
        <a
          v-for="link in footerLinks.list"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-white transition-colors"
        >{{ link.label }}</a>
      </div>

      <button
        v-if="auth.isLeiter"
        @click="showManage = true"
        class="hover:text-white transition-colors"
        title="Links verwalten"
      >Links verwalten</button>
    </div>
  </footer>

  <Modal v-model="showManage" title="Footer-Links verwalten">
    <div class="space-y-4">
      <div
        v-for="link in footerLinks.list"
        :key="link.id"
        class="flex items-center gap-2"
      >
        <div v-if="editing?.id !== link.id" class="flex-1 min-w-0">
          <span class="font-medium text-hi">{{ link.label }}</span>
          <span class="text-lo ml-2 truncate block">{{ link.url }}</span>
        </div>
        <div v-else class="flex-1 flex flex-col gap-1">
          <input
            v-model="editing.label"
            class="w-full px-2 py-1 rounded bg-lift border border-groove text-hi text-sm"
            placeholder="Bezeichnung"
          />
          <input
            v-model="editing.url"
            class="w-full px-2 py-1 rounded bg-lift border border-groove text-hi text-sm"
            placeholder="URL"
          />
          <input
            v-model.number="editing.position"
            type="number"
            class="w-full px-2 py-1 rounded bg-lift border border-groove text-hi text-sm"
            placeholder="Reihenfolge"
          />
        </div>

        <template v-if="editing?.id !== link.id">
          <button @click="startEdit(link)" class="text-lo hover:text-hi transition-colors shrink-0" title="Bearbeiten">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button @click="remove(link.id)" class="text-lo hover:text-red-500 transition-colors shrink-0" title="Löschen">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </template>
        <template v-else>
          <button @click="saveEdit" class="text-brand-600 hover:text-brand-500 transition-colors shrink-0 font-medium text-sm">
            Speichern
          </button>
          <button @click="editing = null" class="text-lo hover:text-hi transition-colors shrink-0 text-sm">
            Abbrechen
          </button>
        </template>
      </div>

      <hr class="border-groove" />

      <div v-if="adding" class="flex flex-col gap-1">
        <input
          v-model="newLink.label"
          class="w-full px-2 py-1 rounded bg-lift border border-groove text-hi text-sm"
          placeholder="Bezeichnung"
        />
        <input
          v-model="newLink.url"
          class="w-full px-2 py-1 rounded bg-lift border border-groove text-hi text-sm"
          placeholder="URL"
        />
        <input
          v-model.number="newLink.position"
          type="number"
          class="w-full px-2 py-1 rounded bg-lift border border-groove text-hi text-sm"
          placeholder="Reihenfolge"
        />
        <div class="flex gap-2 mt-1">
          <button @click="saveNew"
            class="px-3 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white text-sm transition-colors">
            Hinzufügen
          </button>
          <button @click="adding = false"
            class="px-3 py-1 rounded bg-lift hover:bg-surface text-mid text-sm transition-colors">
            Abbrechen
          </button>
        </div>
      </div>
      <button v-else @click="startAdd"
        class="flex items-center gap-1 text-brand-600 hover:text-brand-500 transition-colors text-sm font-medium">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Link hinzufügen
      </button>
    </div>
  </Modal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useFooterLinksStore } from '../stores/footerLinks.js'
import Modal from './Modal.vue'

const auth        = useAuthStore()
const footerLinks = useFooterLinksStore()

const showManage = ref(false)
const editing    = ref(null)
const adding     = ref(false)
const newLink    = ref({ label: '', url: '', position: 0 })

onMounted(() => footerLinks.fetchAll())

function startEdit(link) {
  editing.value = { ...link }
}

async function saveEdit() {
  await footerLinks.update(editing.value.id, editing.value)
  editing.value = null
}

async function remove(id) {
  await footerLinks.remove(id)
}

function startAdd() {
  newLink.value = { label: '', url: '', position: footerLinks.list.length }
  adding.value  = true
}

async function saveNew() {
  if (!newLink.value.label || !newLink.value.url) return
  await footerLinks.create(newLink.value)
  adding.value = false
}
</script>
