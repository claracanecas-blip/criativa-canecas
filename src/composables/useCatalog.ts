import { computed, readonly, shallowRef } from 'vue'
import {
  configuredCatalogRepository,
  typescriptCatalogRepository,
  type CatalogRepository,
} from '@/repositories/catalogRepository'
import type { CatalogSnapshot, Product } from '@/types/catalog'
import { reportClientError, routeGroup } from '@/services/analytics'
import { normalizeSearchText } from '@/utils/search'

export type CatalogState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error'
export type CatalogSource = 'supabase' | 'typescript' | null

export interface CatalogLoadResult {
  snapshot: CatalogSnapshot
  state: Exclude<CatalogState, 'idle' | 'loading'>
  source: CatalogSource
  message: string | null
}

const emptyCatalog: CatalogSnapshot = { colecoes: [], produtos: [] }
const snapshot = shallowRef<CatalogSnapshot>(emptyCatalog)
const state = shallowRef<CatalogState>('idle')
const source = shallowRef<CatalogSource>(null)
const message = shallowRef<string | null>(null)
let pendingLoad: Promise<void> | null = null

const collectionGroups: Record<string, string[]> = {
  personalizada: ['personalizada', 'com-fotos'],
  divertidas: ['divertidas', 'frases', 'flork'],
  geek: ['geek', 'desenhos', 'herois'],
  profissoes: ['profissoes', 'flork-profissoes'],
  futebol: ['futebol', 'esportes'],
}

export async function loadCatalogWithFallback(
  primary: CatalogRepository,
  fallback: CatalogRepository,
): Promise<CatalogLoadResult> {
  try {
    return { snapshot: await primary.load(), state: 'ready', source: 'supabase', message: null }
  } catch (primaryError) {
    const primaryMessage = primaryError instanceof Error ? primaryError.message : 'falha desconhecida'
    try {
      return {
        snapshot: await fallback.load(),
        state: 'fallback',
        source: 'typescript',
        message: `O catálogo online está temporariamente indisponível. Exibindo a cópia local. (${primaryMessage})`,
      }
    } catch {
      return {
        snapshot: emptyCatalog,
        state: 'error',
        source: null,
        message: 'Não foi possível carregar o catálogo. Tente novamente em instantes.',
      }
    }
  }
}

async function refresh(): Promise<void> {
  if (pendingLoad) return pendingLoad

  state.value = 'loading'
  message.value = null
  pendingLoad = (async () => {
    const configured = configuredCatalogRepository()
    const forceTypescript = import.meta.env.VITE_CATALOG_SOURCE === 'typescript'
    const result = forceTypescript
      ? { snapshot: await typescriptCatalogRepository.load(), state: 'ready' as const, source: 'typescript' as const, message: null }
      : await loadCatalogWithFallback(configured, typescriptCatalogRepository)

    if (!forceTypescript && result.state !== 'ready') {
      reportClientError('catalog_load', routeGroup(window.location.pathname.split('/')[1]))
    }

    snapshot.value = result.snapshot
    state.value = result.state
    source.value = result.source
    message.value = result.message
  })().finally(() => { pendingLoad = null })

  return pendingLoad
}

function ensureLoaded(): void {
  if (state.value === 'idle') void refresh()
}

export function useCatalog() {
  ensureLoaded()

  const colecoes = computed(() => snapshot.value.colecoes.filter((collection) => collection.listada !== false))
  const todasColecoes = computed(() => snapshot.value.colecoes)
  const produtos = computed(() => snapshot.value.produtos)

  function buscarColecao(slug: string) {
    return snapshot.value.colecoes.find((collection) => collection.slug === slug)
  }

  function buscarProduto(slug: string) {
    return snapshot.value.produtos.find((product) => product.slug === slug)
  }

  function produtosDaColecao(slug: string): Product[] {
    const groups = new Set(collectionGroups[slug] ?? [slug])
    return snapshot.value.produtos.filter((product) =>
      (product.colecoes ?? [product.colecao]).some((collection) => groups.has(collection)),
    )
  }

  function buscarProdutos(term: string): Product[] {
    const query = normalizeSearchText(term)
    if (!query) return []
    return snapshot.value.produtos.filter((product) => {
      const collectionNames = (product.colecoes ?? [product.colecao])
        .map((slug) => buscarColecao(slug)?.nome ?? slug)
        .join(' ')
      return normalizeSearchText([
        product.nome,
        product.tema ?? '',
        product.sku,
        product.slug,
        collectionNames,
      ].join(' ')).includes(query)
    })
  }

  return {
    state: readonly(state),
    source: readonly(source),
    message: readonly(message),
    colecoes,
    todasColecoes,
    produtos,
    buscarColecao,
    buscarProduto,
    produtosDaColecao,
    buscarProdutos,
    refresh,
  }
}
