<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import TarjetaEvento from '@/components/TarjetaEvento.vue'
import PaginacionEventos from '@/components/PaginacionEventos.vue'
import BusquedaEventos from '@/components/BusquedaEventos.vue'
import { useEventosStore } from '@/stores/eventos.js'
import { useSesionStore } from '@/stores/sesion.js'
import { filtrosDeLaUrl } from '@/utils/busqueda.js'

const route = useRoute()
const router = useRouter()
const store = useEventosStore()
const sesion = useSesionStore()

/** Página de la URL (?pagina=2). Si no es un entero mayor que 0, se usa la 1. */
const paginaUrl = computed(() => {
  const valor = route.query.pagina
  return typeof valor === 'string' && /^[1-9]\d*$/.test(valor) ? Number(valor) : 1
})

/** Filtros de búsqueda de la URL (?ciudad=Alicante&genero=techno&desde=2027-01-01&hasta=...). */
const filtrosUrl = computed(() => filtrosDeLaUrl(route.query))

// Cada vez que cambian la página o los filtros de la URL (buscar, botones, atrás/adelante
// o enlace directo) se carga. Se compara el texto de los filtros para no recargar si no cambian.
watch(
  [paginaUrl, () => JSON.stringify(filtrosUrl.value)],
  () => {
    // Al salir del listado (por ejemplo, al abrir un detalle) la URL cambia antes de que
    // se desmonte la vista: en ese caso no se carga nada
    if (route.name !== 'eventos') return
    store.cargarPagina(paginaUrl.value, filtrosUrl.value)
  },
  { immediate: true }
)

// Hay eventos, pero la página pedida está más allá de la última
const paginaNoExiste = computed(() => store.total > 0 && store.eventos.length === 0)

async function irAPagina(pagina) {
  // Al cambiar de página se mantienen los filtros de la búsqueda
  await router.push({ name: 'eventos', query: { ...filtrosUrl.value, pagina } })
  window.scrollTo({ top: 0 })
}

/** Una búsqueda nueva siempre empieza en la página 1. Con filtros vacíos es el listado completo. */
function buscar(filtros) {
  router.push({ name: 'eventos', query: { ...filtros, pagina: 1 } })
}
</script>

<template>
  <div class="cabecera-listado">
    <h1>Eventos</h1>
    <!-- Solo los organizadores pueden crear eventos -->
    <Button
      v-if="sesion.esOrganizador"
      as="router-link"
      :to="{ name: 'nuevo-evento' }"
      label="Nuevo evento"
      icon="pi pi-plus"
      data-test="nuevo-evento"
    />
  </div>

  <BusquedaEventos :filtros="filtrosUrl" @buscar="buscar" />

  <div v-if="store.cargando" class="estado" data-test="cargando">
    <ProgressSpinner style="width: 48px; height: 48px" stroke-width="4" aria-label="Cargando eventos" />
  </div>

  <div v-else-if="store.error" class="estado">
    <Message severity="error" data-test="error">{{ store.error }}</Message>
    <Button label="Reintentar" icon="pi pi-refresh" data-test="reintentar" @click="store.cargarPagina(paginaUrl, filtrosUrl)" />
  </div>

  <div v-else-if="store.total === 0 && store.hayFiltros" class="estado">
    <Message severity="info" data-test="sin-resultados">No hay eventos que coincidan con la búsqueda</Message>
    <Button label="Quitar filtros" severity="secondary" data-test="quitar-filtros-resultado" @click="buscar({})" />
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
.cabecera-listado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

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
