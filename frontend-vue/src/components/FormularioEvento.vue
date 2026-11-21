<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { GENEROS, ESTADOS_EVENTO, validarFormularioEvento } from '@backend/services/validacion.js'
import { nombreEstado } from '@/utils/formato.js'

/**
 * Formulario común a crear y editar eventos. Valida los datos antes de emitir "guardar";
 * la vista que lo usa es la que llama al store y muestra el error del backend.
 */
const props = defineProps({
  // Evento con los datos actuales al editar; null al crear
  inicial: { type: Object, default: null },
  // El estado solo se puede cambiar al editar
  conEstado: { type: Boolean, default: false },
  guardando: { type: Boolean, default: false },
  errorServidor: { type: String, default: '' },
  textoGuardar: { type: String, default: 'Guardar' }
})

const emit = defineEmits(['guardar', 'cancelar'])

const inicial = props.inicial ?? {}
const titulo = ref(inicial.titulo ?? '')
const descripcion = ref(inicial.descripcion ?? '')
const fecha = ref(inicial.fecha ? new Date(inicial.fecha) : null)
const ciudad = ref(inicial.ciudad ?? '')
const lugar = ref(inicial.lugar ?? '')
const genero = ref(inicial.genero ?? null)
const presupuesto = ref(inicial.presupuesto ?? null)
const estado = ref(inicial.estado ?? 'abierto')
const errores = ref({})

const opcionesGenero = GENEROS.map((valor) => ({ valor, nombre: valor.charAt(0).toUpperCase() + valor.slice(1) }))
const opcionesEstado = ESTADOS_EVENTO.map((valor) => ({ valor, nombre: nombreEstado(valor) }))

// Al editar, si no se ha cambiado la fecha no se exige que sea futura
const fechaSinCambiar = computed(
  () => Boolean(props.inicial?.fecha) && fecha.value?.getTime() === new Date(props.inicial.fecha).getTime()
)

const ahora = new Date()

const textoOpcional = (valor) => (valor && valor.trim() ? valor.trim() : null)

function enviar() {
  errores.value = validarFormularioEvento(
    { titulo: titulo.value, fecha: fecha.value, ciudad: ciudad.value, presupuesto: presupuesto.value },
    { exigirFechaFutura: !fechaSinCambiar.value }
  )
  if (Object.keys(errores.value).length > 0) return

  const datos = {
    titulo: titulo.value.trim(),
    descripcion: textoOpcional(descripcion.value),
    fecha: fecha.value.toISOString(),
    ciudad: ciudad.value.trim(),
    lugar: textoOpcional(lugar.value),
    genero: genero.value ?? null,
    presupuesto: presupuesto.value ?? null
  }
  if (props.conEstado) datos.estado = estado.value
  emit('guardar', datos)
}
</script>

<template>
  <form class="formulario" novalidate @submit.prevent="enviar">
    <div class="campo">
      <label for="titulo">Título *</label>
      <InputText id="titulo" v-model="titulo" :invalid="!!errores.titulo" fluid data-test="titulo" />
      <Message v-if="errores.titulo" severity="error" size="small" variant="simple" data-test="error-titulo">
        {{ errores.titulo }}
      </Message>
    </div>

    <div class="campo">
      <label for="descripcion">Descripción</label>
      <Textarea id="descripcion" v-model="descripcion" rows="4" auto-resize fluid data-test="descripcion" />
    </div>

    <div class="fila">
      <div class="campo">
        <label for="fecha">Fecha y hora *</label>
        <DatePicker
          v-model="fecha"
          input-id="fecha"
          show-time
          hour-format="24"
          date-format="dd/mm/yy"
          :min-date="ahora"
          show-icon
          :invalid="!!errores.fecha"
          fluid
          data-test="fecha"
        />
        <Message v-if="errores.fecha" severity="error" size="small" variant="simple" data-test="error-fecha">
          {{ errores.fecha }}
        </Message>
      </div>

      <div class="campo">
        <label for="genero">Género</label>
        <Select
          v-model="genero"
          input-id="genero"
          :options="opcionesGenero"
          option-label="nombre"
          option-value="valor"
          placeholder="Sin género"
          show-clear
          fluid
          data-test="genero"
        />
      </div>
    </div>

    <div class="fila">
      <div class="campo">
        <label for="ciudad">Ciudad *</label>
        <InputText id="ciudad" v-model="ciudad" :invalid="!!errores.ciudad" fluid data-test="ciudad" />
        <Message v-if="errores.ciudad" severity="error" size="small" variant="simple" data-test="error-ciudad">
          {{ errores.ciudad }}
        </Message>
      </div>

      <div class="campo">
        <label for="lugar">Lugar</label>
        <InputText id="lugar" v-model="lugar" fluid data-test="lugar" />
      </div>
    </div>

    <div class="fila">
      <div class="campo">
        <label for="presupuesto">Presupuesto</label>
        <InputNumber
          v-model="presupuesto"
          input-id="presupuesto"
          mode="currency"
          currency="EUR"
          locale="es-ES"
          :invalid="!!errores.presupuesto"
          fluid
          data-test="presupuesto"
        />
        <Message v-if="errores.presupuesto" severity="error" size="small" variant="simple" data-test="error-presupuesto">
          {{ errores.presupuesto }}
        </Message>
      </div>

      <div v-if="conEstado" class="campo">
        <label for="estado">Estado</label>
        <Select
          v-model="estado"
          input-id="estado"
          :options="opcionesEstado"
          option-label="nombre"
          option-value="valor"
          fluid
          data-test="estado"
        />
      </div>
    </div>

    <Message v-if="errorServidor" severity="error" data-test="error-servidor">{{ errorServidor }}</Message>

    <div class="acciones">
      <Button
        type="button"
        label="Cancelar"
        severity="secondary"
        :disabled="guardando"
        data-test="cancelar"
        @click="emit('cancelar')"
      />
      <Button type="submit" :label="textoGuardar" :loading="guardando" :disabled="guardando" data-test="guardar" />
    </div>
  </form>
</template>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.fila {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
