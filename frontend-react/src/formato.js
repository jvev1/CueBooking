// Mismo formato que frontend-vue/src/utils/formato.js
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
