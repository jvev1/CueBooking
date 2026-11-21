<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormularioEvento from '@/components/FormularioEvento.vue'
import { useEventosStore } from '@/stores/eventos.js'

const router = useRouter()
const eventos = useEventosStore()

// El guard de la ruta ya ha cargado el evento y ha comprobado que es del usuario
const evento = eventos.evento

const guardando = ref(false)
const errorServidor = ref('')

const irAlDetalle = () => router.push({ name: 'detalle-evento', params: { id: evento.id } })

async function guardar(datos) {
  // Solo se envían los campos que han cambiado. Así, si no se toca la fecha de un evento
  // que ya ha pasado, el backend no la vuelve a validar (tiene que ser futura).
  const cambios = Object.fromEntries(
    Object.entries(datos).filter(([campo, valor]) =>
      campo === 'fecha' ? new Date(valor).getTime() !== new Date(evento.fecha).getTime() : valor !== evento[campo]
    )
  )
  if (Object.keys(cambios).length === 0) return irAlDetalle()

  guardando.value = true
  errorServidor.value = ''
  try {
    await eventos.modificarEvento(evento.id, cambios)
    irAlDetalle()
  } catch (error) {
    errorServidor.value = error.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <h1>Editar evento</h1>
  <FormularioEvento
    :inicial="evento"
    con-estado
    :guardando="guardando"
    :error-servidor="errorServidor"
    texto-guardar="Guardar cambios"
    @guardar="guardar"
    @cancelar="irAlDetalle"
  />
</template>
