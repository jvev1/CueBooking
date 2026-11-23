import { useEffect, useState } from 'react'
import { buscarEventos, eliminarEvento } from '@backend/services/eventos.js'
import TarjetaEvento from './TarjetaEvento.jsx'

const TAMANO_PAGINA = 10

/**
 * Listado paginado de eventos con borrado. Todo su estado es local (useState): en Vue está en
 * el store de Pinia `eventos` porque lo comparten varias vistas; aquí solo lo usa este componente.
 */
export default function ListadoEventos() {
  const [pagina, setPagina] = useState(1)
  const [eventos, setEventos] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorBorrar, setErrorBorrar] = useState('')
  // Cambiar este número vuelve a pedir la página actual (Reintentar y después de borrar)
  const [recargas, setRecargas] = useState(0)

  const totalPaginas = Math.ceil(total / TAMANO_PAGINA)

  // Se pide la página cada vez que cambia. Si llega tarde la respuesta de una página anterior,
  // la limpieza del efecto (ignorar = true) hace que no se guarde.
  useEffect(() => {
    let ignorar = false
    setCargando(true)
    setError('')
    buscarEventos({ pagina, tamano: TAMANO_PAGINA })
      .then((resultado) => {
        if (ignorar) return
        setEventos(resultado.datos)
        setTotal(resultado.total)
      })
      .catch(() => {
        if (ignorar) return
        setEventos([])
        setTotal(0)
        setError('No se han podido cargar los eventos')
      })
      .finally(() => {
        if (!ignorar) setCargando(false)
      })
    return () => {
      ignorar = true
    }
  }, [pagina, recargas])

  async function eliminar(evento) {
    setErrorBorrar('')
    try {
      await eliminarEvento(evento.id)
      // Si era el único de una página que no es la primera, se va a la anterior
      if (eventos.length === 1 && pagina > 1) setPagina(pagina - 1)
      else setRecargas((n) => n + 1)
    } catch (e) {
      setErrorBorrar(e.message)
    }
  }

  return (
    <main className="contenido">
      <h1>Eventos</h1>
      {errorBorrar && (
        <p className="error" role="alert">
          {errorBorrar}
        </p>
      )}

      {cargando ? (
        <p className="estado" data-testid="cargando">
          Cargando eventos…
        </p>
      ) : error ? (
        <div className="estado">
          <p className="error">{error}</p>
          <button type="button" onClick={() => setRecargas((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      ) : total === 0 ? (
        <p className="estado">Todavía no hay eventos publicados</p>
      ) : (
        <>
          <ul className="lista">
            {eventos.map((evento) => (
              <TarjetaEvento key={evento.id} evento={evento} onEliminar={eliminar} />
            ))}
          </ul>
          <nav className="paginacion" aria-label="Paginación de eventos">
            <button type="button" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
              Anterior
            </button>
            <span data-testid="info-paginacion">
              Página {pagina} de {totalPaginas} · {total} {total === 1 ? 'evento' : 'eventos'}
            </span>
            <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)}>
              Siguiente
            </button>
          </nav>
        </>
      )}
    </main>
  )
}
