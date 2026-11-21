const NOMBRES_ESTADO = { abierto: 'Abierto', cerrado: 'Cerrado', completado: 'Completado' }

const dosCifras = (numero) => String(numero).padStart(2, '0')

/** Fecha en formato dd/mm/aaaa hh:mm, en la hora local del navegador. */
export function formatearFecha(fecha) {
  const valor = new Date(fecha)
  const dia = `${dosCifras(valor.getDate())}/${dosCifras(valor.getMonth() + 1)}/${valor.getFullYear()}`
  const hora = `${dosCifras(valor.getHours())}:${dosCifras(valor.getMinutes())}`
  return `${dia} ${hora}`
}

export function nombreEstado(estado) {
  return NOMBRES_ESTADO[estado] ?? estado
}

// Color del Tag de PrimeVue según el estado del evento
const SEVERIDAD_ESTADO = { abierto: 'success', cerrado: 'warn', completado: 'secondary' }

export function severidadEstado(estado) {
  return SEVERIDAD_ESTADO[estado] ?? 'secondary'
}

const FORMATO_EUROS = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

/** Presupuesto en euros (por ejemplo, "1500,00 €"), o "Sin indicar" si no tiene. */
export function formatearPresupuesto(presupuesto) {
  if (presupuesto === null || presupuesto === undefined) return 'Sin indicar'
  return FORMATO_EUROS.format(presupuesto)
}
