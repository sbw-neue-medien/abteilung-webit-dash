const BASE = '/api'

function headers() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers ?? {}) },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

export const api = {
  login: (body)                  => req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getUsers: ()                   => req('/users'),
  getUser: (id)                  => req(`/users/${id}`),
  createUser: (body)             => req('/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id, body)         => req(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (id, body)    => req(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteUser: (id)               => req(`/users/${id}`, { method: 'DELETE' }),
  uploadAvatar: (id, file)       => {
    const f = new FormData()
    f.append('avatar', file)
    const token = localStorage.getItem('token')
    return fetch(`${BASE}/users/${id}/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: f,
    }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`); return d })
  },
  deleteAvatar: (id)             => req(`/users/${id}/avatar`, { method: 'DELETE' }),
  getProjects: ()                => req('/projects'),
  getProject: (id)               => req(`/projects/${id}`),
  createProject: (body)          => req('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id, body)      => req(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProject: (id)            => req(`/projects/${id}`, { method: 'DELETE' }),
  addMember: (id, userId)        => req(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
  removeMember: (id, userId)     => req(`/projects/${id}/members/${userId}`, { method: 'DELETE' }),
  getTasks: (projectId)          => req(`/projects/${projectId}/tasks`),
  createTask: (projectId, body)  => req(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body)         => req(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  moveTask: (id, status)         => req(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTask: (id)               => req(`/tasks/${id}`, { method: 'DELETE' }),
  getTimeEntries: (params = {})  => req('/time-entries?' + new URLSearchParams(params)),
  createTimeEntry: (body)        => req('/time-entries', { method: 'POST', body: JSON.stringify(body) }),
  updateTimeEntry: (id, body)    => req(`/time-entries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTimeEntry: (id)          => req(`/time-entries/${id}`, { method: 'DELETE' }),
  getReport: (params = {})       => req('/reports/hours?' + new URLSearchParams(params)),
  getTodos: (projectId)            => req(`/projects/${projectId}/todos`),
  createTodo: (projectId, body)    => req(`/projects/${projectId}/todos`, { method: 'POST', body: JSON.stringify(body) }),
  updateTodo: (id, body)           => req(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTodo: (id)                 => req(`/todos/${id}`, { method: 'DELETE' }),
  getDashboardStats: ()            => req('/dashboard/stats'),
  getSprints: ()                   => req('/sprints'),
  createSprint: (body)             => req('/sprints', { method: 'POST', body: JSON.stringify(body) }),
  updateSprint: (id, body)         => req(`/sprints/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSprint: (id)               => req(`/sprints/${id}`, { method: 'DELETE' }),
}
