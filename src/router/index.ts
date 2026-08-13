import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/',              name: 'home',          component: HomeView,                                       meta: { titulo: 'Canecas Personalizadas' } },
  { path: '/colecoes',      name: 'colecoes',      component: () => import('@/views/ColecoesView.vue'),       meta: { titulo: 'Todas as coleções' } },
  { path: '/colecao/:slug', name: 'colecao',       component: () => import('@/views/ColecaoView.vue'),        props: true },
  { path: '/personalizada', name: 'personalizada', component: () => import('@/views/PersonalizadaView.vue'),  meta: { titulo: 'Caneca Personalizada' } },
  { path: '/com-fotos',     name: 'com-fotos',     component: () => import('@/views/ComFotosView.vue'),       meta: { titulo: 'Canecas com Foto' } },
  { path: '/presentes',     name: 'presentes',     component: () => import('@/views/PresentesView.vue'),      meta: { titulo: 'Presentes' } },
  { path: '/dia-dos-pais',  name: 'dia-dos-pais',  component: () => import('@/views/DiaDosPaisView.vue'),     meta: { titulo: 'Dia dos Pais' } },
  { path: '/busca',         name: 'busca',         component: () => import('@/views/BuscaView.vue'),          meta: { titulo: 'Busca' } },
  { path: '/:pathMatch(.*)*', name: 'nao-encontrado', component: () => import('@/views/NaoEncontradoView.vue'), meta: { titulo: 'Página não encontrada' } },
]

const router = createRouter({
  // URLs limpas; a Vercel redireciona rotas internas para o index da SPA.
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, savedPosition) => savedPosition ?? { top: 0 },
})

router.afterEach((to) => {
  const titulo = typeof to.meta.titulo === 'string' ? to.meta.titulo : undefined
  document.title = titulo ? `${titulo} | Criativa Canecas` : 'Criativa Canecas'
})

export default router
