<script setup>
import { RouterView } from 'vue-router'
import CabeceraApp from '@/components/CabeceraApp.vue'
</script>

<template>
  <CabeceraApp />
  <main class="contenido">
    <RouterView />
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f5f6f8;
  color: #1f2937;
}

.contenido {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
</style>
