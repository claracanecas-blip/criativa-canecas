import type { Product, ProductInput } from '@/types/catalog'
import { novosProdutosAnimes } from '@/data/animeCatalogExpansion'

/**
 * Produtos por coleção. A chave é o `slug` definido em data/colecoes.js.
 * Coleções ausentes desta lista aparecem no site com o aviso "em breve".
 */
const PRECO_PADRAO = 39.9

export const produtos: Record<string, ProductInput[]> = {
  animes: [
    { id: 'demon-slayer-gyuu',               nome: 'Demon Slayer 01', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-gyuu.jpg' },
    { id: 'demon-slayer-inosuke',            nome: 'Demon Slayer 02', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-inosuke.jpg' },
    { id: 'demon-slayer-kanao',              nome: 'Demon Slayer 03', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-kanao.jpg' },
    { id: 'demon-slayer-kimetsu-no-yaiba',   nome: 'Demon Slayer 04', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-kimetsu-no-yaiba.jpg' },
    { id: 'demon-slayer-kimetsu-no-yaiba-2', nome: 'Demon Slayer 05', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-kimetsu-no-yaiba-2.jpg' },
    { id: 'demon-slayer-kimetsu-no-yaiba-3', nome: 'Demon Slayer 06', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-kimetsu-no-yaiba-3.jpg' },
    { id: 'demon-slayer-kyoujurou',          nome: 'Demon Slayer 07', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-kyoujurou.jpg' },
    { id: 'demon-slayer-mitsuri',            nome: 'Demon Slayer 08', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-mitsuri.jpg' },
    { id: 'demon-slayer-muchirou',           nome: 'Demon Slayer 09', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-muchirou.jpg' },
    { id: 'demon-slayer-nezuko',             nome: 'Demon Slayer 10', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-nezuko.jpg' },
    { id: 'demon-slayer-sabito',             nome: 'Demon Slayer 11', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-sabito.jpg' },
    { id: 'demon-slayer-sanemi',             nome: 'Demon Slayer 12', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-sanemi.jpg' },
    { id: 'demon-slayer-shinobu',            nome: 'Demon Slayer 13', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-shinobu.jpg' },
    { id: 'demon-slayer-tanjirou',           nome: 'Demon Slayer 14', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-tanjirou.jpg' },
    { id: 'demon-slayer-zenitsu',            nome: 'Demon Slayer 15', tema: 'Demon Slayer', preco: 39.9, imagem: './img/demon-slayer-zenitsu.jpg' },
    { id: 'cavaleiros-do-zodiaco-hyoga',       nome: 'Cavaleiros do Zodíaco 01', tema: 'Cavaleiros do Zodíaco', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-hyoga.jpg' },
    { id: 'cavaleiros-do-zodiaco-ikki',        nome: 'Cavaleiros do Zodíaco 02', tema: 'Cavaleiros do Zodíaco', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-ikki.jpg' },
    { id: 'cavaleiros-do-zodiaco-kiki',        nome: 'Cavaleiros do Zodíaco 03', tema: 'Cavaleiros do Zodíaco', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-kiki.jpg' },
    { id: 'cavaleiros-do-zodiaco-saint-seiya', nome: 'Cavaleiros do Zodíaco 04', tema: 'Cavaleiros do Zodíaco', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-saint-seiya.jpg' },
    { id: 'cavaleiros-do-zodiaco-saori',       nome: 'Cavaleiros do Zodíaco 05', tema: 'Cavaleiros do Zodíaco', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-saori.jpg' },
    { id: 'cavaleiros-do-zodiaco-shaina',      nome: 'Cavaleiros do Zodíaco 06', tema: 'Cavaleiros do Zodíaco', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-shaina.jpg' },
    { id: 'cavaleiros-do-zodiaco-shiryu',      nome: 'Cavaleiros do Zodíaco 07', tema: 'Cavaleiros do Zodíaco', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-shiryu.jpg' },
    { id: 'cavaleiros-dourados-afrodite',      nome: 'Cavaleiros do Zodíaco Dourados 01', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-afrodite.jpg' },
    { id: 'cavaleiros-dourados-aiolia',        nome: 'Cavaleiros do Zodíaco Dourados 02', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-aiolia.jpg' },
    { id: 'cavaleiros-dourados-aiolos',        nome: 'Cavaleiros do Zodíaco Dourados 03', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-aiolos.jpg' },
    { id: 'cavaleiros-dourados-aldebaran',     nome: 'Cavaleiros do Zodíaco Dourados 04', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-aldebaran.jpg' },
    { id: 'cavaleiros-dourados-camus',         nome: 'Cavaleiros do Zodíaco Dourados 05', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-camus.jpg' },
    { id: 'cavaleiros-dourados-dohko',         nome: 'Cavaleiros do Zodíaco Dourados 06', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-dohko.jpg' },
    { id: 'cavaleiros-dourados-mascara-morte', nome: 'Cavaleiros do Zodíaco Dourados 07', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-mascara-morte.jpg' },
    { id: 'cavaleiros-dourados-milo',          nome: 'Cavaleiros do Zodíaco Dourados 08', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-milo.jpg' },
    { id: 'cavaleiros-dourados-mu',            nome: 'Cavaleiros do Zodíaco Dourados 09', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-mu.jpg' },
    { id: 'cavaleiros-dourados-saga',          nome: 'Cavaleiros do Zodíaco Dourados 10', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-saga.jpg' },
    { id: 'cavaleiros-dourados-shaka',         nome: 'Cavaleiros do Zodíaco Dourados 11', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-shaka.jpg' },
    { id: 'cavaleiros-dourados-shura',         nome: 'Cavaleiros do Zodíaco Dourados 12', tema: 'Cavaleiros do Zodíaco Dourados', preco: 39.9, imagem: './img/cavaleiros-do-zodiaco-dourados-shura.jpg' },
    { id: 'fairy-tail-35',                     nome: 'Fairy Tail 01', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-35.png' },
    { id: 'fairy-tail-36',                     nome: 'Fairy Tail 02', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-36.png' },
    { id: 'fairy-tail-37',                     nome: 'Fairy Tail 03', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-37.png' },
    { id: 'fairy-tail-38',                     nome: 'Fairy Tail 04', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-38.png' },
    { id: 'fairy-tail-39',                     nome: 'Fairy Tail 05', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-39.png' },
    { id: 'fairy-tail-40',                     nome: 'Fairy Tail 06', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-40.png' },
    { id: 'fairy-tail-41',                     nome: 'Fairy Tail 07', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-41.png' },
    { id: 'fairy-tail-42',                     nome: 'Fairy Tail 08', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-42.png' },
    { id: 'fairy-tail-43',                     nome: 'Fairy Tail 09', tema: 'Fairy Tail', preco: 39.9, imagem: './img/fairy-tail-43.png' },
    ...novosProdutosAnimes,
  ],
  aniversario: Array.from({ length: 23 }, (_, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `aniversario-${codigo}`,
      nome: `Aniversário ${codigo}`,
      tema: 'Aniversário',
      preco: 39.9,
      imagem: `./img/aniversario-${codigo}.jpg`,
    }
    }),
  pets: Array.from({ length: 50 }, (_, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `pets-${codigo}`,
      nome: `Pets ${codigo}`,
      tema: 'Pets',
      preco: 39.9,
      imagem: numero === 19 ? './img/pets-19-r2.png' : `./img/pets-${codigo}.png`,
    }
  }),
  futebol: ([
    'Flamengo', 'Flamengo', 'Flamengo', 'Flamengo', 'Flamengo',
    'Corinthians', 'Corinthians', 'Corinthians',
    'São Paulo', 'São Paulo', 'São Paulo', 'São Paulo', 'São Paulo', 'São Paulo', 'São Paulo',
    'Palmeiras', 'Palmeiras', 'Palmeiras', 'Palmeiras', 'Palmeiras', 'Palmeiras', 'Palmeiras',
    'Cruzeiro', 'Cruzeiro', 'Vasco',
    'Grêmio', 'Grêmio', 'Grêmio', 'Grêmio', 'Atlético Mineiro',
    'Santos', 'Santos', 'Santos',
    'Internacional', 'Internacional', 'Internacional',
    'Botafogo', 'Botafogo', 'Fluminense', 'Bahia', 'Sport Recife', 'Fortaleza', 'Ceará',
    'Athletico Paranaense', 'Real Madrid', 'Real Madrid', 'Barcelona', 'Barcelona', 'Chelsea', 'Chelsea',
  ] as const).map((tema, indice, equipes) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')
    const variacao = equipes.slice(0, numero).filter((equipe) => equipe === tema).length

    return {
      id: `futebol-${codigo}`,
      nome: `${tema} ${String(variacao).padStart(2, '0')}`,
      tema,
      preco: 39.9,
      imagem: `./img/futebol-${codigo}.png`,
    }
  }),
  profissoes: ([
    'Administração', 'Agronomia', 'Arquitetura', 'Artesã', 'Barbeiro',
    'Biologia', 'Biomedicina', 'Bombeiro', 'Caminhoneiro', 'Ciência da Computação',
    'Contabilidade', 'Costureira', 'Cuidadora', 'Design de Interiores', 'Design Gráfico',
    'Direito', 'Educação Física', 'Enfermagem', 'Engenharia Civil', 'Engenharia de Produção',
    'Engenharia Elétrica', 'Engenharia Mecânica', 'Esteticista', 'Farmácia', 'Fisioterapia',
    'Fotografia', 'Gastronomia', 'Comissária de Bordo', 'Logística', 'Manicure',
    'Maquiadora', 'Eletricista', 'Mecânico', 'Medicina', 'Nutrição',
    'Odontologia', 'Pedagogia', 'Polícia', 'Professor', 'Programador',
    'Psicologia', 'Publicidade', 'Química', 'Radiologia', 'Recursos Humanos',
    'Secretária', 'Segurança do Trabalho', 'Serviço Social', 'Técnico de Informática', 'Veterinária',
  ] as const).map((tema, indice) => {
    const codigo = String(indice + 1).padStart(2, '0')

    return {
      id: `profissoes-${codigo}`,
      nome: `${tema} 01`,
      tema,
      preco: 39.9,
      imagem: `./img/profissoes-${codigo}.png`,
    }
  }),
  divertidas: ([
    ['Vem Ni Mim', 'Frases'], ['Aceita um Café?', 'Café'], ['Caneca Pilhada', 'Frases'],
    ['Cuidado: Já Tem Dono', 'Humor'], ['Eu Digo Não para a Bebida', 'Bebidas'], ['Arrisco', 'Paródia'],
    ['Tommy Cachaça', 'Bebidas'], ['Malgosto', 'Bebidas'], ['Beer: Beba Sempre', 'Bebidas'],
    ['Danosse', 'Paródia'], ['Ardidas', 'Humor Adulto'], ['Game Over 01', 'Casamento'],
    ['Wi Fe', 'Relacionamento'], ['No Stress, Uma Porra', 'Humor Adulto'], ['Só Ctrl+S Salva', 'Tecnologia'],
    ['Viagra Electron', 'Humor Adulto'], ['Game Over 02', 'Casamento'], ['Enxuta', 'Humor Adulto'],
    ['Pum', 'Humor'], ['Não Intendo', 'Paródia'], ['Vivo Sem Dinheiro', 'Humor'],
    ['Hardcore', 'Paródia'], ['Azarado', 'Casamento'], ['Viagra', 'Humor Adulto'],
    ['No Stress O Caralho', 'Humor Adulto'], ['Não Toque Nessa Caneca', 'Humor'], ['Frete Grátis', 'Compras Online'],
    ['Tá com Inveja? Morra', 'Humor'], ['Bebaça Sem Limites', 'Bebidas'], ['Teu Cu', 'Humor Adulto'],
    ['Teu Cu com Lhama', 'Humor Adulto'], ['Bolsonaro 100%', 'Política'], ['O Golpe Tá Aí', 'Humor'],
    ['Que se Dane', 'Lhamas'], ['Sem Um Minuto de Paz', 'Humor Adulto'], ['Surte e Atirei o Pau na Dona Chica', 'Gatos'],
  ] as const).map(([nome, tema], indice) => {
    const codigo = String(indice + 1).padStart(2, '0')

    return {
      id: `divertidas-${codigo}`,
      nome,
      tema,
      preco: 39.9,
      imagem: `./img/divertidas-${codigo}.png`,
    }
  }),
  religiao: ([
    ['Fé Islâmica', 'Islâmica'], ['Fé Messiânica', 'Messiânica'], ['Nossa Senhora de Fátima 01', 'Católica'],
    ['Assembleia de Deus', 'Evangélica'], ['Círio de Nazaré 01', 'Católica'], ['Esperança em Deus', 'Cristã'],
    ['São Cosme e Damião', 'Católica'], ['Fé e Certeza', 'Cristã'], ['Nossa Senhora Aparecida 01', 'Católica'],
    ['Oração', 'Cristã'], ['Nossa Senhora de Fátima 02', 'Católica'], ['Vivo por Jesus', 'Cristã'],
    ['Santo Antônio', 'Católica'], ['Igreja do Evangelho Quadrangular', 'Evangélica'], ['Nossa Senhora Aparecida 02', 'Católica'],
    ['Eu Amo a Bíblia', 'Cristã'], ['Sagrada Família', 'Católica'], ['Confia no Senhor', 'Católica'],
    ['Nossa Senhora Aparecida 03', 'Católica'], ['O Senhor é Meu Pastor', 'Cristã'], ['Madre Teresa', 'Católica'],
    ['Cristo Ressuscitou', 'Cristã'], ['Nossa Senhora Aparecida 04', 'Católica'], ['Amai-vos Uns aos Outros', 'Cristã'],
    ['Nossa Senhora 01', 'Católica'], ['Fé, Amor e Esperança', 'Cristã'], ['Pastor', 'Evangélica'],
    ['Pastora', 'Evangélica'], ['Nossa Senhora e o Menino Jesus', 'Católica'], ['Leão de Judá', 'Cristã'],
    ['Jesus, Médico dos Médicos', 'Cristã'], ['Deus Nunca Falha', 'Cristã'], ['Promessa de Deus', 'Cristã'],
    ['Eu Escolho Deus', 'Cristã'], ['Deus do Meu Viver', 'Cristã'], ['Conquiste a Paz', 'Cristã'],
    ['Jesus Dá Descanso', 'Cristã'], ['Amor de Deus', 'Cristã'], ['Renovação da Fé', 'Cristã'],
    ['Palavra de Deus', 'Cristã'], ['Deus Abriu o Mar', 'Cristã'], ['Agradecer a Deus', 'Cristã'],
    ['Sem Fé é Impossível', 'Cristã'], ['Nas Mãos de Deus', 'Cristã'], ['Protegido por Jesus', 'Cristã'],
    ['Meu Alvo é Cristo', 'Cristã'], ['Fé na Cruz', 'Cristã'], ['Deus é Grande', 'Cristã'],
    ['Jesus Te Ama', 'Cristã'], ['Unidos pelo Amor do Pai', 'Cristã'],
  ] as const).map(([nome, tradicao], indice) => {
    const codigo = String(indice + 1).padStart(2, '0')

    return {
      id: `religiao-${codigo}`,
      nome,
      tema: tradicao,
      preco: 39.9,
      imagem: `./img/religiao-${codigo}.png`,
    }
  }),
  cafe: Array.from({ length: 6 }, (_, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `cafe-${codigo}`,
      nome: `Café ${codigo}`,
      tema: 'Café',
      preco: 39.9,
      imagem: `./img/cafe-final-${codigo}.jpg`,
    }
  }),
  casais: Array.from({ length: 30 }, (_, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `casais-${codigo}`,
      nome: `Casais ${codigo}`,
      tema: 'Casais',
      preco: 39.9,
      imagem: `./img/casais-novo-${codigo}.jpg`,
    }
  }),
  desenhos: [
    'A Era do Gelo', 'Peppa Pig', 'Hora de Aventura', 'Hora de Aventura', 'Doraemon',
    'Hora de Aventura', 'Tartarugas Ninja', 'Looney Tunes', 'Cartoon Network', 'Tazmania',
    'My Little Pony', 'Hello Kitty', 'Hello Kitty', 'Apenas Um Show', 'Buzz Lightyear',
    'Hora de Aventura', 'As Meninas Superpoderosas', 'PJ Masks', 'PJ Masks', 'Snoopy',
    'Monster High', 'Snoopy', 'Hello Kitty', 'Ben 10', 'Miraculous', 'Miraculous', 'Miraculous',
  ].map((tema, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `desenhos-${codigo}`,
      nome: `${tema} ${codigo}`,
      tema,
      preco: 39.9,
      imagem: `./img/desenhos-novo-${codigo}.jpg`,
    }
  }),
  unicornio: Array.from({ length: 15 }, (_, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `unicornios-${codigo}`,
      nome: `Unicórnios ${codigo}`,
      tema: 'Unicórnios',
      preco: 39.9,
      imagem: `./img/divertidas-unicornio-${codigo}.jpg`,
    }
  }),
  herois: Array.from({ length: 4 }, (_, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `herois-${codigo}`,
      nome: `Heróis ${codigo}`,
      tema: 'Heróis',
      preco: 39.9,
      imagem: `./img/herois-marvel-${codigo}.jpg`,
    }
  }),
  games: ([
    ['Fortnite', 4, 'fortnite'],
    ['GTA', 4, 'gta'],
    ['Minecraft', 4, 'minecraft'],
    ['Call of Duty', 2, 'call-of-duty'],
    ['Among Us', 4, 'among-us'],
    ['Angry Birds', 3, 'angry-birds'],
    ["Assassin's Creed", 4, 'assassins-creed'],
    ['Clash Royale', 3, 'clash-royale'],
    ['Dark Souls', 3, 'dark-souls'],
    ['FIFA', 2, 'fifa'],
    ['Super Mario', 1, 'super-mario'],
    ['The Last of Us', 3, 'the-last-of-us'],
    ['Watch Dogs', 3, 'watch-dogs'],
    ['Controle Nintendo', 3, 'controle-nintendo'],
    ['Battlefield', 4, 'battlefield'],
    ['Bloodborne', 4, 'bloodborne'],
  ] satisfies Array<[string, number, string]>).flatMap(([tema, total, slug]) => Array.from({ length: total }, (_, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `games-${slug}-${codigo}`,
      nome: `${tema} ${codigo}`,
      tema,
      preco: 39.9,
      imagem: `./img/games-${slug}-${codigo}.jpg`,
    }
  })).concat([
    {
      id: 'games-free-fire-01',
      nome: 'Free Fire 01',
      tema: 'Free Fire',
      preco: 39.9,
      imagem: './img/games-free-fire-02.jpg',
    },
    {
      id: 'games-free-fire-02',
      nome: 'Free Fire 02',
      tema: 'Free Fire',
      preco: 39.9,
      imagem: './img/games-free-fire-04.jpg',
    },
  ]),
  geek: ([
    ['It: A Coisa', 1], ['Mad Max', 2], ['Taxi Driver', 3], ['Mega Man', 4], ['Corrida Maluca', 5],
    ['Tartarugas Ninja', 6], ['He-Man', 8], ['Motoqueiro Fantasma', 9], ['It: A Coisa', 10],
    ['God of War', 11], ['John Wick', 12], ['Predador', 13], ['God of War', 15],
    ['Breaking Bad', 16], ['RoboCop', 17], ['Power Rangers', 19],
    ['Pulp Fiction', 21], ['Matrix', 22], ['Spawn', 23], ['The Witcher', 24], ['Stranger Things', 25],
    ['Marvel', 26], ['ThunderCats', 27], ['Street Fighter', 28], ['Fantasia Sombria', 30],
  ] satisfies Array<[string, number]>).map(([tema, numero], indice, temas) => {
    const codigo = String(numero).padStart(2, '0')
    const numeroDoTema = temas.slice(0, indice + 1).filter(([item]) => item === tema).length
    const codigoDoTema = String(numeroDoTema).padStart(2, '0')

    return {
      id: `geek-${codigo}`,
      nome: `${tema} ${codigoDoTema}`,
      tema,
      preco: 39.9,
      imagem: `./img/geek-mockup-${codigo}.jpg`,
    }
  }).concat([
    { id: 'geek-extra-power-rangers-02', nome: 'Power Rangers 02', tema: 'Power Rangers', preco: 39.9, imagem: './img/geek-extra-power-rangers-02.jpg' },
    { id: 'geek-extra-he-man-02', nome: 'He-Man 02', tema: 'He-Man', preco: 39.9, imagem: './img/geek-extra-he-man-02.jpg' },
    { id: 'geek-extra-mega-man-02', nome: 'Mega Man 02', tema: 'Mega Man', preco: 39.9, imagem: './img/geek-extra-mega-man-02.jpg' },
    { id: 'geek-extra-mega-man-03', nome: 'Mega Man 03', tema: 'Mega Man', preco: 39.9, imagem: './img/geek-extra-mega-man-03.jpg' },
    { id: 'geek-extra-stranger-things-02', nome: 'Stranger Things 02', tema: 'Stranger Things', preco: 39.9, imagem: './img/geek-extra-stranger-things-02.jpg' },
    { id: 'geek-extra-stranger-things-03', nome: 'Stranger Things 03', tema: 'Stranger Things', preco: 39.9, imagem: './img/geek-extra-stranger-things-03.jpg' },
    { id: 'geek-extra-stranger-things-04', nome: 'Stranger Things 04', tema: 'Stranger Things', preco: 39.9, imagem: './img/geek-extra-stranger-things-04.jpg' },
    { id: 'geek-extra-tartarugas-ninja-02', nome: 'Tartarugas Ninja 02', tema: 'Tartarugas Ninja', preco: 39.9, imagem: './img/geek-extra-tartarugas-ninja-02.jpg' },
    { id: 'geek-extra-tartarugas-ninja-03', nome: 'Tartarugas Ninja 03', tema: 'Tartarugas Ninja', preco: 39.9, imagem: './img/geek-extra-tartarugas-ninja-03.jpg' },
  ]),
  amizade: Array.from({ length: 42 }, (_, indice) => {
    const numero = indice + 1
    const codigo = String(numero).padStart(2, '0')

    return {
      id: `amizade-${codigo}`,
      nome: `Amizade ${codigo}`,
      tema: 'Amizade',
      preco: 39.9,
      imagem: `./img/amizade-nova-${codigo}.jpg`,
    }
  }),
  series: [
    { id: 'arrow-1',        nome: 'Arrow 01',        tema: 'Arrow',        imagem: './img/arrow-1.jpg' },
    { id: 'arrow-2',        nome: 'Arrow 02',        tema: 'Arrow',        imagem: './img/arrow-2.jpg' },
    { id: 'arrow-3',        nome: 'Arrow 03',        tema: 'Arrow',        imagem: './img/arrow-3.jpg' },
    { id: 'arrow-4',        nome: 'Arrow 04',        tema: 'Arrow',        imagem: './img/arrow-4.jpg' },
    { id: 'blacklist-1',    nome: 'Blacklist 01',    tema: 'Blacklist',    imagem: './img/blacklist-1.jpg' },
    { id: 'blacklist-2',    nome: 'Blacklist 02',    tema: 'Blacklist',    imagem: './img/blacklist-2.jpg' },
    { id: 'blacklist-3',    nome: 'Blacklist 03',    tema: 'Blacklist',    imagem: './img/blacklist-3.jpg' },
    { id: 'black-mirror-1', nome: 'Black Mirror 01', tema: 'Black Mirror', imagem: './img/black-mirror-1.jpg' },
    { id: 'black-mirror-2', nome: 'Black Mirror 02', tema: 'Black Mirror', imagem: './img/black-mirror-2.jpg' },
    { id: 'black-mirror-3', nome: 'Black Mirror 03', tema: 'Black Mirror', imagem: './img/black-mirror-3.jpg' },
    { id: 'black-mirror-4', nome: 'Black Mirror 04', tema: 'Black Mirror', imagem: './img/black-mirror-4.jpg' },
    { id: 'breaking-bad-1', nome: 'Breaking Bad 01', tema: 'Breaking Bad', imagem: './img/breaking-bad-1.jpg' },
    { id: 'breaking-bad-2', nome: 'Breaking Bad 02', tema: 'Breaking Bad', imagem: './img/breaking-bad-2.jpg' },
    { id: 'breaking-bad-3', nome: 'Breaking Bad 03', tema: 'Breaking Bad', imagem: './img/breaking-bad-3.jpg' },
    { id: 'breaking-bad-4', nome: 'Breaking Bad 04', tema: 'Breaking Bad', imagem: './img/breaking-bad-4.jpg' },
    { id: 'breaking-bad-5', nome: 'Breaking Bad 05', tema: 'Breaking Bad', imagem: './img/breaking-bad-5.jpg' },
    { id: 'breaking-bad-6', nome: 'Breaking Bad 06', tema: 'Breaking Bad', imagem: './img/breaking-bad-6.jpg' },
    { id: 'breaking-bad-7', nome: 'Breaking Bad 07', tema: 'Breaking Bad', imagem: './img/breaking-bad-7.jpg' },
    { id: 'chaves-1',       nome: 'Chaves 01',       tema: 'Chaves',       imagem: './img/chaves-1.jpg' },
    { id: 'series-la-casa-de-papel-01', nome: 'La Casa de Papel 01', tema: 'La Casa de Papel', imagem: './img/series-la-casa-de-papel-01.jpg' },
    { id: 'series-game-of-thrones-01', nome: 'Game of Thrones 01', tema: 'Game of Thrones', imagem: './img/series-game-of-thrones-01.jpg' },
    { id: 'series-vikings-01', nome: 'Vikings 01', tema: 'Vikings', imagem: './img/series-vikings-01.jpg' },
    { id: 'series-friends-01', nome: 'Friends 01', tema: 'Friends', imagem: './img/series-friends-01.jpg' },
    ...(['Lucifer', 'Supernatural', 'The Walking Dead'] as string[]).flatMap((tema) =>
      Array.from({ length: 4 }, (_, indice) => {
        const numero = String(indice + 1).padStart(2, '0')
        const arquivo = tema.toLowerCase().replaceAll(' ', '-')
        return { id: `series-${arquivo}-${numero}`, nome: `${tema} ${numero}`, tema, imagem: `./img/series-${arquivo}-${numero}.jpg` }
      }),
    ),
    ...([
      ['Dexter', 3, 'dexter'],
      ['Suits', 4, 'suits'],
      ['The Big Bang Theory', 3, 'the-big-bang-theory'],
      ['The 100', 4, 'the-100'],
      ['American Horror Story', 4, 'american-horror-story'],
      ['Ozark', 4, 'ozark'],
      ['Prison Break', 4, 'prison-break'],
      ['Sherlock', 3, 'sherlock'],
      ["The Handmaid's Tale", 4, 'the-handmaids-tale'],
      ['Outlander', 4, 'outlander'],
      ['The Originals', 4, 'the-originals'],
      ['Teen Wolf', 4, 'teen-wolf'],
    ] satisfies Array<[string, number, string]>).flatMap(([tema, total, arquivo]) =>
      Array.from({ length: total }, (_, indice) => {
        const numero = String(indice + 1).padStart(2, '0')
        return { id: `series-${arquivo}-${numero}`, nome: `${tema} ${numero}`, tema, imagem: `./img/series-${arquivo}-${numero}.jpg` }
      }),
    ),
  ],
}

/** Produtos de uma coleção, já com preço e slug preenchidos. */
const gruposColecoes: Record<string, string[]> = {
  personalizada: ['personalizada', 'com-fotos'],
  divertidas: ['divertidas', 'frases', 'flork'],
  geek: ['geek', 'desenhos', 'herois'],
  profissoes: ['profissoes', 'flork-profissoes'],
  futebol: ['futebol', 'esportes'],
}

export function produtosDaColecao(slug: string): Product[] {
  const origens = gruposColecoes[slug] ?? [slug]

  return origens.flatMap((origem) =>
    (produtos[origem] ?? []).map((p) => ({
      ...p,
      colecao: slug,
      preco: p.preco ?? PRECO_PADRAO,
      slug: p.id,
      sku: `CC-${p.id.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
      descricao: `Caneca personalizada ${p.nome}, tema ${p.tema ?? p.nome}.`,
      destaque: false,
    })),
  )
}

/** Todos os produtos do catálogo, achatados. */
export function todosProdutos(): Product[] {
  return Object.entries(produtos).flatMap(([colecao, itens]) =>
    itens.map((produto) => ({
      ...produto,
      colecao,
      preco: produto.preco ?? PRECO_PADRAO,
      slug: produto.id,
      sku: `CC-${produto.id.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
      descricao: `Caneca personalizada ${produto.nome}, tema ${produto.tema ?? produto.nome}.`,
      destaque: false,
    })),
  )
}

/** Busca simples por nome do produto ou da coleção. */
export function buscarProdutos(termo: string): Product[] {
  const q = termo.trim().toLowerCase()
  if (!q) return []
  return todosProdutos().filter(
    (p) => p.nome.toLowerCase().includes(q) || p.colecao.includes(q),
  )
}

export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
