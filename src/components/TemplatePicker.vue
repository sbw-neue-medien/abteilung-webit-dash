<template>
  <div>
    <label class="label">Vorlage verwenden</label>
    <div class="grid sm:grid-cols-2 gap-3">
      <div role="button" tabindex="0"
           class="rounded-xl p-3 ring-1 transition-colors cursor-pointer"
           :class="cardClass(null)"
           @click="$emit('update:modelValue', null)"
           @keydown.enter.prevent="$emit('update:modelValue', null)"
           @keydown.space.prevent="$emit('update:modelValue', null)">
        <p class="text-sm font-medium text-hi">Keine Vorlage</p>
        <p class="text-xs text-lo mt-0.5">Leeres Projekt ohne Aufgaben</p>
      </div>

      <div v-for="t in templates" :key="t.id" role="button" tabindex="0"
           class="rounded-xl p-3 ring-1 transition-colors cursor-pointer flex flex-col gap-1"
           :class="cardClass(t.id)"
           @click="$emit('update:modelValue', t.id)"
           @keydown.enter.prevent="$emit('update:modelValue', t.id)"
           @keydown.space.prevent="$emit('update:modelValue', t.id)">
        <p class="text-sm font-medium text-hi">{{ t.name }}</p>
        <p v-if="t.description" class="text-xs text-mid line-clamp-2">{{ t.description }}</p>
        <div class="flex items-center justify-between gap-2 mt-auto pt-1">
          <span class="text-xs text-lo">
            {{ t.task_count }} {{ Number(t.task_count) === 1 ? 'Aufgabe' : 'Aufgaben' }}
            <template v-if="Number(t.planned_duration_min)"> · ca. {{ formatMin(t.planned_duration_min) }}</template>
          </span>
          <button type="button" class="text-xs text-brand-600 font-medium hover:underline shrink-0"
                  @click.stop="preview(t.id)">Vorschau</button>
        </div>
      </div>
    </div>

    <TemplatePreviewModal v-model="showPreview" :template-id="previewId" selectable :layer="1"
                          @select="choose" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TemplatePreviewModal from './TemplatePreviewModal.vue'

const props = defineProps({
  modelValue: { type: Number, default: null },
  templates:  { type: Array,  default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const showPreview = ref(false)
const previewId   = ref(null)

function cardClass(id) {
  return props.modelValue === id
    ? 'ring-2 ring-brand-500 bg-brand-subtle'
    : 'ring-line bg-lift hover:ring-brand-500'
}

function preview(id) {
  previewId.value   = id
  showPreview.value = true
}

function choose(id) {
  emit('update:modelValue', id)
  showPreview.value = false
}

function formatMin(min) {
  const m = Number(min)
  if (!m) return ''
  const h = Math.floor(m / 60), r = m % 60
  return h ? (r ? `${h}h ${r}min` : `${h}h`) : `${r}min`
}
</script>
