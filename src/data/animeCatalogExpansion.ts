import type { ProductInput } from '@/types/catalog'

const temasSelecionados = [
  ...Array<string>(5).fill('Spy x Family'),
  ...Array<string>(5).fill('Lycoris Recoil'),
  ...Array<string>(5).fill('Chainsaw Man'),
  ...Array<string>(5).fill('Cavaleiros do Zodíaco'),
  ...Array<string>(5).fill('Dragon Ball'),
  'Hunter x Hunter',
  'Fairy Tail',
  'Berserk',
  'Black Rock Shooter',
  'No Game No Life',
  ...Array<string>(5).fill('Tokyo Ghoul'),
  ...Array<string>(5).fill('Nanatsu no Taizai'),
  ...Array<string>(5).fill('Demon Slayer'),
  ...Array<string>(5).fill('Attack on Titan'),
  ...Array<string>(5).fill('Naruto'),
  ...Array<string>(5).fill('Yu-Gi-Oh!'),
  ...Array<string>(5).fill('My Hero Academia'),
  ...Array<string>(5).fill('One Piece'),
  ...Array<string>(5).fill('Death Note'),
  ...Array<string>(5).fill('Sword Art Online'),
  'One Punch Man',
  'One Punch Man',
  'Hunter x Hunter',
  'Fullmetal Alchemist',
  'Bleach',
  'Sailor Moon',
  'Akira',
  'Soul Eater',
  'Doraemon',
  'Date A Live',
  'Haikyuu!!',
  'InuYasha',
  'Yu Yu Hakusho',
  'Blue Exorcist',
  'Your Name',
  'My Neighbor Totoro',
  'Overlord',
  'Date A Live',
  'My Neighbor Totoro',
  'Studio Ghibli',
]

const ocorrencias = new Map<string, number>()

export const novosProdutosAnimes: ProductInput[] = temasSelecionados.map((tema, indice) => {
  const numero = indice + 1
  const codigo = String(numero).padStart(3, '0')
  const variacao = (ocorrencias.get(tema) ?? 0) + 1
  ocorrencias.set(tema, variacao)

  return {
    id: `animes-${codigo}`,
    nome: `${tema} ${String(variacao).padStart(2, '0')}`,
    tema,
    preco: 39.9,
    imagem: `./img/animes-${codigo}.png`,
  }
})
