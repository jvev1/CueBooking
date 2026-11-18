import { describe, it, expect } from 'vitest'
import { validarLogin } from '@/services/validacion.js'

describe('validarLogin', () => {
  it('con email y contraseña vacíos da error en los dos campos', () => {
    const errores = validarLogin({ email: '', password: '' })
    expect(errores.email).toBe('El email es obligatorio')
    expect(errores.password).toBe('La contraseña es obligatoria')
  })

  it('con el email mal escrito da error en el email', () => {
    const errores = validarLogin({ email: 'no-es-email', password: 'secreta123' })
    expect(errores.email).toBe('El email no tiene un formato válido')
    expect(errores.password).toBeUndefined()
  })

  it('con la contraseña "123" da error en la contraseña', () => {
    const errores = validarLogin({ email: 'dj@gmail.com', password: '123' })
    expect(errores.password).toBe('La contraseña debe tener al menos 6 caracteres')
    expect(errores.email).toBeUndefined()
  })

  it('con datos correctos no da errores', () => {
    expect(validarLogin({ email: 'dj@gmail.com', password: 'secreta123' })).toEqual({})
  })
})
