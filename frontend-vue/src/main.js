import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import { useSesionStore } from './stores/sesion.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { theme: { preset: Aura } })
// Para los diálogos de confirmación (ConfirmDialog), por ejemplo al eliminar un evento
app.use(ConfirmationService)

// Se recupera la sesión antes de montar la aplicación para que, al recargar con la
// sesión iniciada, no se vea un momento la cabecera de "sin sesión".
try {
  await useSesionStore().cargarSesion()
} catch (error) {
  console.error('No se ha podido recuperar la sesión:', error)
}

app.mount('#app')
