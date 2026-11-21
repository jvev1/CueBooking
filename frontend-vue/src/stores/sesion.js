import { defineStore } from 'pinia'
import * as auth from '@backend/services/auth.js'
import { obtenerPerfil } from '@backend/services/perfiles.js'

const NOMBRES_ROL = { organizador: 'Organizador', dj: 'DJ' }

/**
 * Estado compartido de la sesión: el usuario de Supabase Auth y su perfil
 * (nombre y rol). Lo leen la cabecera, el router y las vistas.
 */
export const useSesionStore = defineStore('sesion', {
  state: () => ({
    usuario: null,
    perfil: null
  }),

  getters: {
    haySesion: (state) => state.usuario !== null,
    rolTexto: (state) => NOMBRES_ROL[state.perfil?.rol] ?? '',
    esOrganizador: (state) => state.usuario !== null && state.perfil?.rol === 'organizador'
  },

  actions: {
    /** Recupera la sesión que Supabase guarda en el navegador (por ejemplo, al recargar la página). */
    async cargarSesion() {
      const usuario = await auth.usuarioActual()
      if (!usuario) {
        this.usuario = null
        this.perfil = null
        return
      }
      try {
        this.perfil = await obtenerPerfil(usuario.id)
      } catch (error) {
        await auth.logout()
        throw error
      }
      this.usuario = usuario
    },

    /** Si el login falla, se lanza el error del servicio y no queda sesión. */
    async login(email, password) {
      const usuario = await auth.login(email, password)
      try {
        this.perfil = await obtenerPerfil(usuario.id)
      } catch (error) {
        await auth.logout()
        throw error
      }
      this.usuario = usuario
    },

    async logout() {
      await auth.logout()
      this.usuario = null
      this.perfil = null
    }
  }
})
