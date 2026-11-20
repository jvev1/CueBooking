<script setup>
import Button from 'primevue/button'

defineProps({
  pagina: { type: Number, required: true },
  totalPaginas: { type: Number, required: true },
  total: { type: Number, required: true }
})

const emit = defineEmits(['cambiar'])
</script>

<template>
  <nav class="paginacion" aria-label="Paginación de eventos">
    <Button
      v-if="totalPaginas > 1"
      label="Anterior"
      icon="pi pi-chevron-left"
      severity="secondary"
      size="small"
      :disabled="pagina <= 1"
      data-test="anterior"
      @click="emit('cambiar', pagina - 1)"
    />
    <span data-test="info-paginacion">
      Página {{ pagina }} de {{ totalPaginas }} · {{ total }} {{ total === 1 ? 'evento' : 'eventos' }}
    </span>
    <Button
      v-if="totalPaginas > 1"
      label="Siguiente"
      icon="pi pi-chevron-right"
      icon-pos="right"
      severity="secondary"
      size="small"
      :disabled="pagina >= totalPaginas"
      data-test="siguiente"
      @click="emit('cambiar', pagina + 1)"
    />
  </nav>
</template>

<style scoped>
.paginacion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  color: #4b5563;
}
</style>
