/**
 * Catálogo de coleções.
 * Cada item vira a rota /colecao/:slug, renderizada por views/ColecaoView.vue.
 * Para publicar uma coleção nova basta acrescentar um item aqui e os produtos
 * correspondentes em data/produtos.js — nenhuma view precisa ser criada.
 */
export const colecoes = [
  { slug: 'series',           nome: 'Séries',              icone: '📺' },
  { slug: 'animes',           nome: 'Animes',              icone: '🍥' },
  { slug: 'amizade',          nome: 'Amizade',             icone: '🤝' },
  { slug: 'aniversario',      nome: 'Aniversário',         icone: '🎂' },
  { slug: 'bandas',           nome: 'Bandas',              icone: '🎸' },
  { slug: 'cafe',             nome: 'Café',                icone: '☕' },
  { slug: 'casais',           nome: 'Casais',              icone: '💞' },
  { slug: 'musica',           nome: 'Caneca com Música',   icone: '🎵' },
  { slug: 'personalizada',    nome: 'Caneca Personalizada', icone: '✨' },
  { slug: 'desenhos',         nome: 'Desenhos',            icone: '🎨' },
  { slug: 'divertidas',       nome: 'Divertidas',          icone: '😄' },
  { slug: 'esportes',         nome: 'Esportes',            icone: '🏅' },
  { slug: 'familia',          nome: 'Família',             icone: '👨‍👩‍👧' },
  { slug: 'filmes',           nome: 'Filmes',              icone: '🎬' },
  { slug: 'flork',            nome: 'Flork',               icone: '🥸' },
  { slug: 'flork-profissoes', nome: 'Flork Profissões',    icone: '🧑‍🔧' },
  { slug: 'frases',           nome: 'Frases',              icone: '💬' },
  { slug: 'futebol',          nome: 'Futebol',             icone: '⚽' },
  { slug: 'games',            nome: 'Games',               icone: '🎮' },
  { slug: 'geek',             nome: 'Geek & Nerd',         icone: '🤓' },
  { slug: 'herois',           nome: 'Heróis',              icone: '🦸' },
  { slug: 'motivacional',     nome: 'Motivacional',        icone: '🚀' },
  { slug: 'para-colorir',     nome: 'Para Colorir',        icone: '🖍' },
  { slug: 'pets',             nome: 'Pet',                 icone: '🐾' },
  { slug: 'profissoes',       nome: 'Profissão',           icone: '🧑‍⚕️' },
  { slug: 'religiao',         nome: 'Religião',            icone: '🙏' },
  { slug: 'retro',            nome: 'Retrô',               icone: '📼' },
  { slug: 'signos',           nome: 'Signos',              icone: '♈' },
  { slug: 'infantil',         nome: 'Infantil',            icone: '🧸' },
  { slug: 'unicornio',        nome: 'Unicórnio',           icone: '🦄' },
  { slug: 'lugares',          nome: 'Lugares',             icone: '🗺' },
  { slug: 'literatura',       nome: 'Literatura',          icone: '📚' },
  { slug: 'empresas',         nome: 'Empresas',            icone: '🏢' },
  { slug: 'com-fotos',        nome: 'Com Fotos',           icone: '📸' },
]

export function buscarColecao(slug) {
  return colecoes.find((c) => c.slug === slug)
}

/** Atalhos exibidos na home, em "Categorias em destaque". */
export const destaques = [
  'series', 'animes', 'games', 'herois', 'pets', 'cafe',
]

/** Colunas da esquerda do mega menu. */
export const menuLateral = [
  { nome: 'Coleção',              to: '/colecoes',      seta: true },
  { nome: 'Caneca Personalizada', to: '/personalizada', seta: true },
  { nome: 'Canecas com Foto',     to: '/com-fotos' },
  { nome: 'Presentes',            to: '/presentes',     seta: true },
  { nome: 'Personalize do seu Jeito', to: '/personalizada', seta: true },
  { nome: 'DIA DOS PAIS',         to: '/dia-dos-pais' },
]

/** Links do menu principal (barra horizontal). */
export const menuPrincipal = [
  { nome: 'Coleção ▾',                 to: '/colecoes' },
  { nome: 'Caneca Mágica',             to: '/personalizada' },
  { nome: 'Canecas com Foto',          to: '/com-fotos' },
  { nome: 'Presentes ▾',               to: '/presentes' },
  { nome: 'Personalize do seu jeito ▾', to: '/personalizada' },
  { nome: 'DIA DOS PAIS',              to: '/dia-dos-pais', destaque: true },
]
