// Monograma da Premier redesenhado em vetor a partir do perfil do Instagram:
// um I serifado e um P alto, cortados por um traço fino que nasce num caracol à esquerda e fecha a barriga do P.
export const caminhosMonograma = {
  // I: serifas finas e haste com curvinha na junção
  i: 'M48 35H115V41.5H96.5c-3 0-5 1.6-5 5V154c0 3.4 2 5 5 5H115V165.5H48V159H66.5c3 0 5-1.6 5-5V46.5c0-3.4-2-5-5-5H48Z',
  // P: haste alta, serifa só à esquerda no topo, serifa inteira embaixo
  p: 'M130 13H176V179c0 3.4 2 5 5 5H198V190.5H130V184H147c3 0 5-1.6 5-5V24.5c0-3.4-2-5-5-5H130Z',
  // barriga do P: grossa à direita, fina em cima e embaixo
  barriga: 'M170 13H220c33 0 56 19 56 44.5S253 101 220 101H170V94.5H214c22 0 37-15 37-37.5S236 19.5 214 19.5H170Z',
  // traço que corta o I e termina num caracol
  traco: 'M152 98H30C14 98 9 110 14.5 119c4 6.5 12.5 7.5 17.5 2.5',
}

export function Monograma({ className, titulo = 'Premier.co' }) {
  return (
    <svg className={className} viewBox="0 0 290 205" role="img" aria-label={titulo}>
      <path d={caminhosMonograma.i} fill="currentColor" />
      <path d={caminhosMonograma.p} fill="currentColor" />
      <path d={caminhosMonograma.barriga} fill="currentColor" />
      <path d={caminhosMonograma.traco} fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  )
}
