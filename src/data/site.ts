export const site = {
  nome: 'Criativa Canecas',
  responsavel: 'Viccenze Pfitscher da Costa',
  logo: '/img/logo.webp',
  whatsapp: '5548991992341',
  telefone: '(48) 99199-2341',
  aviso: 'Personalizados com carinho • Escolha sua coleção e envie seu pedido pelo WhatsApp',
} as const

export const DEFAULT_SITE_ORIGIN = 'https://criativa-canecas.vercel.app'

export function normalizeSiteOrigin(value?: string): string {
  try {
    const url = new URL(value || DEFAULT_SITE_ORIGIN)
    const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
    if (url.protocol !== 'https:' && !localHttp) return DEFAULT_SITE_ORIGIN
    return url.origin
  } catch {
    return DEFAULT_SITE_ORIGIN
  }
}

export function officialSiteOrigin(): string {
  return normalizeSiteOrigin(import.meta.env?.VITE_SITE_URL)
}

export function officialSiteHostname(): string {
  return new URL(officialSiteOrigin()).hostname
}

export function officialSiteUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${officialSiteOrigin()}${normalizedPath}`
}

/** Monta um link do WhatsApp já com a mensagem codificada. */
export function linkWhatsapp(mensagem = 'Olá! Vim pelo site da Criativa Canecas.'): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`
}
