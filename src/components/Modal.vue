<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="$emit('update:modelValue', false)" />
      <div class="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto ring-1 ring-line">
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
defineProps({ modelValue: Boolean, title: String })
defineEmits(['update:modelValue'])
</script>
