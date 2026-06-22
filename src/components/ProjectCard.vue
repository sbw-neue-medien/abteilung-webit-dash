<template>
  <div class="card hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3" @click="$emit('open')">
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="font-semibold text-hi">{{ project.name }}</p>
        <p v-if="project.client" class="text-xs text-lo mt-0.5">{{ project.client }}</p>
      </div>
      <StatusBadge v-if="!isTemplate" :status="project.status" />
      <span v-else class="text-xs bg-brand-subtle text-brand-700 rounded-full px-2 py-0.5 shrink-0">Vorlage</span>
    </div>

    <p v-if="project.description" class="text-sm text-mid line-clamp-2">{{ markdownPreview(project.description) }}</p>

    <div v-if="memberNames.length" class="flex flex-wrap gap-1">
      <span v-for="name in memberNames" :key="name" class="text-xs bg-brand-subtle text-brand-700 rounded-full px-2 py-0.5">
        {{ name }}
      </span>
    </div>

    <div class="flex items-center justify-between mt-auto pt-2 border-t border-groove">
      <div v-if="!isTemplate" class="flex flex-col gap-0.5">
        <span class="text-xs text-lo">{{ project.owner_name }}</span>
        <span v-if="project.mentor_name" class="text-xs text-lo">Mentor: {{ project.mentor_name }}</span>
      </div>
      <div v-else />
      <div v-if="canEdit" class="flex gap-1" @click.stop>
        <button class="btn btn-sm btn-secondary" @click="$emit('edit')">Bearbeiten</button>
        <ConfirmButton class="btn btn-sm btn-danger" :label="deleteLabel" @confirm="$emit('delete')">Löschen</ConfirmButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import ConfirmButton from './ConfirmButton.vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  project: { type: Object, required: true },
  isTemplate: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  memberNames: { type: Array, default: () => [] },
})

defineEmits(['open', 'edit', 'delete'])

const deleteLabel = computed(() =>
  `${props.isTemplate ? 'Vorlage' : 'Projekt'} «${props.project.name}» wirklich löschen?`
)

function markdownPreview(text) {
  return marked.parse(text ?? '').replace(/<[^>]*>/g, '')
}
</script>
