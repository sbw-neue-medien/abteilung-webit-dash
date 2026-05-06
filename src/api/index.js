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
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login?expired=1'
    return
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

export const api = {
  login: (body)                  => req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refreshToken: ()               => req('/auth/refresh', { method: 'POST' }),
  getMyPermissions: ()           => req('/auth/permissions'),
  forgotPassword: (body)         => req('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body)          => req('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  sendResetEmail: (id)           => req(`/users/${id}/send-reset-email`, { method: 'POST' }),
  getUsers: ()                   => req('/users'),
  getUser: (id)                  => req(`/users/${id}`),
  createUser: (body)             => req('/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id, body)         => req(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (id, body)    => req(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteUser: (id)               => req(`/users/${id}`, { method: 'DELETE' }),
  setUserActive: (id, active)    => req(`/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ active }) }),
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
  getTemplates: ()               => req('/templates'),
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
  getMentorStats: ()               => req('/dashboard/mentor-stats'),
  getMentors: ()                   => req('/mentors'),
  getMentor: (id)                  => req(`/mentors/${id}`),
  createMentor: (body)             => req('/mentors', { method: 'POST', body: JSON.stringify(body) }),
  updateMentor: (id, body)         => req(`/mentors/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMentor: (id)               => req(`/mentors/${id}`, { method: 'DELETE' }),
  getMentorLernende: (id)          => req(`/mentors/${id}/lernende`),
  assignLernender: (mentorId, lernenderId) => req(`/mentors/${mentorId}/lernende`, { method: 'POST', body: JSON.stringify({ lernender_id: lernenderId }) }),
  unassignLernender: (mentorId, lernenderId) => req(`/mentors/${mentorId}/lernende/${lernenderId}`, { method: 'DELETE' }),
  getSprints: ()                   => req('/sprints'),
  createSprint: (body)             => req('/sprints', { method: 'POST', body: JSON.stringify(body) }),
  updateSprint: (id, body)         => req(`/sprints/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSprint: (id)               => req(`/sprints/${id}`, { method: 'DELETE' }),
  getWerkstattStats: (params = {}) => req('/werkstatt/stats?' + new URLSearchParams(params)),
  getFooterLinks: ()               => req('/footer-links'),
  createFooterLink: (body)         => req('/footer-links', { method: 'POST', body: JSON.stringify(body) }),
  updateFooterLink: (id, body)     => req(`/footer-links/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteFooterLink: (id)           => req(`/footer-links/${id}`, { method: 'DELETE' }),
  getUserPermissions: (id)          => req(`/users/${id}/permissions`),
  updateUserPermissions: (id, overrides) => req(`/users/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ overrides }) }),
  getRoles: ()                     => req('/roles'),
  updateRolePermissions: (role, permissions) => req(`/roles/${role}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) }),
}
