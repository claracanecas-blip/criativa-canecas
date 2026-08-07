export const site = {
  nome: 'Criativa Canecas',
  logo: './img/logo.png',
  whatsapp: '5548991992341',
  aviso: '💗 Personalizados com carinho • Escolha sua coleção e envie seu pedido pelo WhatsApp',
}

/** Monta um link do WhatsApp já com a mensagem codificada. */
export function linkWhatsapp(mensagem = 'Olá! Vim pelo site da Criativa Canecas.') {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`
}
