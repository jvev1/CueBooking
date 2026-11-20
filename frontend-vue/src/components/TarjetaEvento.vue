<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { formatearFecha, nombreEstado } from '@/utils/formato.js'

const props = defineProps({
  evento: { type: Object, required: true }
})

// Color del Tag según el estado del evento
const SEVERIDAD_ESTADO = { abierto: 'success', cerrado: 'warn', completado: 'secondary' }
const severidad = computed(() => SEVERIDAD_ESTADO[props.evento.estado] ?? 'secondary')
</script>

<template>
  <article class="tarjeta" data-test="evento">
    <div class="cabecera-tarjeta">
      <h2 class="titulo" data-test="titulo">{{ evento.titulo }}</h2>
      <Tag :value="nombreEstado(evento.estado)" :severity="severidad" data-test="estado" />
    </div>
    <p class="datos">
      <span data-test="fecha"><i class="pi pi-calendar" /> {{ formatearFecha(evento.fecha) }}</span>
      <span data-test="ciudad"><i class="pi pi-map-marker" /> {{ evento.ciudad }}</span>
      <span v-if="evento.genero" class="genero" data-test="genero"><i class="pi pi-headphones" /> {{ evento.genero }}</span>
    </p>
  </article>
</template>

<style scoped>
.tarjeta {
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
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
