<template>
  <span class="badge" :class="cls[status] ?? 'bg-lift text-mid'">
    {{ labels[status] ?? status }}
  </span>
</template>

<script setup>
defineProps({ status: String })

const labels = {
  geplant:       'Geplant',
  aktiv:         'Aktiv',
  pausiert:      'Pausiert',
  abgeschlossen: 'Abgeschlossen',
}
const cls = {
  geplant:       'bg-lift text-lo',
  aktiv:         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pausiert:      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  abgeschlossen: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}
</script>
