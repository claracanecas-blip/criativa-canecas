# Criativa Canecas

Loja de canecas personalizadas — Vue 3 + Vite + Vue Router.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera a pasta dist/
npm run preview  # serve o build gerado
```

## Estrutura

```
public/img/            imagens (produtos e logo)
index.html             HTML de entrada do Vite
src/
├── main.js            cria a app e monta em #app
├── App.vue            layout: header + <RouterView> + footer
├── assets/styles.css  variáveis de cor e estilos globais
├── router/index.js    todas as rotas
├── data/
│   ├── site.js        nome, logo, WhatsApp
│   ├── colecoes.js    catálogo de coleções e itens de menu
│   └── produtos.js    produtos por coleção + busca
├── components/
│   ├── TheHeader.vue      barra de avisos, busca e menu
│   ├── MegaMenu.vue       dropdown "Todas as categorias"
│   ├── TheFooter.vue
│   ├── BotaoWhatsapp.vue  botão flutuante
│   ├── ProdutoCard.vue    card de produto
│   └── EstadoVazio.vue    aviso de "coleção em breve"
└── views/                 uma view por página
    ├── HomeView.vue           /
    ├── ColecoesView.vue       /colecoes
    ├── ColecaoView.vue        /colecao/:slug   (serve todas as coleções)
    ├── PersonalizadaView.vue  /personalizada
    ├── ComFotosView.vue       /com-fotos
    ├── PresentesView.vue      /presentes
    ├── DiaDosPaisView.vue     /dia-dos-pais
    ├── BuscaView.vue          /busca?q=...
    └── NaoEncontradoView.vue  qualquer outra rota
```

As rotas usam **hash history** (`/#/colecao/series`), então o site funciona no
GitHub Pages sem precisar de regra de redirecionamento no servidor.

## Como adicionar produtos

1. Coloque as imagens em `public/img/` (nomes em minúsculas, sem espaços).
2. Em `src/data/produtos.js`, adicione a chave da coleção:

```js
export const produtos = {
  series: [ /* ... */ ],
  animes: [
    { id: 'naruto-1', nome: 'Naruto', imagem: './img/naruto-1.jpg' },
    { id: 'one-piece-1', nome: 'One Piece', imagem: './img/one-piece-1.jpg', preco: 44.9 },
  ],
}
```

O preço é `R$ 39,90` quando `preco` não é informado.

## Como adicionar uma coleção nova

Basta acrescentar um item em `src/data/colecoes.js`:

```js
{ slug: 'natal', nome: 'Natal', icone: '🎄' }
```

Ela já aparece no mega menu, na página `/colecoes` e ganha a rota
`/colecao/natal` — nenhuma view precisa ser criada. Coleções sem produtos
cadastrados exibem o aviso "em breve" com botão para o WhatsApp.

## Publicando

O conteúdo publicado é a pasta `dist/` gerada por `npm run build` — não o
código-fonte. O workflow em `.github/workflows/deploy.yml` faz isso
automaticamente a cada push na `main`; para ativá-lo, vá em
**Settings › Pages › Build and deployment › Source** e escolha **GitHub Actions**.
