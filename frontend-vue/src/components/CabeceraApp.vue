<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useSesionStore } from '@/stores/sesion.js'

const sesion = useSesionStore()
const router = useRouter()

async function cerrarSesion() {
  await sesion.logout()
  router.push({ name: 'inicio' })
}
</script>

<template>
  <header class="cabecera">
    <nav class="navegacion">
      <RouterLink to="/" class="marca">CueBooking</RouterLink>
      <RouterLink to="/eventos" class="enlace" data-test="enlace-eventos">Eventos</RouterLink>
    </nav>

    <div v-if="sesion.haySesion" class="usuario">
      <span class="nombre" data-test="nombre">{{ sesion.perfil?.nombre }}</span>
      <Tag :value="sesion.rolTexto" data-test="rol" />
      <Button
        label="Cerrar sesión"
        icon="pi pi-sign-out"
        severity="secondary"
        size="small"
        data-test="logout"
        @click="cerrarSesion"
      />
    </div>
    <Button
      v-else
      as="router-link"
      to="/login"
      label="Iniciar sesión"
      icon="pi pi-sign-in"
      size="small"
      data-test="ir-login"
    />
  </header>
</template>

<style scoped>
.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.marca {
  font-weight: 700;
  font-size: 1.2rem;
  color: inherit;
  text-decoration: none;
}

.navegacion {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.enlace {
  color: #4b5563;
  text-decoration: none;
}

.enlace.router-link-active {
  color: inherit;
  font-weight: 600;
}

.usuario {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nombre {
  font-weight: 600;
}
</style>
