// Tudo o que é texto ou dado da loja fica aqui. Trocar um tênis, um preço ou um texto começa por este arquivo.
// As imagens ficam em public/tenis/NN.webp (ferramentas/recortar.py gera a partir de material/tenis-ia/NN.png).

export const marca = {
  nome: 'Premier.co',
  assinatura: 'Own the exceptional.',
  instagram: 'https://www.instagram.com/preemier.co/',
  whatsapp: 'https://wa.link/025bwy',
}

export const menu = [
  { nome: 'Tênis', href: '#tenis', ativo: true },
  { nome: 'Marcas', href: '#marcas' },
  { nome: 'Curadoria', href: '#curadoria' },
  { nome: 'Contato', href: marca.whatsapp, fora: true },
]

// palavra: o título gigante atrás do par (vem da origem de cada marca)
export const destaques = [
  {
    n: '01',
    slug: 'off-white-vulc-low',
    marca: 'Off-White',
    nome: 'Vulc Low',
    palavra: 'MILANO',
    legendaTopo: ['Vulc Low em lona branca', 'com sola vulcanizada listrada'],
    legendaLado: ['Off-White Vulc Low', 'pre-owned com curadoria Premier'],
    condicao: 'Ótima.',
    contem: 'Caixa.',
    tamanhos: [40, 41, 42],
    tamanho: 41,
    preco: 2190,
  },
]

export const garantia =
  'Autenticidade: cada peça passa pela curadoria da Premier antes de entrar no acervo. Todos os produtos comercializados são autênticos e certificados, e já são mais de 1000 entregues pelo Brasil, com envio para todo o país.'

export const reais = (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
