<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { DURACION_MAXIMA, validarFormularioPropuesta } from '@backend/services/validacion.js'

/**
 * Formulario para que un DJ envíe una propuesta. Valida antes de emitir "enviar";
 * PropuestasEvento es la que llama al store y muestra el error del backend.
 */
defineProps({
  enviando: { type: Boolean, default: false },
  errorServidor: { type: String, default: '' }
})

const emit = defineEmits(['enviar'])

const precio = ref(null)
const duracion = ref(null)
const descripcion = ref('')
const errores = ref({})

function enviar() {
  const datos = {
    precio: precio.value,
    duracion_minutos: duracion.value,
    descripcion: descripcion.value.trim() || null
  }
  errores.value = validarFormularioPropuesta(datos)
  if (Object.keys(errores.value).length > 0) return
  emit('enviar', datos)
}
</script>

<template>
  <form class="formulario-propuesta" novalidate data-test="formulario-propuesta" @submit.prevent="enviar">
    <h3>Enviar una propuesta</h3>

    <div class="fila">
      <div class="campo">
        <label for="propuesta-precio">Precio *</label>
        <InputNumber
          v-model="precio"
          input-id="propuesta-precio"
          mode="currency"
          currency="EUR"
          locale="es-ES"
          :invalid="!!errores.precio"
          fluid
          data-test="propuesta-precio"
        />
        <Message v-if="errores.precio" severity="error" size="small" variant="simple" data-test="error-precio">
          {{ errores.precio }}
        </Message>
      </div>

      <div class="campo">
        <label for="propuesta-duracion">Duración (minutos) *</label>
        <InputNumber
          v-model="duracion"
          input-id="propuesta-duracion"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :use-grouping="false"
          :placeholder="`Entre 1 y ${DURACION_MAXIMA}`"
          :invalid="!!errores.duracion_minutos"
          fluid
          data-test="propuesta-duracion"
        />
        <Message v-if="errores.duracion_minutos" severity="error" size="small" variant="simple" data-test="error-duracion">
          {{ errores.duracion_minutos }}
        </Message>
      </div>
    </div>

    <div class="campo">
      <label for="propuesta-descripcion">Descripción</label>
      <Textarea
        id="propuesta-descripcion"
        v-model="descripcion"
        rows="3"
        auto-resize
        :invalid="!!errores.descripcion"
        fluid
        data-test="propuesta-descripcion"
      />
      <Message v-if="errores.descripcion" severity="error" size="small" variant="simple" data-test="error-descripcion">
        {{ errores.descripcion }}
      </Message>
    </div>

    <Message v-if="errorServidor" severity="error" data-test="error-enviar">{{ errorServidor }}</Message>

    <div class="acciones">
      <Button type="submit" label="Enviar propuesta" icon="pi pi-send" :loading="enviando" :disabled="enviando" data-test="enviar-propuesta" />
    </div>
  </form>
</template>

<style scoped>
.formulario-propuesta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.formulario-propuesta h3 {
  margin: 0;
  font-size: 1rem;
}

.fila {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
}
</style>
