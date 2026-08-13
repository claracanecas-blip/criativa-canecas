import { getSupabaseClient } from '@/services/supabase'
import { officialSiteHostname } from '@/data/site'

export type RouteGroup =
  | 'home'
  | 'collections'
  | 'collection'
  | 'search'
  | 'product'
  | 'content'
  | 'admin'
  | 'not_found'
  | 'other'

export type ProductViewSource = 'direct' | 'home' | 'collection' | 'search' | 'related' | 'external' | 'other'
export type CollectionSource = 'direct' | 'home' | 'collections' | 'search' | 'menu' | 'product' | 'external' | 'other'
export type WhatsappSource = 'header_help' | 'header_order' | 'floating' | 'footer' | 'product_card' | 'product_page' | 'empty_state' | 'personalized' | 'gifts' | 'campaign'
export type ClientErrorCode = 'vue_render' | 'unhandled_error' | 'unhandled_rejection' | 'catalog_load' | 'analytics_delivery'

interface AnalyticsRuntime {
  production: boolean
  hostname: string
}

function browserRuntime(): AnalyticsRuntime {
  return {
    production: Boolean(import.meta.env?.PROD),
    hostname: typeof window === 'undefined' ? '' : window.location.hostname,
  }
}

export function analyticsEnabled(runtime: AnalyticsRuntime = browserRuntime(), productionHostname = officialSiteHostname()) {
  return runtime.production && runtime.hostname === productionHostname
}

export function routeGroup(routeName: unknown): RouteGroup {
  const name = String(routeName ?? '')
  if (!name || name === 'home') return 'home'
  if (name === 'colecoes') return 'collections'
  if (name === 'colecao') return 'collection'
  if (name === 'busca') return 'search'
  if (name === 'produto') return 'product'
  if (name.startsWith('admin')) return 'admin'
  if (name === 'nao-encontrado') return 'not_found'
  if (['personalizada', 'com-fotos', 'presentes', 'dia-dos-pais'].includes(name)) return 'content'
  return 'other'
}

export function searchLengthBucket(length: number) {
  if (length <= 1) return '1' as const
  if (length <= 3) return '2-3' as const
  if (length <= 10) return '4-10' as const
  return '11+' as const
}

export function resultCountBucket(count: number) {
  if (count <= 0) return '0' as const
  if (count === 1) return '1' as const
  if (count <= 5) return '2-5' as const
  if (count <= 20) return '6-20' as const
  return '21+' as const
}

async function deliver(eventName: string, dimension1: string, dimension2: string) {
  if (!analyticsEnabled()) return

  const { error } = await getSupabaseClient().rpc('record_catalog_event', {
    p_event_name: eventName,
    p_dimension_1: dimension1,
    p_dimension_2: dimension2,
  })
  if (error) console.warn('Falha ao entregar métrica agregada', { eventName, code: error.code })
}

function safelyDeliver(eventName: string, dimension1: string, dimension2: string) {
  void deliver(eventName, dimension1, dimension2).catch(() => {
    console.warn('Falha inesperada ao entregar métrica agregada', { eventName })
  })
}

export function trackProductView(slug: string, source: ProductViewSource) {
  safelyDeliver('product_view', slug, source)
}

export function trackSearch(queryLength: number, resultCount: number) {
  if (queryLength <= 0) return
  safelyDeliver('search', searchLengthBucket(queryLength), resultCountBucket(resultCount))
}

export function trackCollectionSelect(slug: string, source: CollectionSource) {
  safelyDeliver('collection_select', slug, source)
}

export function trackWhatsappClick(source: WhatsappSource, productSlug = 'general') {
  safelyDeliver('whatsapp_click', productSlug, source)
}

export function reportClientError(code: ClientErrorCode, group: RouteGroup) {
  safelyDeliver('client_error', code, group)
}

export function productSource(fromRouteName: unknown): ProductViewSource {
  if (!fromRouteName) return 'direct'
  const group = routeGroup(fromRouteName)
  if (group === 'product') return 'related'
  if (group === 'home' || group === 'collection' || group === 'search') return group
  return 'other'
}

export function collectionSource(fromRouteName: unknown): CollectionSource {
  if (!fromRouteName) return 'direct'
  const group = routeGroup(fromRouteName)
  if (group === 'home' || group === 'collections' || group === 'search' || group === 'product') return group
  return 'other'
}
