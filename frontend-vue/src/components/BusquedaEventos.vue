<script setup>
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { GENEROS, validarFormularioBusqueda } from '@backend/services/validacion.js'
import { fechaDeLaUrl, fechaParaUrl } from '@/utils/busqueda.js'

/**
 * Formulario de búsqueda del listado. No busca por sí mismo: emite los filtros
 * y EventosView los pone en la URL, que es la que decide qué se carga.
 */
const props = defineProps({
  // Filtros de la URL (ciudad, genero, desde y hasta en aaaa-mm-dd)
  filtros: { type: Object, required: true }
})

const emit = defineEmits(['buscar'])

const ciudad = ref('')
const genero = ref(null)
const desde = ref(null)
const hasta = ref(null)
const errores = ref({})

const opcionesGenero = GENEROS.map((valor) => ({ valor, nombre: valor.charAt(0).toUpperCase() + valor.slice(1) }))

// El formulario sale relleno con los filtros de la URL, también al ir atrás y adelante
watch(
  () => props.filtros,
  (filtros) => {
    ciudad.value = filtros.ciudad ?? ''
    genero.value = filtros.genero ?? null
    desde.value = filtros.desde ? fechaDeLaUrl(filtros.desde) : null
    hasta.value = filtros.hasta ? fechaDeLaUrl(filtros.hasta) : null
    errores.value = {}
  },
  { immediate: true }
)

function buscar() {
  errores.value = validarFormularioBusqueda({ desde: desde.value, hasta: hasta.value })
  if (Object.keys(errores.value).length > 0) return

  // Solo se emiten los filtros que tienen valor
  const filtros = {}
  if (ciudad.value.trim()) filtros.ciudad = ciudad.value.trim()
  if (genero.value) filtros.genero = genero.value
  if (desde.value) filtros.desde = fechaParaUrl(desde.value)
  if (hasta.value) filtros.hasta = fechaParaUrl(hasta.value)
  emit('buscar', filtros)
}

function quitarFiltros() {
  ciudad.value = ''
  genero.value = null
  desde.value = null
  hasta.value = null
  errores.value = {}
  emit('buscar', {})
}
</script>

<template>
  <form class="busqueda" novalidate role="search" @submit.prevent="buscar">
    <div class="campo">
      <label for="busqueda-ciudad">Ciudad</label>
      <InputText id="busqueda-ciudad" v-model="ciudad" placeholder="Ciudad entera" fluid data-test="busqueda-ciudad" />
    </div>

    <div class="campo">
      <label for="busqueda-genero">Género</label>
      <Select
        v-model="genero"
        input-id="busqueda-genero"
        :options="opcionesGenero"
        option-label="nombre"
        option-value="valor"
        placeholder="Todos"
        show-clear
        fluid
        data-test="busqueda-genero"
      />
    </div>

    <div class="campo">
      <label for="busqueda-desde">Desde</label>
      <!-- En el calendario, "desde" no puede ser posterior a "hasta" -->
      <DatePicker
        v-model="desde"
        input-id="busqueda-desde"
        date-format="dd/mm/yy"
        :max-date="hasta ?? undefined"
        show-icon
        fluid
        data-test="busqueda-desde"
      />
    </div>

    <div class="campo">
      <label for="busqueda-hasta">Hasta</label>
      <DatePicker
        v-model="hasta"
        input-id="busqueda-hasta"
        date-format="dd/mm/yy"
        :min-date="desde ?? undefined"
        show-icon
        :invalid="!!errores.hasta"
        fluid
        data-test="busqueda-hasta"
      />
    </div>

    <Message v-if="errores.hasta" class="error-fechas" severity="error" size="small" variant="simple" data-test="error-fechas">
      {{ errores.hasta }}
    </Message>

    <div class="acciones">
      <Button type="button" label="Quitar filtros" severity="secondary" data-test="quitar-filtros" @click="quitarFiltros" />
      <Button type="submit" label="Buscar" icon="pi pi-search" data-test="buscar" />
    </div>
  </form>
</template>

<style scoped>
.busqueda {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem 1rem;
  align-items: end;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.error-fechas,
.acciones {
  grid-column: 1 / -1;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
