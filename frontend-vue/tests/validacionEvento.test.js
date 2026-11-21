import { describe, it, expect } from 'vitest'
import { validarFormularioEvento } from '@backend/services/validacion.js'

const MANANA = new Date(Date.now() + 24 * 60 * 60 * 1000)
const AYER = new Date(Date.now() - 24 * 60 * 60 * 1000)

describe('validarFormularioEvento', () => {
  it('sin título, fecha ni ciudad da error en los tres campos', () => {
    const errores = validarFormularioEvento({ titulo: '', fecha: null, ciudad: '  ' })
    expect(errores.titulo).toBe('El título es obligatorio')
    expect(errores.fecha).toBe('La fecha es obligatoria')
    expect(errores.ciudad).toBe('La ciudad es obligatoria')
  })

  it('con una fecha pasada da error en la fecha', () => {
    const errores = validarFormularioEvento({ titulo: 'Fiesta', fecha: AYER, ciudad: 'Alicante' })
    expect(errores.fecha).toBe('La fecha del evento debe ser futura')

    // Al editar sin cambiar la fecha no se exige que sea futura
    expect(validarFormularioEvento({ titulo: 'Fiesta', fecha: AYER, ciudad: 'Alicante' }, { exigirFechaFutura: false })).toEqual({})
  })

  it('con presupuesto negativo da error en el presupuesto', () => {
    const errores = validarFormularioEvento({ titulo: 'Fiesta', fecha: MANANA, ciudad: 'Alicante', presupuesto: -10 })
    expect(errores.presupuesto).toBe('El presupuesto no puede ser negativo')
  })

  it('con datos correctos no da errores', () => {
    expect(validarFormularioEvento({ titulo: 'Fiesta', fecha: MANANA, ciudad: 'Alicante', presupuesto: 500 })).toEqual({})
    expect(validarFormularioEvento({ titulo: 'Fiesta', fecha: MANANA, ciudad: 'Alicante', presupuesto: null })).toEqual({})
  })
})
