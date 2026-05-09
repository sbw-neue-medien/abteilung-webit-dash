<template>
  <aside :class="['hidden sm:flex flex-col bg-black dark:bg-zinc-950 text-white shrink-0 transition-[width] duration-200 overflow-hidden', sidebarWidth]">
    <nav class="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto overflow-x-hidden">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :title="!expanded ? link.label : undefined"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive(link)
            ? 'text-white bg-white/15'
            : 'text-neutral-400 hover:text-white hover:bg-white/10'
        ]">
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="link.icon" />
        </svg>
        <span v-show="expanded" class="truncate">{{ link.label }}</span>
      </RouterLink>
    </nav>

    <div v-if="expanded && isProjectRoute" class="border-t border-white/10 overflow-y-auto p-3 max-h-[50vh]">
      <TodoList />
    </div>

    <button
      @click="toggleExpanded"
      :title="expanded ? 'Einklappen' : 'Ausklappen'"
      class="flex items-center justify-center h-10 border-t border-white/10 text-neutral-500 hover:text-white transition-colors shrink-0">
      <svg class="w-4 h-4 transition-transform duration-200" :class="expanded ? '' : 'rotate-180'"
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNavLinks } from '../composables/useNavLinks.js'
import TodoList from './TodoList.vue'

const route = useRoute()
const { links } = useNavLinks()

const expanded = ref(localStorage.getItem('sidebar-expanded') !== 'false')
const isProjectRoute = computed(() => route.name === 'project')
const sidebarWidth = computed(() => {
  if (!expanded.value) return 'w-14'
  return isProjectRoute.value ? 'w-72' : 'w-52'
})

function toggleExpanded() {
  expanded.value = !expanded.value
  localStorage.setItem('sidebar-expanded', String(expanded.value))
}

function isActive(link) {
  if (link.to === '/') return route.path === '/'
  return route.path.startsWith(link.to)
}
</script>
