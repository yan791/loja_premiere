// Tudo o que é texto ou dado da loja fica aqui. Trocar o tênis da capa ou um texto começa por este arquivo.
// As imagens ficam em public/tenis/NN.webp (ferramentas/recortar.py gera a partir de material/tenis-ia/NN.png).

export const marca = {
  nome: 'Premier.co',
  assinatura: 'Own the exceptional.',
  instagram: 'https://www.instagram.com/preemier.co/',
  whatsapp: 'https://wa.link/025bwy',
}

export const menu = [
  { nome: 'Acervo', href: '#acervo' },
  // ainda não existe uma seção de marcas: leva ao acervo, onde estão as peças de cada uma
  { nome: 'Marcas', href: '#acervo' },
  // quem quer vender a própria peça fala com a Premier pelo Instagram
  { nome: 'Desapegue', href: marca.instagram, fora: true },
  { nome: 'Contato', href: marca.whatsapp, fora: true },
]

// a capa: o nome da marca atrás, o par na frente
export const capa = {
  palavra: 'PREMIER',
  quebra: 3, // no celular a palavra vira duas linhas: PRE / MIER
  tenis: { n: '01', nome: 'Off-White Vulc Low', alt: 'Par de tênis Off-White Vulc Low brancos, com logo de setas e sola listrada' },
  legendaTopo: ['Luxury second hand', 'peças de alto padrão pre-owned'],
  legendaLado: ['Na capa', 'Off-White Vulc Low'],
  // aparece quando a câmera chega perto do par, no fim da rolagem da capa
  final: { titulo: 'Own the exceptional.', texto: 'Cada peça passa pela curadoria da Premier antes de chegar até você.' },
  garantia:
    'Autenticidade: todos os produtos comercializados são autênticos e certificados. Enviamos para todo o Brasil, com atendimento pelo WhatsApp.',
  numero: { valor: '+1000', texto: 'peças autênticas entregues no Brasil' },
}

// a última página: como comprar em três passos e o rodapé
export const desfecho = {
  rotulo: 'Como comprar',
  titulo: 'Do acervo até você.',
  passos: [
    { titulo: 'Escolha a peça', texto: 'Veja o acervo e separe a sua.' },
    { titulo: 'Fale com a Premier', texto: 'Pelo WhatsApp, a Premier confirma tamanho e condição e envia mais fotos da peça.' },
    { titulo: 'Receba em casa', texto: 'Envio para todo o Brasil.' },
  ],
  chamada: 'Falar no WhatsApp',
}

export const reais = (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
