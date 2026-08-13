export const site = {
  nome: 'Criativa Canecas',
  logo: '/img/logo.webp',
  whatsapp: '5548991992341',
  aviso: 'Personalizados com carinho • Escolha sua coleção e envie seu pedido pelo WhatsApp',
} as const

/** Monta um link do WhatsApp já com a mensagem codificada. */
export function linkWhatsapp(mensagem = 'Olá! Vim pelo site da Criativa Canecas.'): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`
}
