<template>
  <div class="relative inline-block">
    <button
      type="button"
      class="text-lo hover:text-mid transition-colors"
      :title="open ? 'Schließen' : 'Markdown-Hilfe'"
      @click.stop="open = !open">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </button>

    <div v-if="open"
         class="absolute z-50 bottom-full mb-2 right-0 w-56 rounded-lg border border-groove bg-surface shadow-lg p-3 text-xs"
         @click.stop>
      <p class="font-semibold text-hi mb-2">Markdown</p>
      <table class="w-full border-collapse">
        <tbody>
          <tr v-for="row in hints" :key="row.label" class="border-b border-groove last:border-0">
            <td class="py-1 pr-2 text-lo whitespace-nowrap">{{ row.label }}</td>
            <td class="py-1 font-mono text-mid">{{ row.syntax }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)

const hints = [
  { label: 'Überschrift', syntax: '# Titel' },
  { label: 'Fett',        syntax: '**Text**' },
  { label: 'Kursiv',      syntax: '_Text_' },
  { label: 'Liste',       syntax: '- Punkt' },
  { label: 'Link',        syntax: '[Name](URL)' },
  { label: 'Code',        syntax: '`code`' },
]

function onClickOutside() { open.value = false }

onMounted(()  => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>
