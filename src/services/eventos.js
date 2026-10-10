import { supabase } from '../supabaseClient.js'
import { usuarioActual } from './auth.js'
import { validarEvento, validarEdicionEvento, validarBusquedaEventos } from './validacion.js'
import { listarPropuestas } from './propuestas.js'

// Código de Postgres cuando una política RLS o un permiso de columna rechaza la operación
const PERMISO_DENEGADO = '42501'
// Código de PostgREST cuando se pide una página que empieza más allá de la última fila
const RANGO_FUERA_DE_LIMITES = 'PGRST103'

/**
 * Crea un evento a nombre del usuario con sesión iniciada. Empieza en estado 'abierto'.
 * Que solo un organizador pueda crear eventos lo comprueba la política RLS de la tabla.
 */
export async function crearEvento(datos) {
  const usuario = await usuarioActual()
  if (!usuario) throw new Error('Debes iniciar sesión para crear un evento')

  validarEvento(datos)

  const { data, error } = await supabase
    .from('eventos')
    .insert({ ...datos, organizador_id: usuario.id })
    .select()
    .single()
  if (error) {
    if (error.code === PERMISO_DENEGADO) throw new Error('Solo los organizadores pueden crear eventos')
    throw new Error(error.message)
  }
  return data
}

/**
 * Devuelve un evento con sus propuestas. No hace falta sesión: los eventos son públicos.
 * Las propuestas incluidas son las que el usuario puede ver según RLS (sin sesión, ninguna).
 */
export async function obtenerEvento(id) {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Evento no encontrado')

  const propuestas = await listarPropuestas(id)
  return { ...data, propuestas }
}

/**
 * Busca eventos con filtros opcionales, ordenados por fecha ascendente y paginados.
 * Las páginas empiezan en 1. No hace falta sesión: los eventos son públicos.
 */
export async function buscarEventos(parametros = {}) {
  validarBusquedaEventos(parametros)
  const { pagina = 1, tamano = 10 } = parametros
  const inicio = (pagina - 1) * tamano
  const fin = inicio + tamano - 1

  const { data, count, error } = await filtrarEventos(parametros, { count: 'exact' })
    .order('fecha', { ascending: true })
    .range(inicio, fin)
  if (error?.code === RANGO_FUERA_DE_LIMITES) {
    // La página se sale del final: no es un error, pero PostgREST no devuelve el total en este caso
    const { count: total, error: errorTotal } = await filtrarEventos(parametros, { count: 'exact', head: true })
    if (errorTotal) throw new Error(errorTotal.message)
    return { datos: [], total, pagina, tamano }
  }
  if (error) throw new Error(error.message)

  return { datos: data, total: count, pagina, tamano }
}

/** Consulta de eventos con los filtros de búsqueda que se hayan indicado. */
function filtrarEventos({ ciudad, genero, desde, hasta }, opciones) {
  let consulta = supabase.from('eventos').select('*', opciones)
  // Se escapan % y _ para que ilike compare la ciudad entera, solo sin distinguir mayúsculas
  if (ciudad !== undefined && ciudad !== null) consulta = consulta.ilike('ciudad', ciudad.replace(/[\\%_]/g, '\\$&'))
  if (genero !== undefined && genero !== null) consulta = consulta.eq('genero', genero)
  if (desde !== undefined && desde !== null) consulta = consulta.gte('fecha', desde)
  if (hasta !== undefined && hasta !== null) consulta = consulta.lte('fecha', hasta)
  return consulta
}

/**
 * Modifica un evento propio. Si el evento es de otro organizador, la política RLS
 * hace que no se actualice ninguna fila.
 */
export async function modificarEvento(id, datos) {
  const usuario = await usuarioActual()
  if (!usuario) throw new Error('Debes iniciar sesión para modificar un evento')

  validarEdicionEvento(datos)

  const { data, error } = await supabase
    .from('eventos')
    .update(datos)
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Evento no encontrado o no tienes permiso para modificarlo')
  return data
}

/** Borra un evento propio. Igual que al modificar, RLS impide borrar los de otro organizador. */
export async function eliminarEvento(id) {
  const usuario = await usuarioActual()
  if (!usuario) throw new Error('Debes iniciar sesión para eliminar un evento')

  const { data, error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id)
    .select()
  if (error) throw new Error(error.message)
  if (data.length === 0) throw new Error('Evento no encontrado o no tienes permiso para eliminarlo')
}
