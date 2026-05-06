<template>
  <div>
    <!-- Top row: avatar + name/email -->
    <div class="flex items-center gap-4">
      <div v-if="auth.can('users.update') && u.active" class="relative shrink-0 group cursor-pointer" @click="$emit('triggerUpload', u)">
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
        <p class="font-semibold text-hi">{{ u.name }}</p>
        <p class="text-xs text-lo mt-0.5">{{ u.email || u.username }}</p>
        <button v-if="auth.can('users.update') && u.avatar && u.active" @click.stop="$emit('removeAvatar', u)"
                class="text-xs text-red-500 hover:underline mt-0.5">
          Foto entfernen
        </button>
      </div>
    </div>

    <!-- Bottom row: buttons (leiter only) -->
    <div v-if="auth.can('users.update')" class="flex gap-1 flex-wrap items-center mt-3">
      <button v-if="u.email && u.active" class="btn btn-sm btn-secondary" @click="$emit('sendReset', u)"
              title="Passwort-Reset-E-Mail senden">
        Reset-E-Mail
      </button>
      <button v-if="u.active" class="btn btn-sm btn-secondary" @click="$emit('edit', u)">Bearbeiten</button>
      <button v-if="u.active" class="btn btn-sm btn-secondary" @click="$emit('editPermissions', u)" title="Berechtigungen anpassen">Berechtigungen</button>
      <button v-if="u.active" class="btn btn-sm btn-danger" @click="$emit('remove', u)">Löschen</button>
      <label class="flex items-center gap-1.5 text-sm text-mid cursor-pointer ml-auto select-none">
        <input type="checkbox" :checked="!!u.active"
               class="rounded border-line text-brand-600"
               @change="$emit('toggleActive', u, $event.target.checked)" />
        Aktiv
      </label>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from './UserAvatar.vue'

defineProps({
  u:    { type: Object, required: true },
  auth: { type: Object, required: true },
})
defineEmits(['triggerUpload', 'removeAvatar', 'sendReset', 'edit', 'editPermissions', 'remove', 'toggleActive'])
</script>
