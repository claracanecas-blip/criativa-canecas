import { onBeforeUnmount, watch, type Ref } from 'vue'

export interface PageMeta {
  title: string
  description: string
  canonical: string
  image?: string
  type?: 'website' | 'product'
  robots?: string
  jsonLd?: unknown[]
}

const marker = 'data-criativa-dynamic-meta'

function removeDynamicMeta() {
  document.head.querySelectorAll(`[${marker}]`).forEach((element) => element.remove())
}

function appendMeta(attribute: 'name' | 'property', key: string, content: string) {
  const element = document.createElement('meta')
  element.setAttribute(marker, '')
  element.setAttribute(attribute, key)
  element.content = content
  document.head.append(element)
}

export function applyPageMeta(meta: PageMeta): void {
  removeDynamicMeta()
  document.title = meta.title
  appendMeta('name', 'description', meta.description)
  appendMeta('property', 'og:title', meta.title)
  appendMeta('property', 'og:description', meta.description)
  appendMeta('property', 'og:url', meta.canonical)
  appendMeta('property', 'og:type', meta.type ?? 'website')
  appendMeta('property', 'og:site_name', 'Criativa Canecas')
  appendMeta('name', 'twitter:card', 'summary_large_image')
  if (meta.robots) appendMeta('name', 'robots', meta.robots)
  if (meta.image) {
    appendMeta('property', 'og:image', meta.image)
    appendMeta('name', 'twitter:image', meta.image)
  }

  const canonical = document.createElement('link')
  canonical.setAttribute(marker, '')
  canonical.rel = 'canonical'
  canonical.href = meta.canonical
  document.head.append(canonical)

  for (const value of meta.jsonLd ?? []) {
    const script = document.createElement('script')
    script.setAttribute(marker, '')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(value).replace(/</g, '\\u003c')
    document.head.append(script)
  }
}

export function usePageMeta(meta: Ref<PageMeta | null>): void {
  watch(meta, (value) => {
    if (value) applyPageMeta(value)
  }, { immediate: true })
  onBeforeUnmount(() => {
    const canonical = document.head.querySelector<HTMLLinkElement>(`link[${marker}][rel="canonical"]`)
    if (!meta.value || canonical?.href === meta.value.canonical) removeDynamicMeta()
  })
}
