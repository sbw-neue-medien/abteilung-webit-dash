<template>
  <div :class="sizeClass"
       class="rounded-full shrink-0 overflow-hidden bg-brand-subtle text-brand-600 font-bold flex items-center justify-center select-none">
    <img v-if="hasAvatar"
         :src="`/api/uploads/avatars/${userId}.jpg`"
         :alt="name"
         class="w-full h-full object-cover"
         @error="broken = true"
         v-show="!broken" />
    <span v-if="!hasAvatar || broken" :class="textClass">{{ initial }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  userId:    { type: [Number, String], required: true },
  name:      { type: String, default: '?' },
  hasAvatar: { type: [Boolean, Number], default: false },
  size:      { type: String, default: 'md' }, // sm | md | lg
})

const broken = ref(false)
const initial = computed(() => (props.name ?? '?').charAt(0).toUpperCase())

const sizeClass = computed(() => ({
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
}[props.size] ?? 'w-9 h-9'))

const textClass = computed(() => ({
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}[props.size] ?? 'text-sm'))
</script>
