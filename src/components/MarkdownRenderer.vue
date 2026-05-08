<template>
  <div class="markdown-content text-sm text-mid" v-html="html" />
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({ content: { type: String, default: '' } })

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const html = computed(() => marked.parse(escapeHtml(props.content ?? '')))
</script>

<style scoped>
.markdown-content :deep(p)           { margin-bottom: 0.5rem; }
.markdown-content :deep(p:last-child){ margin-bottom: 0; }
.markdown-content :deep(ul),
.markdown-content :deep(ol)          { padding-left: 1.25rem; margin-bottom: 0.5rem; }
.markdown-content :deep(ul)          { list-style: disc; }
.markdown-content :deep(ol)          { list-style: decimal; }
.markdown-content :deep(li)          { margin-bottom: 0.125rem; }
.markdown-content :deep(a)           { color: var(--color-brand-600); font-weight: 600; }
.markdown-content :deep(a:hover)     { text-decoration: underline; }
.markdown-content :deep(strong)      { font-weight: 600; }
.markdown-content :deep(em)          { font-style: italic; }
.markdown-content :deep(code)        { font-family: monospace; background: rgba(0,0,0,.06); padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.85em; }
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3)          { font-weight: 600; margin-bottom: 0.25rem; }
</style>
