<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormularioEvento from '@/components/FormularioEvento.vue'
import { useEventosStore } from '@/stores/eventos.js'

const router = useRouter()
const eventos = useEventosStore()

const guardando = ref(false)
const errorServidor = ref('')

async function guardar(datos) {
  guardando.value = true
  errorServidor.value = ''
  try {
    const creado = await eventos.crearEvento(datos)
    router.push({ name: 'detalle-evento', params: { id: creado.id } })
  } catch (error) {
    // Errores de validación o de permisos del backend: se sigue en el formulario
    errorServidor.value = error.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <h1>Nuevo evento</h1>
  <FormularioEvento
    :guardando="guardando"
    :error-servidor="errorServidor"
    texto-guardar="Crear evento"
    @guardar="guardar"
    @cancelar="router.push({ name: 'eventos' })"
  />
</template>
