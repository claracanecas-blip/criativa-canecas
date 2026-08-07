/**
 * Produtos por coleção. A chave é o `slug` definido em data/colecoes.js.
 * Coleções ausentes desta lista aparecem no site com o aviso "em breve".
 */
const PRECO_PADRAO = 39.9

export const produtos = {
  series: [
    { id: 'arrow-1',        nome: 'Arrow',        imagem: './img/arrow-1.jpg' },
    { id: 'arrow-2',        nome: 'Arrow',        imagem: './img/arrow-2.jpg' },
    { id: 'arrow-3',        nome: 'Arrow',        imagem: './img/arrow-3.jpg' },
    { id: 'arrow-4',        nome: 'Arrow',        imagem: './img/arrow-4.jpg' },
    { id: 'blacklist-1',    nome: 'Blacklist',    imagem: './img/blacklist-1.jpg' },
    { id: 'blacklist-2',    nome: 'Blacklist',    imagem: './img/blacklist-2.jpg' },
    { id: 'blacklist-3',    nome: 'Blacklist',    imagem: './img/blacklist-3.jpg' },
    { id: 'black-mirror-1', nome: 'Black Mirror', imagem: './img/black-mirror-1.jpg' },
    { id: 'black-mirror-2', nome: 'Black Mirror', imagem: './img/black-mirror-2.jpg' },
    { id: 'black-mirror-3', nome: 'Black Mirror', imagem: './img/black-mirror-3.jpg' },
    { id: 'black-mirror-4', nome: 'Black Mirror', imagem: './img/black-mirror-4.jpg' },
    { id: 'breaking-bad-1', nome: 'Breaking Bad', imagem: './img/breaking-bad-1.jpg' },
    { id: 'breaking-bad-2', nome: 'Breaking Bad', imagem: './img/breaking-bad-2.jpg' },
    { id: 'breaking-bad-3', nome: 'Breaking Bad', imagem: './img/breaking-bad-3.jpg' },
    { id: 'breaking-bad-4', nome: 'Breaking Bad', imagem: './img/breaking-bad-4.jpg' },
    { id: 'breaking-bad-5', nome: 'Breaking Bad', imagem: './img/breaking-bad-5.jpg' },
    { id: 'breaking-bad-6', nome: 'Breaking Bad', imagem: './img/breaking-bad-6.jpg' },
    { id: 'breaking-bad-7', nome: 'Breaking Bad', imagem: './img/breaking-bad-7.jpg' },
    { id: 'chaves-1',       nome: 'Chaves',       imagem: './img/chaves-1.jpg' },
  ],
}

/** Produtos de uma coleção, já com preço e slug preenchidos. */
export function produtosDaColecao(slug) {
  return (produtos[slug] ?? []).map((p) => ({
    ...p,
    colecao: slug,
    preco: p.preco ?? PRECO_PADRAO,
  }))
}

/** Todos os produtos do catálogo, achatados. */
export function todosProdutos() {
  return Object.keys(produtos).flatMap(produtosDaColecao)
}

/** Busca simples por nome do produto ou da coleção. */
export function buscarProdutos(termo) {
  const q = termo.trim().toLowerCase()
  if (!q) return []
  return todosProdutos().filter(
    (p) => p.nome.toLowerCase().includes(q) || p.colecao.includes(q),
  )
}

export function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
