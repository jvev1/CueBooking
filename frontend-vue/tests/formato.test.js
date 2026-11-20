import { describe, it, expect } from 'vitest'
import { formatearFecha, nombreEstado } from '@/utils/formato.js'

describe('Formato', () => {
  it('formatea una fecha como dd/mm/aaaa hh:mm', () => {
    // Fecha en hora local para que el resultado no dependa de la zona horaria
    expect(formatearFecha(new Date(2027, 0, 5, 9, 7))).toBe('05/01/2027 09:07')
    expect(formatearFecha(new Date(2027, 11, 31, 23, 30).toISOString())).toBe('31/12/2027 23:30')
  })

  it('da el nombre de cada estado', () => {
    expect(nombreEstado('abierto')).toBe('Abierto')
    expect(nombreEstado('cerrado')).toBe('Cerrado')
    expect(nombreEstado('completado')).toBe('Completado')
  })
})
