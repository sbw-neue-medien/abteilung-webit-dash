<template>
  <span class="inline-flex items-center gap-1">
    <template v-if="pending">
      <span class="text-xs text-mid whitespace-nowrap">{{ label }}</span>
      <button type="button" class="btn btn-xs btn-danger" @click.stop="confirm">✓</button>
      <button type="button" class="btn btn-xs btn-secondary" @click.stop="reset">✕</button>
    </template>
    <button v-else type="button" v-bind="$attrs" @click.stop="ask">
      <slot />
    </button>
  </span>
</template>

<script setup>
import { ref } from 'vue'

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
