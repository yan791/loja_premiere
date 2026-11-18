// O acervo: peças reais dos posts da Premier (dados das legendas do Instagram).
// Imagens em public/acervo/<slug>.webp (recorte), <slug>-foto.webp (foto real) e <slug>-sombra.webp,
// geradas por ferramentas/recortar_acervo.py. O destaque usa o par da capa (public/tenis/01.webp).

export const categorias = [
  { id: 'todos', nome: 'Todos' },
  { id: 'tenis', nome: 'Tênis' },
  { id: 'sandalias', nome: 'Sandálias' },
  { id: 'camisetas', nome: 'Camisetas' },
]

// tipo: destaque (o par da capa pousa aqui) | recorte (peça recortada, foto real ao passar o mouse) | foto (só a foto real)
// preco: número em reais, ou null quando é sob consulta
export const pecas = [
  {
    slug: 'off-white-vulc-low-branco',
    tipo: 'destaque',
    categoria: 'tenis',
    marca: 'Off-White',
    nome: 'Vulc Low',
    detalhe: 'Lona branca, sola vulcanizada listrada',
    selo: 'Na capa',
    tamanho: 'Consulte os tamanhos',
    contem: null,
    preco: null,
  },
  {
    slug: 'ggdb-superstar-preto',
    tipo: 'foto',
    categoria: 'tenis',
    marca: 'Golden Goose',
    nome: 'Superstar',
    selo: 'Recém-chegado',
    tamanho: '40/39',
    contem: 'Caixa',
    preco: 1990,
  },
  {
    slug: 'off-white-vulc-preto',
    tipo: 'recorte',
    categoria: 'tenis',
    marca: 'Off-White',
    nome: 'Vulc Low preto',
    tamanho: '41/40',
    contem: 'Apenas o tênis',
    preco: 1390,
  },
  {
    slug: 'birkenstock-arizona',
    tipo: 'recorte',
    categoria: 'sandalias',
    marca: 'Birkenstock',
    nome: 'Arizona',
    tamanho: '42 EU (41/40 BR)',
    contem: 'Apenas a sandália',
    preco: 725,
  },
  {
    slug: 'ggdb-superstar-branco',
    tipo: 'recorte',
    categoria: 'tenis',
    marca: 'Golden Goose',
    nome: 'Superstar',
    tamanho: '41',
    contem: 'Completo',
    preco: 0,
    vendido: true,
  },
  {
    slug: 'allsaints-london-onda',
    tipo: 'recorte',
    categoria: 'camisetas',
    marca: 'AllSaints',
    nome: 'London, estampa onda',
    tamanho: 'Diversos tamanhos',
    contem: null,
    preco: null,
  },
  {
    slug: 'allsaints-london-cinza',
    tipo: 'recorte',
    categoria: 'camisetas',
    marca: 'AllSaints',
    nome: 'London cinza',
    tamanho: 'Diversos tamanhos',
    contem: null,
    preco: null,
  },
]

export const condicao = 'Em ótimas condições'
