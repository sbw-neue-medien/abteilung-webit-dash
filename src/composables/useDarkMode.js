import { ref } from 'vue'

const isDark = ref(document.documentElement.classList.contains('dark'))

function apply(dark) {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
  isDark.value = dark
}

export function useDarkMode() {
  function toggle() { apply(!isDark.value) }
  return { isDark, toggle }
}
