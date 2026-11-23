import { useSesion } from './SesionContext.jsx'
import Cabecera from './components/Cabecera.jsx'
import ListadoEventos from './components/ListadoEventos.jsx'

export default function App() {
  const { comprobando } = useSesion()

  // Hasta saber si hay una sesión guardada no se muestra nada (en Vue, main.js espera a cargarSesion)
  if (comprobando) return null

  return (
    <>
      <Cabecera />
      <ListadoEventos />
    </>
  )
}
