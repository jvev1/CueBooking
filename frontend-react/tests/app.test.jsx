import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@backend/services/auth.js', () => ({ login: vi.fn(), logout: vi.fn(), usuarioActual: vi.fn() }))
vi.mock('@backend/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))
vi.mock('@backend/services/eventos.js', () => ({ buscarEventos: vi.fn(), eliminarEvento: vi.fn() }))

import * as auth from '@backend/services/auth.js'
import { obtenerPerfil } from '@backend/services/perfiles.js'
import { buscarEventos, eliminarEvento } from '@backend/services/eventos.js'
import App from '../src/App.jsx'
import { SesionProvider } from '../src/SesionContext.jsx'

const ORGANIZADOR = { id: 'org-1', email: 'org@gmail.com' }
const PERFIL_ORGANIZADOR = { id: 'org-1', nombre: 'Organizador Prueba', rol: 'organizador' }

function evento(numero, cambios = {}) {
  return {
    id: `e${numero}`,
    organizador_id: 'org-1',
    titulo: `Evento ${numero}`,
    fecha: new Date(2027, 0, numero, 22, 0).toISOString(),
    ciudad: 'Alicante',
    estado: 'abierto',
    ...cambios
  }
}

/** buscarEventos devuelve la página pedida de una lista que se puede cambiar (al borrar). */
function conEventos(lista) {
  const todos = [...lista]
  buscarEventos.mockImplementation(async ({ pagina, tamano }) => ({
    datos: todos.slice((pagina - 1) * tamano, pagina * tamano),
    total: todos.length,
    pagina,
    tamano
  }))
  eliminarEvento.mockImplementation(async (id) => {
    todos.splice(
      todos.findIndex((e) => e.id === id),
      1
    )
  })
  return todos
}

function conSesion(usuario, perfil) {
  auth.usuarioActual.mockResolvedValue(usuario)
  obtenerPerfil.mockResolvedValue(perfil)
}

async function montar() {
  render(
    <SesionProvider>
      <App />
    </SesionProvider>
  )
  // Espera a que termine de comprobar la sesión (hasta entonces no se pinta nada)
  // y a que se cargue la primera página
  await screen.findByRole('heading', { name: 'Eventos' })
  await waitFor(() => expect(screen.queryByTestId('cargando')).not.toBeInTheDocument())
}

const paginasPedidas = () => buscarEventos.mock.calls.map(([parametros]) => parametros.pagina)

describe('Frontend React', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    conSesion(null, null)
    conEventos([])
  })

  describe('Sesión', () => {
    it('login con el formulario vacío muestra los errores y no llama al backend', async () => {
      await montar()

      await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
      expect(auth.login).not.toHaveBeenCalled()
    })

    it('login correcto muestra el nombre, el rol y "Cerrar sesión"', async () => {
      auth.login.mockResolvedValue(ORGANIZADOR)
      obtenerPerfil.mockResolvedValue(PERFIL_ORGANIZADOR)
      await montar()

      await userEvent.type(screen.getByLabelText('Email'), 'org@gmail.com')
      await userEvent.type(screen.getByLabelText('Contraseña'), 'prueba123')
      await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

      expect(await screen.findByText('Organizador Prueba')).toBeInTheDocument()
      expect(screen.getByText('Organizador')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
      expect(auth.login).toHaveBeenCalledWith('org@gmail.com', 'prueba123')
    })

    it('login incorrecto muestra "Email o contraseña incorrectos"', async () => {
      auth.login.mockRejectedValue(new Error('Email o contraseña incorrectos'))
      await montar()

      await userEvent.type(screen.getByLabelText('Email'), 'org@gmail.com')
      await userEvent.type(screen.getByLabelText('Contraseña'), 'mala123')
      await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('Email o contraseña incorrectos')
    })

    it('cerrar sesión vuelve al formulario de login y quita los botones "Eliminar"', async () => {
      conSesion(ORGANIZADOR, PERFIL_ORGANIZADOR)
      conEventos([evento(1)])
      auth.logout.mockResolvedValue()
      await montar()
      expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

      expect(await screen.findByLabelText('Email')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
    })

    it('al arrancar con una sesión guardada se ve el usuario sin volver a iniciar sesión', async () => {
      conSesion(ORGANIZADOR, PERFIL_ORGANIZADOR)
      await montar()

      expect(screen.getByText('Organizador Prueba')).toBeInTheDocument()
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    })
  })

  describe('Listado', () => {
    it('mientras se cargan los eventos muestra el indicador de carga', async () => {
      buscarEventos.mockReturnValue(new Promise(() => {}))
      render(
        <SesionProvider>
          <App />
        </SesionProvider>
      )

      expect(await screen.findByTestId('cargando')).toBeInTheDocument()
    })

    it('muestra título, fecha, ciudad y estado de cada evento', async () => {
      conEventos([evento(5, { estado: 'cerrado' })])
      await montar()

      const tarjeta = screen.getByTestId('evento')
      expect(within(tarjeta).getByText('Evento 5')).toBeInTheDocument()
      expect(within(tarjeta).getByText('05/01/2027 22:00')).toBeInTheDocument()
      expect(within(tarjeta).getByText('Alicante')).toBeInTheDocument()
      expect(within(tarjeta).getByText('Cerrado')).toBeInTheDocument()
    })

    it('con el listado vacío muestra "Todavía no hay eventos publicados"', async () => {
      await montar()

      expect(screen.getByText('Todavía no hay eventos publicados')).toBeInTheDocument()
    })

    it('si falla la carga muestra el error y "Reintentar" vuelve a pedir la página', async () => {
      buscarEventos.mockRejectedValueOnce(new Error('Failed to fetch'))
      await montar()
      expect(screen.getByText('No se han podido cargar los eventos')).toBeInTheDocument()
      conEventos([evento(1)])

      await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(await screen.findByText('Evento 1')).toBeInTheDocument()
      expect(paginasPedidas()).toEqual([1, 1])
    })

    it('"Siguiente" y "Anterior" piden la página siguiente y la anterior', async () => {
      conEventos(Array.from({ length: 25 }, (_, i) => evento(i + 1)))
      await montar()
      expect(screen.getByTestId('info-paginacion')).toHaveTextContent('Página 1 de 3 · 25 eventos')

      await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
      await waitFor(() => expect(screen.getByTestId('info-paginacion')).toHaveTextContent('Página 2 de 3'))
      await userEvent.click(screen.getByRole('button', { name: 'Anterior' }))
      await waitFor(() => expect(screen.getByTestId('info-paginacion')).toHaveTextContent('Página 1 de 3'))

      expect(paginasPedidas()).toEqual([1, 2, 1])
    })

    it('"Anterior" está desactivado en la primera página y "Siguiente" en la última', async () => {
      conEventos(Array.from({ length: 15 }, (_, i) => evento(i + 1)))
      await montar()
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()

      await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
      await waitFor(() => expect(screen.getByTestId('info-paginacion')).toHaveTextContent('Página 2 de 2'))

      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
    })
  })

  describe('Borrar', () => {
    it.each([
      ['sin sesión', null, null],
      ['con un DJ', { id: 'dj-1' }, { id: 'dj-1', nombre: 'DJ Prueba', rol: 'dj' }],
      ['con otro organizador', { id: 'org-2' }, { id: 'org-2', nombre: 'Otro', rol: 'organizador' }]
    ])('"Eliminar" no se ve %s', async (_, usuario, perfil) => {
      conSesion(usuario, perfil)
      conEventos([evento(1)])
      await montar()

      expect(screen.getByText('Evento 1')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
    })

    it('"Eliminar" se ve con el organizador del evento', async () => {
      conSesion(ORGANIZADOR, PERFIL_ORGANIZADOR)
      conEventos([evento(1)])
      await montar()

      expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
    })

    it('si se cancela la confirmación no se llama a eliminarEvento', async () => {
      conSesion(ORGANIZADOR, PERFIL_ORGANIZADOR)
      conEventos([evento(1)])
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      await montar()

      await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

      expect(window.confirm).toHaveBeenCalled()
      expect(eliminarEvento).not.toHaveBeenCalled()
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })

    it('al confirmar se llama a eliminarEvento y se vuelve a cargar la página', async () => {
      conSesion(ORGANIZADOR, PERFIL_ORGANIZADOR)
      conEventos([evento(1), evento(2)])
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      await montar()

      await userEvent.click(within(screen.getAllByTestId('evento')[0]).getByRole('button', { name: 'Eliminar' }))

      await waitFor(() => expect(screen.queryByText('Evento 1')).not.toBeInTheDocument())
      expect(eliminarEvento).toHaveBeenCalledWith('e1')
      expect(screen.getByText('Evento 2')).toBeInTheDocument()
      expect(paginasPedidas()).toEqual([1, 1])
    })

    it('al borrar el único evento de la última página va a la página anterior', async () => {
      conSesion(ORGANIZADOR, PERFIL_ORGANIZADOR)
      conEventos(Array.from({ length: 11 }, (_, i) => evento(i + 1)))
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      await montar()
      await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
      await waitFor(() => expect(screen.getByTestId('info-paginacion')).toHaveTextContent('Página 2 de 2'))

      await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

      await waitFor(() => expect(screen.getByTestId('info-paginacion')).toHaveTextContent('Página 1 de 1 · 10 eventos'))
      expect(eliminarEvento).toHaveBeenCalledWith('e11')
    })

    it('si el backend devuelve un error al borrar se muestra su mensaje', async () => {
      conSesion(ORGANIZADOR, PERFIL_ORGANIZADOR)
      conEventos([evento(1)])
      eliminarEvento.mockRejectedValue(new Error('Evento no encontrado o no tienes permiso para eliminarlo'))
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      await montar()

      await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('Evento no encontrado o no tienes permiso para eliminarlo')
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })
  })
})
