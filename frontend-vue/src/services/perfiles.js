import { supabase } from '../supabaseClient.js'
import { usuarioActual } from './auth.js'
import { validarEdicionPerfil } from './validacion.js'

export async function obtenerPerfil(id) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Perfil no encontrado')
  return data
}

/** Modifica el perfil del usuario con sesión iniciada (solo nombre, ciudad y bio). */
export async function editarPerfil(datos) {
  const usuario = await usuarioActual()
  if (!usuario) throw new Error('Debes iniciar sesión para editar tu perfil')

  validarEdicionPerfil(datos)

  const { data, error } = await supabase
    .from('perfiles')
    .update(datos)
    .eq('id', usuario.id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

/** Listado paginado de DJs. Las páginas empiezan en 1. */
export async function listarDJs({ pagina = 1, tamano = 10 } = {}) {
  const desde = (pagina - 1) * tamano
  const hasta = desde + tamano - 1

  const { data, count, error } = await supabase
    .from('perfiles')
    .select('*', { count: 'exact' })
    .eq('rol', 'dj')
    .order('creado_en', { ascending: false })
    .range(desde, hasta)
  if (error) throw new Error(error.message)

  return { datos: data, total: count, pagina, tamano }
}
