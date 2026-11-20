<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import TarjetaEvento from '@/components/TarjetaEvento.vue'
import PaginacionEventos from '@/components/PaginacionEventos.vue'
import { useEventosStore } from '@/stores/eventos.js'

const route = useRoute()
const router = useRouter()
const store = useEventosStore()

/** Página de la URL (?pagina=2). Si no es un entero mayor que 0, se usa la 1. */
const paginaUrl = computed(() => {
  const valor = route.query.pagina
  return typeof valor === 'string' && /^[1-9]\d*$/.test(valor) ? Number(valor) : 1
})

// Cada vez que cambia la página de la URL (botones, atrás/adelante o enlace directo) se carga
watch(paginaUrl, (pagina) => store.cargarPagina(pagina), { immediate: true })

// Hay eventos, pero la página pedida está más allá de la última
const paginaNoExiste = computed(() => store.total > 0 && store.eventos.length === 0)

async function irAPagina(pagina) {
  await router.push({ name: 'eventos', query: { pagina } })
  window.scrollTo({ top: 0 })
}
</script>

<template>
  <h1>Eventos</h1>

  <div v-if="store.cargando" class="estado" data-test="cargando">
    <ProgressSpinner style="width: 48px; height: 48px" stroke-width="4" aria-label="Cargando eventos" />
  </div>

  <div v-else-if="store.error" class="estado">
    <Message severity="error" data-test="error">{{ store.error }}</Message>
    <Button label="Reintentar" icon="pi pi-refresh" data-test="reintentar" @click="store.cargarPagina(paginaUrl)" />
  </div>

  <div v-else-if="store.total === 0" class="estado">
    <Message severity="info" data-test="vacio">Todavía no hay eventos publicados</Message>
  </div>

  <div v-else-if="paginaNoExiste" class="estado">
    <Message severity="warn" data-test="pagina-no-existe">Esta página no existe</Message>
    <Button label="Ir a la primera página" data-test="primera-pagina" @click="irAPagina(1)" />
  </div>

  <template v-else>
    <ul class="lista">
      <li v-for="evento in store.eventos" :key="evento.id">
        <TarjetaEvento :evento="evento" />
      </li>
    </ul>
    <PaginacionEventos
      :pagina="store.pagina"
      :total-paginas="store.totalPaginas"
      :total="store.total"
      @cambiar="irAPagina"
    />
  </template>
</template>

<style scoped>
.estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
