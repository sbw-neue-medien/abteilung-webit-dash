import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const ICONS = {
  dashboard:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  projekte:     'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  zeiterfassung:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  bereich:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  sprints:      'M13 10V3L4 14h7v7l9-11h-7z',
  lernende:     'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  coaches:      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  werkstatt:    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
}

export function useNavLinks() {
  const auth = useAuthStore()

  const links = computed(() => {
    const base = [
      { to: '/',              label: 'Dashboard',     icon: ICONS.dashboard     },
      { to: '/projekte',      label: 'Projekte',      icon: ICONS.projekte      },
      { to: '/zeiterfassung', label: 'Zeiterfassung', icon: ICONS.zeiterfassung },
    ]
    if (!auth.isMentor)             base.push({ to: '/mein-bereich', label: 'Mein Bereich',  icon: ICONS.bereich  })
    if (auth.can('sprints.manage')) base.push({ to: '/sprints',      label: 'Sprints',       icon: ICONS.sprints  })
    if (auth.can('users.list'))     base.push({ to: '/lernende',     label: 'Lernpartner',   icon: ICONS.lernende })
    if (auth.can('mentors.manage')) base.push({ to: '/mentoren',     label: 'Coaches',       icon: ICONS.coaches  })
    if (auth.can('werkstatt.view')) base.push({ to: '/werkstatt',    label: 'Werkstatt',     icon: ICONS.werkstatt})
    return base
  })

  return { links, ICONS }
}
