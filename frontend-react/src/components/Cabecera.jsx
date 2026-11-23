import { useSesion } from '../SesionContext.jsx'
import Login from './Login.jsx'

/** Con sesión: nombre, rol y "Cerrar sesión". Sin sesión: el formulario de login. */
export default function Cabecera() {
  const { haySesion, perfil, rolTexto, logout } = useSesion()

  return (
    <header className="cabecera">
      <strong className="marca">CueBooking · React</strong>
      {haySesion ? (
        <div className="usuario">
          <span>{perfil?.nombre}</span>
          <span className="etiqueta">{rolTexto}</span>
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <Login />
      )}
    </header>
  )
}
