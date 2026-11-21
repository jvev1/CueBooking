<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import { useEventosStore } from '@/stores/eventos.js'
import { useSesionStore } from '@/stores/sesion.js'
import { formatearFecha, formatearPresupuesto, nombreEstado, severidadEstado } from '@/utils/formato.js'

const route = useRoute()
const router = useRouter()
const eventos = useEventosStore()
const sesion = useSesionStore()
const confirm = useConfirm()

const eliminando = ref(false)
const errorAccion = ref('')

// Se carga el evento al entrar y cada vez que cambia el id de la URL
watch(
  () => route.params.id,
  (id) => {
    errorAccion.value = ''
    eventos.cargarEvento(id)
  },
  { immediate: true }
)

const evento = computed(() => eventos.evento)

// Editar y eliminar solo los ve el organizador del evento (RLS lo vuelve a comprobar en el backend)
const esSuyo = computed(() => sesion.haySesion && evento.value?.organizador_id === sesion.usuario.id)

function pedirConfirmacion() {
  confirm.require({
    header: 'Eliminar evento',
    message: `¿Seguro que quieres eliminar "${evento.value.titulo}"? No se puede deshacer.`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancelar', severity: 'secondary' },
    acceptProps: { label: 'Eliminar', severity: 'danger' },
    accept: eliminar
  })
}

async function eliminar() {
  eliminando.value = true
  errorAccion.value = ''
  try {
    await eventos.eliminarEvento(evento.value.id)
    router.push({ name: 'eventos' })
  } catch (error) {
    // Por ejemplo, si el backend no deja borrarlo: se sigue en el detalle
    errorAccion.value = error.message
  } finally {
    eliminando.value = false
  }
}
</script>

<template>
  <ConfirmDialog />

  <RouterLink :to="{ name: 'eventos' }" class="volver" data-test="volver">
    <i class="pi pi-arrow-left" /> Volver al listado
  </RouterLink>

  <div v-if="eventos.cargandoEvento" class="estado" data-test="cargando">
    <ProgressSpinner style="width: 48px; height: 48px" stroke-width="4" aria-label="Cargando evento" />
  </div>

  <div v-else-if="eventos.errorEvento" class="estado">
    <Message severity="warn" data-test="error-evento">{{ eventos.errorEvento }}</Message>
  </div>

  <article v-else-if="evento" class="detalle">
    <div class="cabecera-detalle">
      <h1 data-test="titulo">{{ evento.titulo }}</h1>
      <Tag :value="nombreEstado(evento.estado)" :severity="severidadEstado(evento.estado)" data-test="estado" />
    </div>

    <dl class="datos">
      <dt>Fecha</dt>
      <dd data-test="fecha">{{ formatearFecha(evento.fecha) }}</dd>
      <dt>Ciudad</dt>
      <dd data-test="ciudad">{{ evento.ciudad }}</dd>
      <dt>Lugar</dt>
      <dd data-test="lugar">{{ evento.lugar || 'Sin indicar' }}</dd>
      <dt>Género</dt>
      <dd class="genero" data-test="genero">{{ evento.genero || 'Sin indicar' }}</dd>
      <dt>Presupuesto</dt>
      <dd data-test="presupuesto">{{ formatearPresupuesto(evento.presupuesto) }}</dd>
    </dl>

    <p class="descripcion" data-test="descripcion">{{ evento.descripcion || 'Sin descripción' }}</p>

    <Message v-if="errorAccion" severity="error" data-test="error-accion">{{ errorAccion }}</Message>

    <div v-if="esSuyo" class="acciones">
      <Button
        as="router-link"
        :to="{ name: 'editar-evento', params: { id: evento.id } }"
        label="Editar"
        icon="pi pi-pencil"
        severity="secondary"
        data-test="editar"
      />
      <Button
        label="Eliminar"
        icon="pi pi-trash"
        severity="danger"
        :loading="eliminando"
        :disabled="eliminando"
        data-test="eliminar"
        @click="pedirConfirmacion"
      />
    </div>
  </article>
</template>

<style scoped>
.volver {
  display: inline-block;
  margin-bottom: 1rem;
  color: #4b5563;
  text-decoration: none;
}

.estado {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.detalle {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.cabecera-detalle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cabecera-detalle h1 {
  margin: 0;
}

.datos {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.4rem 1.5rem;
  margin: 0;
}

.datos dt {
  font-weight: 600;
}

.datos dd {
  margin: 0;
}

.genero {
  text-transform: capitalize;
}

.descripcion {
  margin: 0;
  white-space: pre-line;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
