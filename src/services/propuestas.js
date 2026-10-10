import { supabase } from '../supabaseClient.js'
import { usuarioActual } from './auth.js'
import { validarPropuesta } from './validacion.js'

// Código de Postgres cuando una política RLS o un permiso de columna rechaza la operación
const PERMISO_DENEGADO = '42501'
// Código de Postgres cuando se incumple una restricción unique
const VALOR_DUPLICADO = '23505'

/**
 * Envía una propuesta a un evento a nombre del usuario con sesión iniciada. Empieza en estado 'pendiente'.
 * Que solo un DJ pueda enviarla y solo a un evento abierto lo comprueba la política RLS de la tabla;
 * aquí se mira antes el evento para dar un mensaje más claro.
 */
export async function enviarPropuesta(eventoId, datos) {
  const usuario = await usuarioActual()
  if (!usuario) throw new Error('Debes iniciar sesión para enviar una propuesta')

  validarPropuesta(datos)

  const { data: evento, error: errorEvento } = await supabase
    .from('eventos')
    .select('estado')
    .eq('id', eventoId)
    .maybeSingle()
  if (errorEvento) throw new Error(errorEvento.message)
  if (!evento) throw new Error('Evento no encontrado')
  if (evento.estado !== 'abierto') throw new Error('Solo se pueden enviar propuestas a eventos abiertos')

  const { data, error } = await supabase
    .from('propuestas')
    .insert({ ...datos, evento_id: eventoId, dj_id: usuario.id })
    .select()
    .single()
  if (error) {
    if (error.code === PERMISO_DENEGADO) throw new Error('Solo los DJs pueden enviar propuestas')
    if (error.code === VALOR_DUPLICADO) throw new Error('Ya has enviado una propuesta a este evento')
    throw new Error(error.message)
  }
  return data
}

/**
 * Propuestas de un evento, de la más antigua a la más reciente. Qué propuestas se ven lo decide
 * la política RLS: el organizador ve todas, un DJ solo las suyas y sin sesión ninguna.
 */
export async function listarPropuestas(eventoId) {
  const { data, error } = await supabase
    .from('propuestas')
    .select('*')
    .eq('evento_id', eventoId)
    .order('creado_en', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

/** Retira (borra) una propuesta propia. RLS impide borrar las de otro DJ. */
export async function retirarPropuesta(id) {
  const usuario = await usuarioActual()
  if (!usuario) throw new Error('Debes iniciar sesión para retirar una propuesta')

  const { data, error } = await supabase
    .from('propuestas')
    .delete()
    .eq('id', id)
    .select()
  if (error) throw new Error(error.message)
  if (data.length === 0) throw new Error('Propuesta no encontrada o no tienes permiso para retirarla')
}
