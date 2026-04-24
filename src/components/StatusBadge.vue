<template>
  <span class="badge" :class="cls[status] ?? 'bg-slate-100 text-slate-600'">
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
  geplant:       'bg-slate-100 text-slate-600',
  aktiv:         'bg-emerald-100 text-emerald-700',
  pausiert:      'bg-amber-100 text-amber-700',
  abgeschlossen: 'bg-blue-100 text-blue-700',
}
</script>
