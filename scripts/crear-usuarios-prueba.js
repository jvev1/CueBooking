// Crea los usuarios de prueba fijos que se usan para probar el frontend.
// Uso (desde la raíz del repositorio, con el .env configurado): node scripts/crear-usuarios-prueba.js
// Si un usuario ya existe, se comprueba que se puede iniciar sesión con él.
import { registrar, login, logout } from '../src/services/auth.js'

const PASSWORD_PRUEBA = 'prueba123'

const USUARIOS_PRUEBA = [
  { email: 'cuebooking.organizador.prueba@gmail.com', nombre: 'Organizador Prueba', rol: 'organizador', ciudad: 'Alicante' },
  { email: 'cuebooking.dj.prueba@gmail.com', nombre: 'DJ Prueba', rol: 'dj', ciudad: 'Alicante' }
]

for (const usuario of USUARIOS_PRUEBA) {
  try {
    await registrar({ ...usuario, password: PASSWORD_PRUEBA })
    console.log(`Creado: ${usuario.email} (${usuario.rol})`)
  } catch (error) {
    // Lo más habitual es que ya exista: se comprueba que el login funciona
    try {
      await login(usuario.email, PASSWORD_PRUEBA)
      console.log(`Ya existía: ${usuario.email} (${usuario.rol})`)
    } catch {
      console.error(`No se ha podido crear ${usuario.email}: ${error.message}`)
      process.exitCode = 1
    }
  }
  await logout()
}

console.log(`Contraseña de los usuarios de prueba: ${PASSWORD_PRUEBA}`)
