import { createRouter, createWebHistory } from 'vue-router'
import { useSesionStore } from '@/stores/sesion.js'
import InicioView from '@/views/InicioView.vue'
import LoginView from '@/views/LoginView.vue'
import EventosView from '@/views/EventosView.vue'

export const routes = [
  { path: '/', name: 'inicio', component: InicioView },
  // Pública: los eventos se pueden ver sin sesión. La página va en la query (?pagina=2)
  { path: '/eventos', name: 'eventos', component: EventosView },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    // Con la sesión ya iniciada no tiene sentido mostrar el login
    beforeEnter: () => {
      if (useSesionStore().haySesion) return { name: 'inicio' }
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
