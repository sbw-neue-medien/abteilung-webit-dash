<template>
  <div>
    <!-- Top row: avatar + name/email -->
    <div class="flex items-center gap-4">
      <div v-if="auth.isLeiter && !inactive" class="relative shrink-0 group cursor-pointer" @click="$emit('triggerUpload', u)">
        <UserAvatar :userId="u.id" :name="u.name" :hasAvatar="u.avatar" size="lg" />
        <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
                    transition-opacity flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
      </div>
      <div v-else class="shrink-0">
        <UserAvatar :userId="u.id" :name="u.name" :hasAvatar="u.avatar" size="lg" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="font-semibold text-hi">{{ u.name }}</p>
          <span v-if="inactive"
                class="text-xs bg-surface border border-groove text-lo rounded-full px-2 py-0.5">
            Inaktiv
          </span>
        </div>
        <p class="text-xs text-lo mt-0.5">{{ u.email || u.username }}</p>
        <button v-if="auth.isLeiter && u.avatar && !inactive" @click.stop="$emit('removeAvatar', u)"
                class="text-xs text-red-500 hover:underline mt-0.5">
          Foto entfernen
        </button>
      </div>
    </div>

    <!-- Bottom row: buttons (leiter only) -->
    <div v-if="auth.isLeiter" class="flex gap-1 flex-wrap mt-3">
      <template v-if="inactive">
        <button class="btn btn-sm btn-secondary" @click="$emit('activate', u)">Aktivieren</button>
      </template>
      <template v-else>
        <button v-if="u.email" class="btn btn-sm btn-secondary" @click="$emit('sendReset', u)"
                title="Passwort-Reset-E-Mail senden">
          Reset-E-Mail
        </button>
        <button class="btn btn-sm btn-secondary" @click="$emit('edit', u)">Bearbeiten</button>
        <button class="btn btn-sm btn-secondary" @click="$emit('deactivate', u)">Deaktivieren</button>
        <button class="btn btn-sm btn-danger" @click="$emit('remove', u)">Löschen</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from './UserAvatar.vue'

defineProps({
  u:        { type: Object, required: true },
  auth:     { type: Object, required: true },
  inactive: { type: Boolean, default: false },
})
defineEmits(['triggerUpload', 'removeAvatar', 'sendReset', 'edit', 'remove', 'deactivate', 'activate'])
</script>
