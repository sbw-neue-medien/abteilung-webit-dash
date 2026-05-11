<template>
  <svg viewBox="0 0 20 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="0"  y="12" width="3" height="4"  rx="0.5" :opacity="level >= 1 ? 1 : 0.2"/>
    <rect x="4"  y="9"  width="3" height="7"  rx="0.5" :opacity="level >= 2 ? 1 : 0.2"/>
    <rect x="8"  y="6"  width="3" height="10" rx="0.5" :opacity="level >= 3 ? 1 : 0.2"/>
    <rect x="12" y="3"  width="3" height="13" rx="0.5" :opacity="level >= 4 ? 1 : 0.2"/>
    <rect x="16" y="0"  width="3" height="16" rx="0.5" :opacity="level >= 5 ? 1 : 0.2"/>
  </svg>
</template>

<script setup>
defineProps({ level: { type: Number, default: 3 } })
</script>
