import { useState } from 'react'
import { useSesion } from '../SesionContext.jsx'
import { formatearFecha, nombreEstado } from '../formato.js'

/**
 * Un evento del listado. "Eliminar" solo lo ve su organizador (RLS lo vuelve a comprobar
 * en el backend). La tarjeta no borra: avisa a ListadoEventos con onEliminar.
 */
export default function TarjetaEvento({ evento, onEliminar }) {
  const { usuario } = useSesion()
  const [eliminando, setEliminando] = useState(false)
  const esSuyo = usuario !== null && evento.organizador_id === usuario.id

  async function eliminar() {
    if (!window.confirm(`¿Seguro que quieres eliminar "${evento.titulo}"? No se puede deshacer.`)) return
    setEliminando(true)
    try {
      await onEliminar(evento)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <li className="tarjeta" data-testid="evento">
      <div className="cabecera-tarjeta">
        <h2>{evento.titulo}</h2>
        <span className={`etiqueta estado-${evento.estado}`}>{nombreEstado(evento.estado)}</span>
      </div>
      <p className="datos">
        <span>{formatearFecha(evento.fecha)}</span>
        <span>{evento.ciudad}</span>
      </p>
      {esSuyo && (
        <button type="button" className="peligro" disabled={eliminando} onClick={eliminar}>
          {eliminando ? 'Eliminando…' : 'Eliminar'}
        </button>
      )}
    </li>
  )
}
