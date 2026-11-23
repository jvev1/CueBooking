import { createContext, useContext, useEffect, useState } from 'react'
import * as auth from '@backend/services/auth.js'
import { obtenerPerfil } from '@backend/services/perfiles.js'

const NOMBRES_ROL = { organizador: 'Organizador', dj: 'DJ' }

/**
 * Estado compartido de la sesión (usuario de Supabase Auth y su perfil). En Vue esto es el
 * store de Pinia `sesion`; en React se comparte con un Context: el proveedor guarda el estado
 * con useState y los componentes lo leen con useSesion().
 */
const SesionContext = createContext(null)

/** Si falla el perfil se cierra la sesión, como en Vue, para no quedar autenticado sin datos. */
async function perfilOCerrarSesion(usuario) {
  try {
    return await obtenerPerfil(usuario.id)
  } catch (error) {
    await auth.logout()
    throw error
  }
}

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  // Mientras se recupera la sesión guardada no se muestra nada, para no enseñar el login un momento
  const [comprobando, setComprobando] = useState(true)

  // Al arrancar se recupera la sesión que Supabase guarda en el navegador
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        const actual = await auth.usuarioActual()
        const perfilActual = actual ? await perfilOCerrarSesion(actual) : null
        if (cancelado) return
        setUsuario(actual)
        setPerfil(perfilActual)
      } catch (error) {
        console.error('No se ha podido recuperar la sesión:', error)
      } finally {
        if (!cancelado) setComprobando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [])

  async function login(email, password) {
    const nuevo = await auth.login(email, password)
    const perfilNuevo = await perfilOCerrarSesion(nuevo)
    setUsuario(nuevo)
    setPerfil(perfilNuevo)
  }

  async function logout() {
    await auth.logout()
    setUsuario(null)
    setPerfil(null)
  }

  const valor = {
    usuario,
    perfil,
    comprobando,
    haySesion: usuario !== null,
    rolTexto: NOMBRES_ROL[perfil?.rol] ?? '',
    login,
    logout
  }

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export function useSesion() {
  return useContext(SesionContext)
}
