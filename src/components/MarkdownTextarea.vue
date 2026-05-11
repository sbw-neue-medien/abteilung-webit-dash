<template>
  <div>
    <div class="flex items-center gap-1 mb-1">
      <label class="label mb-0">{{ label }}</label>
      <MarkdownHint :target="el" />
    </div>
    <textarea ref="el" :value="modelValue" class="input"
              :rows="rows" :placeholder="placeholder"
              @input="$emit('update:modelValue', $event.target.value)" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MarkdownHint from './MarkdownHint.vue'

defineProps({
  label:       { type: String, required: true },
  modelValue:  { type: String, default: '' },
  rows:        { type: Number, default: 3 },
  placeholder: { type: String, default: '' },
})
defineEmits(['update:modelValue'])

const el = ref(null)
</script>
