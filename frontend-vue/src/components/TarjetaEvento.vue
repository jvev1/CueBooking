<script setup>
import Tag from 'primevue/tag'
import { formatearFecha, nombreEstado, severidadEstado } from '@/utils/formato.js'

defineProps({
  evento: { type: Object, required: true }
})
</script>

<template>
  <!-- Toda la tarjeta es un enlace al detalle del evento -->
  <RouterLink :to="{ name: 'detalle-evento', params: { id: evento.id } }" class="tarjeta" data-test="evento">
    <div class="cabecera-tarjeta">
      <h2 class="titulo" data-test="titulo">{{ evento.titulo }}</h2>
      <Tag :value="nombreEstado(evento.estado)" :severity="severidadEstado(evento.estado)" data-test="estado" />
    </div>
    <p class="datos">
      <span data-test="fecha"><i class="pi pi-calendar" /> {{ formatearFecha(evento.fecha) }}</span>
      <span data-test="ciudad"><i class="pi pi-map-marker" /> {{ evento.ciudad }}</span>
      <span v-if="evento.genero" class="genero" data-test="genero"><i class="pi pi-headphones" /> {{ evento.genero }}</span>
    </p>
  </RouterLink>
</template>

<style scoped>
.tarjeta {
  display: block;
  padding: 1rem 1.25rem;
  color: inherit;
  text-decoration: none;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.tarjeta:hover {
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
}

.cabecera-tarjeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.titulo {
  margin: 0;
  font-size: 1.1rem;
}

.datos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin: 0.5rem 0 0;
  color: #4b5563;
}

.genero {
  text-transform: capitalize;
}
</style>
