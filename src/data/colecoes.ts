import type { Collection, MenuItem } from '@/types/catalog'

/** Categorias principais exibidas na vitrine e no menu. */
export const colecoes: Collection[] = [
  { slug: 'personalizada', nome: 'Personalizadas', icone: 'Camera', to: '/personalizada' },
  { slug: 'divertidas', nome: 'Divertidas', icone: 'Smile' },
  { slug: 'animes', nome: 'Animes', icone: 'Sparkles' },
  { slug: 'casais', nome: 'Casais', icone: 'Heart' },
  { slug: 'profissoes', nome: 'Profissões', icone: 'BriefcaseBusiness' },
  { slug: 'futebol', nome: 'Futebol & Esportes', icone: 'Dumbbell' },
  { slug: 'religiao', nome: 'Religião', icone: 'Church' },
  { slug: 'pets', nome: 'Pets', icone: 'Dog' },
  { slug: 'games', nome: 'Games', icone: 'Gamepad2' },
  { slug: 'aniversario', nome: 'Aniversário', icone: 'Cake' },
  { slug: 'amizade', nome: 'Amizade', icone: 'Handshake' },
  { slug: 'geek', nome: 'Geek & Nerd', icone: 'Tv' },
  { slug: 'series', nome: 'Séries', icone: 'Clapperboard' },
  { slug: 'cafe', nome: 'Café', icone: 'Coffee' },
  { slug: 'unicornio', nome: 'Unicórnios', icone: 'Sparkles' },
]

// Permite abrir favoritos e links antigos sem exibi-los novamente na vitrine.
export const colecoesLegadas: Collection[] = [
  { slug: 'desenhos', nome: 'Desenhos', icone: 'Palette' },
  { slug: 'herois', nome: 'Heróis', icone: 'Sparkles' },
]

export const todasColecoes: Collection[] = [...colecoes, ...colecoesLegadas]

export function buscarColecao(slug: string): Collection | undefined {
  return todasColecoes.find((colecao) => colecao.slug === slug)
}

/** Atalhos exibidos na home, em "Categorias em destaque". */
export const destaques: string[] = [
  'personalizada', 'divertidas', 'animes', 'casais', 'games', 'pets',
]

/** Colunas da esquerda do mega menu. */
export const menuLateral: MenuItem[] = [
  { nome: 'Coleção', to: '/colecoes', seta: true },
  { nome: 'Caneca Personalizada', to: '/personalizada', seta: true },
  { nome: 'Canecas com Foto', to: '/com-fotos' },
  { nome: 'Presentes', to: '/presentes', seta: true },
  { nome: 'Personalize do seu Jeito', to: '/personalizada', seta: true },
  { nome: 'DIA DOS PAIS', to: '/dia-dos-pais' },
]

/** Links do menu principal (barra horizontal). */
export const menuPrincipal: MenuItem[] = [
  { nome: 'Coleção', to: '/colecoes', seta: true },
  { nome: 'Caneca Mágica', to: '/personalizada' },
  { nome: 'Canecas com Foto', to: '/com-fotos' },
  { nome: 'Presentes', to: '/presentes', seta: true },
  { nome: 'Personalize do seu jeito', to: '/personalizada', seta: true },
  { nome: 'DIA DOS PAIS', to: '/dia-dos-pais', destaque: true },
]
