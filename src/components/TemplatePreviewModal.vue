<template>
  <Modal :model-value="modelValue" :title="detail?.name ?? 'Vorlage'" wide :layer="layer"
         @update:model-value="$emit('update:modelValue', $event)">
    <div v-if="loading" class="text-lo italic py-6 text-center">Laden…</div>
    <div v-else-if="error" class="text-sm text-red-500 py-6 text-center">{{ error }}</div>

    <div v-else-if="detail" class="space-y-4">
      <MarkdownRenderer v-if="detail.description" :content="detail.description" />

      <p class="text-xs text-lo">
        {{ tasks.length }} {{ tasks.length === 1 ? 'Aufgabe' : 'Aufgaben' }}
        <template v-if="totalMin"> · ca. {{ formatMin(totalMin) }}</template>
      </p>

      <ol v-if="tasks.length" class="space-y-2">
        <li v-for="(t, i) in tasks" :key="t.id"
            class="bg-lift rounded-lg p-3 ring-1 ring-line flex gap-3">
          <span class="text-xs text-lo font-mono shrink-0 pt-0.5 w-5 text-right">{{ i + 1 }}.</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-hi">{{ t.title }}</p>
              <span v-if="t.planned_duration_min"
                    class="text-xs text-lo shrink-0 whitespace-nowrap">{{ formatMin(t.planned_duration_min) }}</span>
            </div>
            <MarkdownRenderer v-if="t.description" :content="t.description" class="mt-1" />
          </div>
        </li>
      </ol>
      <p v-else class="text-sm text-lo italic">Diese Vorlage enthält noch keine Aufgaben.</p>

      <div v-if="selectable" class="flex justify-end pt-2 border-t border-groove">
        <button type="button" class="btn-primary" @click="$emit('select', detail.id)">
          Diese Vorlage verwenden
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from './Modal.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import { useProjectsStore } from '../stores/projects.js'

const props = defineProps({
  modelValue: Boolean,
  templateId: Number,
  selectable: { type: Boolean, default: false },
  layer:      { type: Number, default: 0 },
})
defineEmits(['update:modelValue', 'select'])

const projects = useProjectsStore()
const detail   = ref(null)
const loading  = ref(false)
const error    = ref(null)

const tasks    = computed(() => detail.value?.tasks ?? [])
const totalMin = computed(() => tasks.value.reduce((sum, t) => sum + (Number(t.planned_duration_min) || 0), 0))

watch(() => [props.modelValue, props.templateId], async ([open, id]) => {
  if (!open || !id) return
  if (detail.value?.id === id) return
  detail.value = null
  error.value  = null
  loading.value = true
  try { detail.value = await projects.fetchTemplate(id) }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
}, { immediate: true })

function formatMin(min) {
  const m = Number(min)
  if (!m) return ''
  const h = Math.floor(m / 60), r = m % 60
  return h ? (r ? `${h}h ${r}min` : `${h}h`) : `${r}min`
}
</script>
