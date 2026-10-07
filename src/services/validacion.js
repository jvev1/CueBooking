export class ErrorValidacion extends Error {
  constructor(mensaje) {
    super(mensaje)
    this.name = 'ErrorValidacion'
  }
}

export const ROLES = ['organizador', 'dj']

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function textoOpcional(valor, campo, max) {
  if (valor === undefined || valor === null) return
  if (typeof valor !== 'string') throw new ErrorValidacion(`${campo} debe ser un texto`)
  if (valor.length > max) throw new ErrorValidacion(`${campo} no puede superar ${max} caracteres`)
}

function validarNombre(nombre) {
  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 80) {
    throw new ErrorValidacion('El nombre debe tener entre 2 y 80 caracteres')
  }
}

export function validarRegistro({ email, password, nombre, rol, ciudad }) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    throw new ErrorValidacion('El email no tiene un formato válido')
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new ErrorValidacion('La contraseña debe tener al menos 6 caracteres')
  }
  validarNombre(nombre)
  if (!ROLES.includes(rol)) {
    throw new ErrorValidacion(`El rol debe ser uno de: ${ROLES.join(', ')}`)
  }
  textoOpcional(ciudad, 'La ciudad', 80)
}

const CAMPOS_EDITABLES_PERFIL = ['nombre', 'ciudad', 'bio']

export function validarEdicionPerfil(datos) {
  if (!datos || typeof datos !== 'object' || Object.keys(datos).length === 0) {
    throw new ErrorValidacion('No hay datos que modificar')
  }
  for (const campo of Object.keys(datos)) {
    if (!CAMPOS_EDITABLES_PERFIL.includes(campo)) {
      throw new ErrorValidacion(`El campo "${campo}" no se puede modificar`)
    }
  }
  if ('nombre' in datos) validarNombre(datos.nombre)
  textoOpcional(datos.ciudad, 'La ciudad', 80)
  textoOpcional(datos.bio, 'La bio', 1000)
}
