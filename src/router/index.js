import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  { path: '/login',        name: 'login',    component: () => import('../views/LoginView.vue'),       meta: { public: true } },
  { path: '/',             name: 'dashboard',component: () => import('../views/DashboardView.vue') },
  { path: '/projekte',     name: 'projects', component: () => import('../views/ProjectsView.vue') },
  { path: '/projekte/:id', name: 'project',  component: () => import('../views/ProjectDetailView.vue') },
  { path: '/zeiterfassung',name: 'time',     component: () => import('../views/TimeEntryView.vue') },
  { path: '/lernende',     name: 'learners', component: () => import('../views/LearnersView.vue'),    meta: { leiter: true } },
  { path: '/mein-bereich', name: 'my-area',  component: () => import('../views/MyAreaView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) return '/login'
  if (to.meta.leiter && !auth.isLeiter)    return '/'
  if (to.path === '/login' && auth.isLoggedIn) return '/'
})

export default router
