import { createRouter, createWebHistory } from 'vue-router'
import { useSesionStore } from '@/stores/sesion.js'
import { useEventosStore } from '@/stores/eventos.js'
import InicioView from '@/views/InicioView.vue'
import LoginView from '@/views/LoginView.vue'
import EventosView from '@/views/EventosView.vue'
import DetalleEventoView from '@/views/DetalleEventoView.vue'
import NuevoEventoView from '@/views/NuevoEventoView.vue'
import EditarEventoView from '@/views/EditarEventoView.vue'

export const routes = [
  { path: '/', name: 'inicio', component: InicioView },
  // Pública: los eventos se pueden ver sin sesión. La página va en la query (?pagina=2)
  { path: '/eventos', name: 'eventos', component: EventosView },
  {
    // Va antes que /eventos/:id para que "nuevo" no se tome como un id
    path: '/eventos/nuevo',
    name: 'nuevo-evento',
    component: NuevoEventoView,
    // Solo los organizadores pueden crear eventos (lo vuelve a comprobar RLS en el backend)
    beforeEnter: () => {
      const sesion = useSesionStore()
      if (!sesion.haySesion) return { name: 'login' }
      if (!sesion.esOrganizador) return { name: 'eventos' }
    }
  },
  { path: '/eventos/:id', name: 'detalle-evento', component: DetalleEventoView },
  {
    path: '/eventos/:id/editar',
    name: 'editar-evento',
    component: EditarEventoView,
    // Solo el organizador del evento puede editarlo: se carga el evento para saber de quién es
    beforeEnter: async (to) => {
      const sesion = useSesionStore()
      if (!sesion.haySesion) return { name: 'login' }
      const eventos = useEventosStore()
      await eventos.cargarEvento(to.params.id)
      if (eventos.evento?.organizador_id !== sesion.usuario.id) {
        return { name: 'detalle-evento', params: { id: to.params.id } }
      }
    }
  },
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
