import { supabase } from '../supabaseClient.js'
import { validarRegistro } from './validacion.js'

/**
 * Registra un nuevo usuario. El perfil (nombre, rol, ciudad) lo crea un trigger
 * en la base de datos a partir de los metadatos enviados.
 */
export async function registrar({ email, password, nombre, rol, ciudad }) {
  validarRegistro({ email, password, nombre, rol, ciudad })

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre: nombre.trim(), rol, ciudad } }
  })
  if (error) throw new Error(error.message)
  return data.user
}

/**
 * Inicia sesión. Supabase Auth genera un token JWT (access_token) que el cliente
 * guarda en la sesión y envía automáticamente en cada petición posterior.
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('Email o contraseña incorrectos')
  return data.user
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/** Devuelve el usuario con sesión iniciada, o null si no hay sesión. */
export async function usuarioActual() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}
