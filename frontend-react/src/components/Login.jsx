import { useState } from 'react'
import { validarLogin } from '@backend/services/validacion.js'
import { useSesion } from '../SesionContext.jsx'

/** Formulario de login, con la misma validación que en Vue (validarLogin de la capa de servicios). */
export default function Login() {
  const { login } = useSesion()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setErrorServidor('')
    const nuevosErrores = validarLogin({ email, password })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      await login(email.trim(), password)
    } catch (error) {
      setErrorServidor(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="login" noValidate onSubmit={enviar}>
      <div className="campo">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errores.email && <small className="error">{errores.email}</small>}
      </div>
      <div className="campo">
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {errores.password && <small className="error">{errores.password}</small>}
      </div>
      <button type="submit" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Iniciar sesión'}
      </button>
      {errorServidor && (
        <p className="error" role="alert">
          {errorServidor}
        </p>
      )}
    </form>
  )
}
