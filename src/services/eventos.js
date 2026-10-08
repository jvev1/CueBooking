import { supabase } from '../supabaseClient.js'
import { usuarioActual } from './auth.js'
import { validarEvento, validarEdicionEvento } from './validacion.js'

// Código de Postgres cuando una política RLS o un permiso de columna rechaza la operación
const PERMISO_DENEGADO = '42501'

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

/** Devuelve un evento. No hace falta sesión: los eventos son públicos. */
export async function obtenerEvento(id) {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Evento no encontrado')
  return data
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
