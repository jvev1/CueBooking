<script setup>
import { useSesionStore } from '@/stores/sesion.js'

const sesion = useSesionStore()
</script>

<template>
  <h1>Bienvenido a CueBooking</h1>
  <p v-if="sesion.haySesion">Has iniciado sesión como {{ sesion.perfil?.nombre }}.</p>
  <p v-else>Inicia sesión para gestionar tus eventos y propuestas.</p>
</template>
