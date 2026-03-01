<template>
  <div class="toast-container" aria-live="polite">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast--${toast.type}`]"
        @click="remove(toast.id)"
      >
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" aria-label="Dismiss">✕</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'
import type { ToastType } from '../composables/useToast'

const { toasts, remove } = useToast()

const getIcon = (type: ToastType) => {
  if (type === 'success') return '✅'
  if (type === 'error') return '❌'
  return 'ℹ️'
}
</script>
