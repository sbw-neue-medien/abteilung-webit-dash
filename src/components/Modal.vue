<template>
  <Teleport to="body">
    <div v-if="modelValue" :class="['fixed inset-0 flex items-center justify-center p-4', zClass]">
      <div class="absolute inset-0 bg-black/50" @click="$emit('update:modelValue', false)" />
      <div :class="['relative w-full bg-surface rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto ring-1 ring-line', wide ? 'max-w-3xl' : 'max-w-lg']">
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-semibold text-hi">{{ title }}</h3>
          <button @click="$emit('update:modelValue', false)"
                  class="text-lo hover:text-mid transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

// `layer` hebt ein Modal über ein bereits offenes (z.B. Vorschau über Projektformular).
const props = defineProps({ modelValue: Boolean, title: String, wide: Boolean, layer: { type: Number, default: 0 } })
defineEmits(['update:modelValue'])

const zClass = computed(() => (props.layer > 0 ? 'z-[60]' : 'z-50'))
</script>
