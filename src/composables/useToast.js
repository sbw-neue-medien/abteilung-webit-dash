import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

function add(message, type = 'error', duration = 4000) {
  const id = ++nextId
  toasts.value.push({ id, message, type })
  setTimeout(() => remove(id), duration)
}

function remove(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
  return {
    toasts,
    toast:        (msg, duration) => add(msg, 'info', duration),
    toastSuccess: (msg, duration) => add(msg, 'success', duration),
    toastError:   (msg, duration) => add(msg, 'error', duration),
    remove,
  }
}
