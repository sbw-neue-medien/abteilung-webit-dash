<template>
  <span class="relative inline-flex">
    <button type="button" v-bind="attrs" :class="{ invisible: pending }" @click.stop="ask">
      <slot />
    </button>
    <span v-if="pending" class="absolute top-0 left-0 z-20 flex items-center gap-1 whitespace-nowrap rounded-lg bg-surface ring-1 ring-line shadow-lg px-2 py-1">
      <span class="text-xs text-mid">{{ label }}</span>
      <button type="button" class="btn btn-xs btn-danger" @click.stop="confirm">✓</button>
      <button type="button" class="btn btn-xs btn-secondary" @click.stop="reset">✕</button>
    </span>
  </span>
</template>

<script setup>
import { ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const props = defineProps({
  label: { type: String, default: 'Wirklich?' },
  timeout: { type: Number, default: 3000 },
})
const emit = defineEmits(['confirm'])

const pending = ref(false)
let timer = null

function ask() {
  pending.value = true
  timer = setTimeout(reset, props.timeout)
}

function confirm() {
  reset()
  emit('confirm')
}

function reset() {
  clearTimeout(timer)
  pending.value = false
}
</script>
