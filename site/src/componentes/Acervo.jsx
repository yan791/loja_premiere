// O acervo: as peças reais da Premier recortadas num cartão creme igual para todas.
// O par da capa pousa no cartão de destaque (o voo é feito pelo motor da capa, em App.jsx).
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { categorias, pecas, condicao } from '../dados/acervo.js'
import { marca, reais } from '../dados/loja.js'

gsap.registerPlugin(Flip)

const base = import.meta.env.BASE_URL

function Peca({ p, i, fora }) {
  const [foto, setFoto] = useState(false)
  const preco = p.vendido ? 'Sold out' : p.preco ? reais(p.preco) : 'Sob consulta'
  const n = String(i + 1).padStart(2, '0')
  return (
    <article
      className={`peca peca-${p.tipo}${p.vendido ? ' vendido' : ''}${foto ? ' com-foto' : ''}${fora ? ' fora' : ''}`}
      aria-hidden={fora || undefined}
      data-flip-id={p.slug}
      data-cat={p.categoria}
      style={{ '--atraso': `${(i % 4) * 90}ms` }}
    >
      <div className="peca-palco">
        {p.tipo === 'destaque' && (
          <>
            <img className="peca-sombra" src={`${base}tenis/01-sombra.webp`} alt="" aria-hidden="true" />
            <img className="peca-img destaque-alvo" decoding="async" src={`${base}tenis/01.webp`} alt={`Par de tênis ${p.marca} ${p.nome} branco`} />
          </>
        )}
        {p.tipo === 'recorte' && (
          <>
            <img className="peca-sombra" src={`${base}acervo/${p.slug}-sombra.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <img className="peca-img" src={`${base}acervo/${p.slug}.webp`} alt={`${p.marca} ${p.nome}`} loading="lazy" decoding="async" />
            <img className="peca-real" src={`${base}acervo/${p.slug}-foto.webp`} alt={`Foto real: ${p.marca} ${p.nome}`} loading="lazy" decoding="async" />
            <button
              className="peca-ver-foto"
              aria-pressed={foto}
              // no computador o mouse já mostra a foto; o clique só alterna no celular
              onClick={() => setFoto((v) => (matchMedia('(hover: hover)').matches ? true : !v))}
              onMouseEnter={() => matchMedia('(hover: hover)').matches && setFoto(true)}
              onMouseLeave={() => matchMedia('(hover: hover)').matches && setFoto(false)}
            >
              {foto ? 'Ver recorte' : 'Ver foto real'}
            </button>
          </>
        )}
        {p.tipo === 'foto' && <img className="peca-real sempre" src={`${base}acervo/${p.slug}-foto.webp`} alt={`Foto real: ${p.marca} ${p.nome} com a caixa`} loading="lazy" decoding="async" />}
        {p.selo && <span className="peca-selo">{p.selo}</span>}
        <span className="peca-n">{n}</span>
        {p.vendido && <span className="carimbo">Sold out</span>}
      </div>
      <div className="peca-info">
        <p className="peca-marca">{p.marca}</p>
        <h3 className="peca-nome">{p.nome}</h3>
        {p.detalhe && <p className="peca-detalhe">{p.detalhe}</p>}
        <p className="peca-meta">
          Tam. {p.tamanho}
          {p.contem ? ` · ${p.contem}` : ''}
          {p.contem ? <span className="peca-condicao"> · {condicao}</span> : null}
        </p>
        <div className="peca-compra">
          <span className="peca-preco">
            {!p.vendido && p.preco ? <small>Preço Premier</small> : null}
            {preco}
          </span>
          <a className="peca-cta" href={marca.whatsapp} target="_blank" rel="noreferrer">
            {p.vendido ? 'Avise-me' : p.preco ? 'Quero esta' : 'Consultar'}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  )
}

export function Acervo() {
  const raiz = useRef(null)
  const pilula = useRef(null)
  const estado = useRef(null)
  const [filtro, setFiltro] = useState('todos')
  const visiveis = pecas.filter((p) => filtro === 'todos' || p.categoria === filtro)

  // entrada: o título sobe letra por letra e os cartões aparecem em sequência quando chegam na tela
  useEffect(() => {
    const el = raiz.current
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (!e.isIntersecting) return
          // atributo em vez de classe: o React reescreve o className quando o cartão muda e apagaria a marca
          e.target.setAttribute('data-visivel', '')
          obs.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    el.querySelectorAll('.peca, .encomenda, .acervo-topo').forEach((n) => obs.observe(n))
    return () => obs.disconnect()
  }, [])

  // a pílula marrom vai até o filtro escolhido
  const moverPilula = () => {
    const ativo = raiz.current.querySelector('.filtro[aria-pressed="true"]')
    if (!ativo) return
    gsap.to(pilula.current, { x: ativo.offsetLeft, width: ativo.offsetWidth, duration: 0.6, ease: 'expo.out' })
  }
  useEffect(() => {
    moverPilula()
    addEventListener('resize', moverPilula)
    return () => removeEventListener('resize', moverPilula)
  }, [filtro])

  // filtro: os cartões que ficam escorregam para o lugar novo, os que saem encolhem e somem
  const filtrar = (id) => {
    if (id === filtro) return
    raiz.current.querySelectorAll('.peca, .encomenda').forEach((n) => n.setAttribute('data-visivel', ''))
    estado.current = Flip.getState(raiz.current.querySelectorAll('.peca, .encomenda'))
    setFiltro(id)
  }
  useLayoutEffect(() => {
    if (!estado.current) return
    Flip.from(estado.current, {
      targets: raiz.current.querySelectorAll('.peca, .encomenda'),
      duration: 0.85,
      ease: 'expo.inOut',
      absolute: true,
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.25, ease: 'expo.out' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.45, ease: 'power2.in' }),
    })
    estado.current = null
  }, [filtro])

  return (
    <section id="acervo" className="acervo" ref={raiz} aria-labelledby="acervo-titulo">
      <header className="acervo-topo">
        <p className="acervo-rotulo">
          <span>02</span> Acervo · {visiveis.length} {visiveis.length === 1 ? 'peça' : 'peças'}
        </p>
        <h2 id="acervo-titulo" className="acervo-titulo">
          {[...'O acervo'].map((l, i) => (
            <span className="letra" key={i}>
              <span style={{ '--i': i }}>{l === ' ' ? ' ' : l}</span>
            </span>
          ))}
        </h2>
        <p className="acervo-texto">Peças de alto padrão pre-owned, conferidas uma a uma pela curadoria da Premier. Cada uma é única.</p>
        <div className="filtros" role="group" aria-label="Filtrar o acervo">
          <span className="filtros-pilula" ref={pilula} aria-hidden="true" />
          {categorias.map((c) => (
            <button key={c.id} className="filtro" aria-pressed={filtro === c.id} onClick={() => filtrar(c.id)}>
              {c.nome}
            </button>
          ))}
        </div>
      </header>

      <div className="grade">
        {/* todas as peças ficam montadas: as filtradas só somem (display none), para o Flip animar a saída */}
        {pecas.map((p, i) => (
          <Peca key={p.slug} p={p} i={i} fora={!visiveis.includes(p)} />
        ))}
        {(
          <aside className={`encomenda${filtro === 'todos' ? '' : ' fora'}`} data-flip-id="encomenda">
            <p className="encomenda-titulo">Procurando um modelo ou tamanho que não está aqui?</p>
            <p className="encomenda-texto">A Premier faz encomendas e procura a peça para você, com a mesma curadoria.</p>
            <a className="encomenda-cta" href={marca.whatsapp} target="_blank" rel="noreferrer">
              Encomendar pelo WhatsApp <span aria-hidden="true">↗</span>
            </a>
          </aside>
        )}
      </div>
    </section>
  )
}
