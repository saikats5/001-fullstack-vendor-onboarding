<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VendorForm from './components/VendorForm.vue'
import VendorList from './components/VendorList.vue'

const isDark = ref(false)

onMounted(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = prefersDark
  document.documentElement.setAttribute(
    'data-theme',
    prefersDark ? 'dark' : 'light',
  )
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute(
    'data-theme',
    isDark.value ? 'dark' : 'light',
  )
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-brand">
          <span class="header-logo">🏢</span>
          <h1>Trusted Vendor Portal</h1>
        </div>
        <button
          class="theme-toggle"
          @click="toggleTheme"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ isDark ? '☀️ Light' : '🌙 Dark' }}
        </button>
      </div>
    </header>
    <main class="app-main">
      <div class="content-layout">
        <aside class="form-panel">
          <VendorForm />
        </aside>
        <section class="list-panel">
          <VendorList />
        </section>
      </div>
    </main>
  </div>
</template>
