import { GENEROS } from '@backend/services/validacion.js'

// Las fechas de la búsqueda van en la URL como aaaa-mm-dd (por ejemplo ?desde=2027-01-01)
const FECHA_URL = /^\d{4}-\d{2}-\d{2}$/

function fechaValida(valor) {
  if (typeof valor !== 'string' || !FECHA_URL.test(valor)) return false
  const [anio, mes, dia] = valor.split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia)
  // new Date corrige fechas imposibles (31 de febrero → 3 de marzo): así se detectan
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia
}

/**
 * Filtros de búsqueda de la URL. Los que no son válidos (un género que no está en la lista
 * o una fecha mal escrita) se ignoran, igual que una página que no es un número.
 */
export function filtrosDeLaUrl(query) {
  const filtros = {}
  if (typeof query.ciudad === 'string' && query.ciudad.trim()) filtros.ciudad = query.ciudad.trim()
  if (GENEROS.includes(query.genero)) filtros.genero = query.genero
  if (fechaValida(query.desde)) filtros.desde = query.desde
  if (fechaValida(query.hasta)) filtros.hasta = query.hasta
  return filtros
}

/** Fecha aaaa-mm-dd a partir de un Date, en la hora local (la que ve el usuario en el calendario). */
export function fechaParaUrl(fecha) {
  const dosCifras = (numero) => String(numero).padStart(2, '0')
  return `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`
}

/** Date en la hora local a partir de aaaa-mm-dd. */
export function fechaDeLaUrl(valor) {
  const [anio, mes, dia] = valor.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

/**
 * Parámetros para buscarEventos. "desde" es el principio de ese día y "hasta" el final,
 * para que entren todos los eventos de esos días (el backend compara fecha y hora).
 */
export function parametrosDeBusqueda(filtros) {
  const parametros = {}
  if (filtros.ciudad) parametros.ciudad = filtros.ciudad
  if (filtros.genero) parametros.genero = filtros.genero
  if (filtros.desde) parametros.desde = fechaDeLaUrl(filtros.desde).toISOString()
  if (filtros.hasta) {
    const finDelDia = fechaDeLaUrl(filtros.hasta)
    finDelDia.setHours(23, 59, 59, 999)
    parametros.hasta = finDelDia.toISOString()
  }
  return parametros
}
