import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useProjectsStore = defineStore('projects', () => {
  const list            = ref([])
  const templates       = ref([])
  const templateDetails = ref({})
  const current         = ref(null)
  const loading         = ref(false)
  const error           = ref(null)

  async function fetchTemplates() {
    try {
      templates.value       = await api.getTemplates()
      templateDetails.value = {} // Liste neu geladen -> Vorschau-Cache verwerfen
    }
    catch (e) { /* leiter-only, ignorieren wenn kein Zugriff */ }
  }

  // Vorlagen ändern sich selten – einmal geladene Details bleiben im Cache,
  // damit das erneute Öffnen einer Vorschau ohne Wartezeit funktioniert.
  async function fetchTemplate(id) {
    if (templateDetails.value[id]) return templateDetails.value[id]
    const detail = await api.getTemplate(id)
    templateDetails.value = { ...templateDetails.value, [id]: detail }
    return detail
  }

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try { list.value = await api.getProjects() }
    catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function fetchOne(id) {
    loading.value = true
    error.value   = null
    try { current.value = await api.getProject(id) }
    catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function create(body) {
    const res = await api.createProject(body)
    await fetchAll()
    return res
  }

  async function update(id, body) {
    await api.updateProject(id, body)
    await fetchAll()
    if (current.value?.id === id) await fetchOne(id)
  }

  async function remove(id) {
    await api.deleteProject(id)
    list.value = list.value.filter(p => p.id !== id)
  }

  return { list, templates, templateDetails, current, loading, error, fetchAll, fetchTemplates, fetchTemplate, fetchOne, create, update, remove }
})
