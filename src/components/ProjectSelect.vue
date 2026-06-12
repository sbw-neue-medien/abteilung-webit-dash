<template>
  <select :value="modelValue" class="input" v-bind="$attrs" @change="$emit('update:modelValue', toValue($event.target.value))">
    <option v-if="placeholder" :value="placeholderValue">{{ placeholder }}</option>
    <optgroup v-if="active.length" label="Aktiv">
      <option v-for="p in active" :key="p.id" :value="p.id">{{ p.name }}</option>
    </optgroup>
    <optgroup v-if="planned.length" label="Geplant">
      <option v-for="p in planned" :key="p.id" :value="p.id">{{ p.name }}</option>
    </optgroup>
  </select>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [Number, String, null], default: '' },
  projects: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  placeholderValue: { type: [Number, String, null], default: '' },
})
defineEmits(['update:modelValue'])

const active  = computed(() => props.projects.filter(p => p.status === 'aktiv'))
const planned = computed(() => props.projects.filter(p => p.status === 'geplant'))

function toValue(raw) {
  if (raw === String(props.placeholderValue)) return props.placeholderValue
  return Number(raw)
}
</script>
