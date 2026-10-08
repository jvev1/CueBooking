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
  if (max !== undefined && valor.length > max) throw new ErrorValidacion(`${campo} no puede superar ${max} caracteres`)
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

export const GENEROS = ['techno', 'house', 'reggaeton', 'pop', 'rock', 'comercial', 'otro']
export const ESTADOS_EVENTO = ['abierto', 'cerrado', 'completado']

function textoObligatorio(valor, mensaje) {
  if (typeof valor !== 'string' || valor.trim().length === 0) throw new ErrorValidacion(mensaje)
}

function validarFechaEvento(fecha) {
  const valor = new Date(fecha)
  if (fecha === undefined || fecha === null || Number.isNaN(valor.getTime())) {
    throw new ErrorValidacion('La fecha no es válida')
  }
  if (valor <= new Date()) throw new ErrorValidacion('La fecha del evento debe ser futura')
}

function validarCamposEvento(datos) {
  if ('titulo' in datos) textoObligatorio(datos.titulo, 'El título es obligatorio')
  if ('fecha' in datos) validarFechaEvento(datos.fecha)
  if ('ciudad' in datos) textoObligatorio(datos.ciudad, 'La ciudad es obligatoria')
  textoOpcional(datos.descripcion, 'La descripción')
  textoOpcional(datos.lugar, 'El lugar')
  if (datos.genero !== undefined && datos.genero !== null && !GENEROS.includes(datos.genero)) {
    throw new ErrorValidacion(`El género debe ser uno de: ${GENEROS.join(', ')}`)
  }
  if (datos.presupuesto !== undefined && datos.presupuesto !== null) {
    if (typeof datos.presupuesto !== 'number' || Number.isNaN(datos.presupuesto)) {
      throw new ErrorValidacion('El presupuesto debe ser un número')
    }
    if (datos.presupuesto < 0) {
      throw new ErrorValidacion('El presupuesto no puede ser negativo')
    }
  }
  if ('estado' in datos && !ESTADOS_EVENTO.includes(datos.estado)) {
    throw new ErrorValidacion(`El estado debe ser uno de: ${ESTADOS_EVENTO.join(', ')}`)
  }
}

function comprobarCampos(datos, permitidos) {
  for (const campo of Object.keys(datos)) {
    if (!permitidos.includes(campo)) {
      throw new ErrorValidacion(`El campo "${campo}" no está permitido`)
    }
  }
}

// Al crear no se indica el estado (empieza en 'abierto') ni el organizador (es el usuario con sesión)
const CAMPOS_NUEVO_EVENTO = ['titulo', 'descripcion', 'fecha', 'ciudad', 'lugar', 'genero', 'presupuesto']
const CAMPOS_EDITABLES_EVENTO = [...CAMPOS_NUEVO_EVENTO, 'estado']

export function validarEvento(datos) {
  if (!datos || typeof datos !== 'object') throw new ErrorValidacion('No hay datos del evento')
  comprobarCampos(datos, CAMPOS_NUEVO_EVENTO)
  textoObligatorio(datos.titulo, 'El título es obligatorio')
  validarFechaEvento(datos.fecha)
  textoObligatorio(datos.ciudad, 'La ciudad es obligatoria')
  validarCamposEvento(datos)
}

export function validarEdicionEvento(datos) {
  if (!datos || typeof datos !== 'object' || Object.keys(datos).length === 0) {
    throw new ErrorValidacion('No hay datos que modificar')
  }
  comprobarCampos(datos, CAMPOS_EDITABLES_EVENTO)
  validarCamposEvento(datos)
}
