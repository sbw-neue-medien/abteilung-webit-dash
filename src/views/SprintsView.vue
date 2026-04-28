<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <SprintPanel />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSprintsStore } from '../stores/sprints.js'
import SprintPanel from '../components/SprintPanel.vue'

const sprints = useSprintsStore()
onMounted(() => sprints.fetchAll())
</script>
