<template>
  <Modal v-model="open" :title="title">
    <div class="help-content" v-html="content" />
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from './Modal.vue'
import { useAuthStore } from '../stores/auth.js'
import lernendeMd from '../../docs/howto-lernende.md'
import mentorenMd from '../../docs/howto-mentoren.md'

const open = defineModel()
const auth = useAuthStore()

const content = computed(() => (auth.isMentor ? mentorenMd : lernendeMd))
const title   = computed(() => (auth.isMentor ? 'Hilfe für Mentoren' : 'Hilfe für Lernende'))
</script>

<style scoped>
.help-content :deep(h1) { @apply text-lg font-bold text-hi mb-4 mt-1; }
.help-content :deep(h2) { @apply text-sm font-semibold text-hi mt-5 mb-1.5 uppercase tracking-wide; }
.help-content :deep(p)  { @apply text-sm text-mid mb-3 leading-relaxed; }
.help-content :deep(ul) { @apply list-disc list-inside text-sm text-mid mb-3 space-y-1; }
.help-content :deep(ol) { @apply list-decimal list-inside text-sm text-mid mb-3 space-y-1; }
.help-content :deep(li) { @apply leading-relaxed; }
.help-content :deep(hr) { @apply border-groove my-4; }
.help-content :deep(strong) { @apply font-semibold text-hi; }
.help-content :deep(table)  { @apply w-full text-sm mb-3 border-collapse; }
.help-content :deep(th)     { @apply text-left font-semibold text-hi pb-1.5 border-b border-groove; }
.help-content :deep(td)     { @apply text-mid py-1.5 border-b border-groove; }
.help-content :deep(code)   { @apply text-brand-500 bg-lift px-1 rounded text-xs font-mono; }
</style>
