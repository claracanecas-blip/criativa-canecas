import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { currentAdmin } from '@/services/adminAuth'
import { applyPageMeta } from '@/composables/usePageMeta'
import {
  collectionSource,
  productSource,
  trackCollectionSelect,
  trackProductView,
} from '@/services/analytics'

const routes: RouteRecordRaw[] = [
  { path: '/',              name: 'home',          component: HomeView,                                       meta: { titulo: 'Canecas Personalizadas' } },
  { path: '/colecoes',      name: 'colecoes',      component: () => import('@/views/ColecoesView.vue'),       meta: { titulo: 'Todas as coleções' } },
  { path: '/colecao/:slug', name: 'colecao',       component: () => import('@/views/ColecaoView.vue'),        props: true },
  { path: '/personalizada', name: 'personalizada', component: () => import('@/views/PersonalizadaView.vue'),  meta: { titulo: 'Caneca Personalizada' } },
  { path: '/com-fotos',     name: 'com-fotos',     component: () => import('@/views/ComFotosView.vue'),       meta: { titulo: 'Canecas com Foto' } },
  { path: '/presentes',     name: 'presentes',     component: () => import('@/views/PresentesView.vue'),      meta: { titulo: 'Presentes' } },
  { path: '/dia-dos-pais',  name: 'dia-dos-pais',  component: () => import('@/views/DiaDosPaisView.vue'),     meta: { titulo: 'Dia dos Pais' } },
  { path: '/busca',         name: 'busca',         component: () => import('@/views/BuscaView.vue'),          meta: { titulo: 'Busca' } },
  { path: '/produto/:slug', name: 'produto',       component: () => import('@/views/ProdutoView.vue'),        props: true },
  { path: '/admin/login',   name: 'admin-login',   component: () => import('@/views/admin/AdminLoginView.vue'), meta: { titulo: 'Acesso administrativo' } },
  { path: '/admin/definir-senha', name: 'admin-password', component: () => import('@/views/admin/AdminPasswordView.vue'), meta: { titulo: 'Definir senha administrativa', requiresAdmin: true } },
  { path: '/admin',         name: 'admin',         component: () => import('@/views/admin/AdminCatalogView.vue'), meta: { titulo: 'Painel administrativo', requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', name: 'nao-encontrado', component: () => import('@/views/NaoEncontradoView.vue'), meta: { titulo: 'Página não encontrada' } },
]

const router = createRouter({
  // URLs limpas; a Vercel redireciona rotas internas para o index da SPA.
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, savedPosition) => savedPosition ?? { top: 0 },
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return true

  try {
    const admin = await currentAdmin()
    if (admin) return true
  } catch {
    // A tela de login apresenta a falha de configuração de forma controlada.
  }

  return {
    name: 'admin-login',
    query: { redirect: to.fullPath },
  }
})

router.afterEach((to, from) => {
  if (to.name === 'produto') {
    trackProductView(String(to.params.slug ?? ''), productSource(from.name))
  } else if (to.name === 'colecao') {
    trackCollectionSelect(String(to.params.slug ?? ''), collectionSource(from.name))
  }

  const titulo = typeof to.meta.titulo === 'string' ? to.meta.titulo : undefined
  document.title = titulo ? `${titulo} | Criativa Canecas` : 'Criativa Canecas'
  if (to.name === 'produto' || to.name === 'colecao') return

  const title = titulo ? `${titulo} | Criativa Canecas` : 'Criativa Canecas | Canecas Personalizadas'
  const description = to.name === 'colecoes'
    ? 'Explore todas as coleções de canecas personalizadas da Criativa Canecas.'
    : 'Canecas personalizadas, presentes criativos e coleções para todos os estilos.'
  applyPageMeta({
    title,
    description,
    canonical: `${window.location.origin}${to.path}`,
    type: 'website',
    robots: String(to.name).startsWith('admin') ? 'noindex,nofollow' : undefined,
  })
})

export default router
