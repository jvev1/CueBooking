<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import FormularioPropuesta from '@/components/FormularioPropuesta.vue'
import { useEventosStore } from '@/stores/eventos.js'
import { useSesionStore } from '@/stores/sesion.js'
import { formatearDuracion, formatearFecha, formatearPresupuesto } from '@/utils/formato.js'

/**
 * Sección "Propuestas" del detalle. Las propuestas que se ven las decide RLS en el backend
 * (el organizador del evento todas, un DJ solo la suya): aquí se muestran las que llegan.
 * DetalleEventoView solo la muestra al organizador del evento y a los DJs.
 */
const props = defineProps({
  evento: { type: Object, required: true }
})

const eventos = useEventosStore()
const sesion = useSesionStore()
// Usa el ConfirmDialog que ya hay en DetalleEventoView
const confirm = useConfirm()

const enviando = ref(false)
const errorEnviar = ref('')
const retirando = ref(null)
const errorRetirar = ref('')

const propuestas = computed(() => props.evento.propuestas ?? [])
const miPropuesta = computed(() => propuestas.value.find((p) => p.dj_id === sesion.usuario?.id) ?? null)
const eventoAbierto = computed(() => props.evento.estado === 'abierto')

// El formulario solo sale a un DJ que todavía no ha enviado una propuesta a un evento abierto
const puedeEnviar = computed(() => sesion.esDj && !miPropuesta.value && eventoAbierto.value)

async function enviar(datos) {
  enviando.value = true
  errorEnviar.value = ''
  try {
    await eventos.enviarPropuesta(props.evento.id, datos)
  } catch (error) {
    // Por ejemplo "Ya has enviado una propuesta a este evento"
    errorEnviar.value = error.message
  } finally {
    enviando.value = false
  }
}

function pedirConfirmacion(propuesta) {
  confirm.require({
    header: 'Retirar propuesta',
    message: '¿Seguro que quieres retirar tu propuesta? Se borrará.',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancelar', severity: 'secondary' },
    acceptProps: { label: 'Retirar', severity: 'danger' },
    accept: () => retirar(propuesta)
  })
}

async function retirar(propuesta) {
  retirando.value = propuesta.id
  errorRetirar.value = ''
  try {
    await eventos.retirarPropuesta(propuesta.id)
  } catch (error) {
    errorRetirar.value = error.message
  } finally {
    retirando.value = null
  }
}
</script>

<template>
  <section class="propuestas" data-test="propuestas">
    <h2>Propuestas</h2>

    <ul v-if="propuestas.length > 0" class="lista">
      <li v-for="propuesta in propuestas" :key="propuesta.id" class="propuesta" data-test="propuesta">
        <div class="datos">
          <Tag v-if="propuesta.dj_id === sesion.usuario?.id" value="Tu propuesta" severity="info" data-test="tu-propuesta" />
          <span data-test="propuesta-precio-texto"><strong>{{ formatearPresupuesto(propuesta.precio) }}</strong></span>
          <span data-test="propuesta-duracion-texto"><i class="pi pi-clock" /> {{ formatearDuracion(propuesta.duracion_minutos) }}</span>
          <span class="enviada" data-test="propuesta-fecha">Enviada el {{ formatearFecha(propuesta.creado_en) }}</span>
        </div>
        <p v-if="propuesta.descripcion" class="descripcion" data-test="propuesta-descripcion-texto">{{ propuesta.descripcion }}</p>
        <Button
          v-if="propuesta.dj_id === sesion.usuario?.id"
          label="Retirar"
          icon="pi pi-times"
          severity="danger"
          size="small"
          outlined
          :loading="retirando === propuesta.id"
          :disabled="retirando === propuesta.id"
          data-test="retirar"
          @click="pedirConfirmacion(propuesta)"
        />
      </li>
    </ul>

    <Message v-else-if="sesion.esOrganizador" severity="info" data-test="sin-propuestas">
      Todavía no hay propuestas para este evento
    </Message>

    <Message v-if="errorRetirar" severity="error" data-test="error-retirar">{{ errorRetirar }}</Message>

    <template v-if="sesion.esDj && !miPropuesta">
      <FormularioPropuesta v-if="puedeEnviar" :enviando="enviando" :error-servidor="errorEnviar" @enviar="enviar" />
      <Message v-else severity="warn" data-test="no-acepta">Este evento ya no acepta propuestas</Message>
    </template>
  </section>
</template>

<style scoped>
.propuestas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.propuestas h2 {
  margin: 0;
  font-size: 1.2rem;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.propuesta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.datos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.enviada {
  color: #6b7280;
}

.descripcion {
  flex-basis: 100%;
  margin: 0;
  white-space: pre-line;
}
</style>
