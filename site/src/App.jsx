import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { marca, menu, destaques, garantia, reais } from './dados/loja.js'
import { Monograma } from './componentes/Monograma.jsx'
import { Sacola } from './componentes/Sacola.jsx'

const CHAVE_SACOLA = 'premier-sacola'
const lerSacola = () => {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE_SACOLA))
    return Array.isArray(s) ? s : []
  } catch {
    return []
  }
}
const movel = () => window.matchMedia('(max-width: 760px)').matches
const toque = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
const base = import.meta.env.BASE_URL
// a máscara do brilho vai por variável CSS, que resolve endereço relativo a partir do arquivo de estilo (assets/);
// por isso o endereço dela é sempre completo

function Palavra({ texto, camada }) {
  // duas cópias da palavra no mesmo lugar: a de trás é cheia, a da frente é só o contorno,
  // então as letras continuam legíveis por cima do tênis sem esconder o produto
  return (
    <div className={`palavra palavra-${camada}`} aria-hidden="true">
      <div className="letras">
        {[...texto].map((l, i) => (
          <span className="letra" key={i}>
            <span data-i={i}>{l}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const produto = destaques[0]
  const capa = useRef(null)
  const parallax = useRef({})
  const sacolaBotao = useRef(null)
  const contador = useRef(null)
  const parImg = useRef(null)

  const [fase, setFase] = useState('carregando')
  const [tamanho, setTamanho] = useState(produto.tamanho)
  const [escolhendo, setEscolhendo] = useState(false)
  const [detalhes, setDetalhes] = useState(false)
  const [sacola, setSacola] = useState(lerSacola)
  const [aberta, setAberta] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => localStorage.setItem(CHAVE_SACOLA, JSON.stringify(sacola)), [sacola])
  const naSacola = sacola.some((s) => s.slug === produto.slug && s.tamanho === tamanho)
  const itens = sacola.length

  // título gigante: ocupa a largura certa sem passar da altura (mede com a fonte já carregada)
  const ajustar = useCallback(() => {
    const el = capa.current
    if (!el) return
    const medida = el.querySelector('.palavra-tras .letras')
    medida.style.fontSize = '100px'
    const largura100 = medida.getBoundingClientRect().width
    medida.style.fontSize = ''
    const W = el.clientWidth
    const H = movel() ? window.innerHeight : el.clientHeight
    const alvo = movel() ? W * 0.94 : W * 0.86
    const fs = Math.min((100 * alvo) / largura100, (movel() ? 0.3 : 0.44) * H)
    el.style.setProperty('--palavra-fs', `${fs.toFixed(1)}px`)
  }, [])

  useLayoutEffect(() => {
    let vivo = true
    const img = new Image()
    img.src = `${base}tenis/${produto.n}${movel() ? '-m' : ''}.webp`
    Promise.all([document.fonts.ready, img.decode().catch(() => {})]).then(() => {
      if (!vivo) return
      ajustar()
      setFase('entrada')
    })
    const aoRedimensionar = () => ajustar()
    window.addEventListener('resize', aoRedimensionar)
    return () => {
      vivo = false
      window.removeEventListener('resize', aoRedimensionar)
    }
  }, [ajustar, produto.n])

  // entrada: a palavra sobe letra por letra, o par desce e assenta, o resto aparece em seguida
  useLayoutEffect(() => {
    if (fase !== 'entrada') return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' }, onComplete: () => setFase('pronto') })
      tl.from('.barra', { opacity: 0, y: -18, duration: 1.2 }, 0)
        .from('.barra .surge', { opacity: 0, y: 10, stagger: 0.05, duration: 1 }, 0.2)
        .from('.letra > span', { yPercent: 108, duration: 1.6, stagger: (i, el) => +el.dataset.i * 0.075 }, 0.25)
        .from('.par-movimento', { y: () => -innerHeight * 0.42, rotate: -10, scale: 1.06, opacity: 0.01, duration: 2, ease: 'power4.out' }, 0.5)
        .from('.sombra-movimento', { scale: 0.45, opacity: 0.01, duration: 2, ease: 'power4.out' }, 0.5)
        .from('.revela', { opacity: 0, y: 16, stagger: 0.07, duration: 1.2 }, 1.15)
        .from('.linha-revela > span', { yPercent: 110, stagger: 0.06, duration: 1.1 }, 1.05)
      // espera dois quadros: o navegador desenha a palavra e o tênis (quase transparente, 1%) uma vez antes de a animação começar a contar
      requestAnimationFrame(() => requestAnimationFrame(() => tl.play()))
    }, capa.current.parentNode)
    return () => ctx.revert()
  }, [fase])

  // vida da capa: o par flutua sozinho e responde ao mouse com profundidade (a palavra anda pouco, o tênis anda mais)
  useEffect(() => {
    if (fase === 'carregando') return
    const el = capa.current
    const p = parallax.current
    p.tras = el.querySelector('.palavra-tras .letras')
    p.frente = el.querySelector('.palavra-frente .letras')
    p.par = el.querySelector('.par-parallax')
    p.sombra = el.querySelector('.sombra-parallax')
    p.brilho = el.querySelector('.brilho i')
    let alvoX = 0
    let alvoY = 0
    let x = 0
    let y = 0
    let ultimoMouse = -1e9
    const aoMover = (e) => {
      const r = el.getBoundingClientRect()
      alvoX = ((e.clientX - r.left) / r.width) * 2 - 1
      alvoY = ((e.clientY - r.top) / r.height) * 2 - 1
      ultimoMouse = performance.now()
    }
    const aoSair = () => {
      alvoX = 0
      alvoY = 0
    }
    window.addEventListener('pointermove', aoMover, { passive: true })
    document.addEventListener('pointerleave', aoSair)
    let raf = 0
    const t0 = performance.now()
    const passo = (agora) => {
      raf = requestAnimationFrame(passo)
      const t = (agora - t0) / 1000
      // sem mouse (celular ou mouse parado há um tempo) a câmera passeia devagar sozinha
      if (toque || agora - ultimoMouse > 4000) {
        alvoX = Math.sin(t * 0.35) * 0.45
        alvoY = Math.sin(t * 0.27 + 1) * 0.3
      }
      x += (alvoX - x) * 0.06
      y += (alvoY - y) * 0.06
      const boia = Math.sin(t * 1.15)
      const palavra = `translate3d(${(-x * 10).toFixed(2)}px, ${(-y * 5).toFixed(2)}px, 0)`
      p.tras.style.transform = palavra
      p.frente.style.transform = palavra
      p.par.style.transform =
        `translate3d(${(x * 22).toFixed(2)}px, ${(y * 12 + boia * 9).toFixed(2)}px, 0) ` +
        `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) rotateZ(${(Math.sin(t * 0.8) * 0.7).toFixed(2)}deg)`
      p.sombra.style.transform = `translate3d(${(x * 8).toFixed(2)}px, ${(y * 4).toFixed(2)}px, 0) scale(${(1 - boia * 0.035).toFixed(4)})`
      p.sombra.style.opacity = (0.32 - boia * 0.05).toFixed(3)
      p.brilho.style.transform = `translate3d(${(x * 38 - 10 + Math.sin(t * 0.5) * 12).toFixed(2)}%, 0, 0) rotate(14deg)`
    }
    raf = requestAnimationFrame(passo)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', aoMover)
      document.removeEventListener('pointerleave', aoSair)
    }
  }, [fase])

  useEffect(() => {
    if (!escolhendo) return
    const fechar = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return
      if (e.type === 'pointerdown' && e.target.closest('.tamanho')) return
      setEscolhendo(false)
    }
    window.addEventListener('pointerdown', fechar)
    window.addEventListener('keydown', fechar)
    return () => {
      window.removeEventListener('pointerdown', fechar)
      window.removeEventListener('keydown', fechar)
    }
  }, [escolhendo])

  // adicionar: uma miniatura do par voa até a sacola e o contador pula
  const adicionar = () => {
    if (naSacola) {
      setAberta(true)
      return
    }
    const de = parImg.current.getBoundingClientRect()
    const para = sacolaBotao.current.getBoundingClientRect()
    const voo = parImg.current.cloneNode()
    voo.className = 'voo'
    voo.removeAttribute('alt')
    Object.assign(voo.style, { left: `${de.left}px`, top: `${de.top}px`, width: `${de.width}px`, height: `${de.height}px` })
    document.body.appendChild(voo)
    const dx = para.left + para.width / 2 - (de.left + de.width / 2)
    const dy = para.top + para.height / 2 - (de.top + de.height / 2)
    gsap
      .timeline({
        onComplete: () => {
          voo.remove()
          gsap.fromTo(contador.current, { scale: 1.45 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' })
        },
      })
      .to(voo, { scale: 0.07, rotate: -12, duration: 0.95, ease: 'power3.out' }, 0)
      .to(voo, { x: dx, duration: 0.95, ease: 'power2.inOut' }, 0)
      .to(voo, { y: dy, duration: 0.95, ease: 'back.in(1.2)' }, 0)
      .to(voo, { opacity: 0.3, duration: 0.2 }, 0.78)
    gsap.fromTo('.par-movimento', { scale: 0.97 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.6)' })
    setSacola((s) => [...s, { slug: produto.slug, tamanho, n: produto.n, nome: `${produto.marca} ${produto.nome}`, preco: produto.preco }])
  }

  return (
    <div className={`pagina fase-${fase}`}>
      <header className="topo">
        <nav className="barra" aria-label="Principal">
          <button className="menu-botao surge" aria-expanded={menuAberto} onClick={() => setMenuAberto((v) => !v)}>
            Menu
          </button>
          <ul className={`links${menuAberto ? ' aberto' : ''}`}>
            {menu.map((m) => (
              <li key={m.nome} className="surge">
                <a
                  href={m.href}
                  className={m.ativo ? 'ativo' : undefined}
                  aria-current={m.ativo ? 'page' : undefined}
                  {...(m.fora ? { target: '_blank', rel: 'noreferrer' } : {})}
                  onClick={() => setMenuAberto(false)}
                >
                  {m.nome}
                </a>
              </li>
            ))}
          </ul>
          <a className="logo surge" href="#tenis" aria-label="Premier.co, início">
            <Monograma className="logo-monograma" />
            <span className="logo-nome">
              PREMIER<span>.CO</span>
            </span>
          </a>
          <button className="sacola-botao surge" ref={sacolaBotao} onClick={() => setAberta(true)}>
            Sacola
            <span className="contador" ref={contador} aria-label={`${itens} ${itens === 1 ? 'item' : 'itens'}`}>
              {itens}
            </span>
          </button>
        </nav>
      </header>

      <main id="tenis" className="capa" ref={capa}>
        <h1 className="so-leitor">
          {marca.nome}: {produto.marca} {produto.nome} pre-owned, autêntico e com curadoria
        </h1>

        <div className="palco">
        <Palavra texto={produto.palavra} camada="tras" />

        <div className="sombra-posicao" aria-hidden="true">
          <div className="sombra-movimento">
            <div className="sombra-parallax">
              <img src={`${base}tenis/${produto.n}-sombra.webp`} alt="" draggable="false" />
            </div>
          </div>
        </div>

        <div className="par-posicao">
          <div className="par-movimento">
            <div className="par-parallax">
              <picture>
                <source media="(max-width: 760px)" srcSet={`${base}tenis/${produto.n}-m.webp`} />
                <img
                  ref={parImg}
                  src={`${base}tenis/${produto.n}.webp`}
                  alt={`Par de tênis ${produto.marca} ${produto.nome} brancos, com logo de setas e sola listrada`}
                  draggable="false"
                />
              </picture>
              <div className="brilho" aria-hidden="true" style={{ '--mascara': `url(${new URL(`${base}tenis/${produto.n}${movel() ? '-m' : ''}.webp`, location.href).href})` }}>
                <i />
              </div>
            </div>
          </div>
        </div>

        <Palavra texto={produto.palavra} camada="frente" />
        </div>

        <p className="legenda legenda-topo">
          {produto.legendaTopo.map((l) => (
            <span className="linha-revela" key={l}>
              <span>{l}</span>
            </span>
          ))}
        </p>
        <p className="legenda legenda-lado">
          {produto.legendaLado.map((l) => (
            <span className="linha-revela" key={l}>
              <span>{l}</span>
            </span>
          ))}
        </p>

        <p className="garantia revela">{garantia}</p>

        <div className={`ficha revela${detalhes ? ' aberta' : ''}`}>
          <p>
            Condição: {produto.condicao.toLowerCase()}
            <br />
            Contém: {produto.contem.toLowerCase()}
          </p>
          <div className="ficha-mais" id="ficha-mais">
            <div>
              <p>Tamanhos no acervo: {produto.tamanhos.join(', ')}.</p>
              <p>Envio para todo o Brasil, com atendimento pelo WhatsApp.</p>
            </div>
          </div>
          <button className="ficha-botao" aria-expanded={detalhes} aria-controls="ficha-mais" onClick={() => setDetalhes((v) => !v)}>
            {detalhes ? 'Ver menos' : 'Ver detalhes'}
          </button>
        </div>

        <div className="compra">
          <div className="caixa tamanho revela">
            <span>Tamanho</span>
            <button className="pilula" aria-haspopup="listbox" aria-expanded={escolhendo} onClick={() => setEscolhendo((v) => !v)}>
              {tamanho}
            </button>
            {escolhendo && (
              <ul className="tamanhos" role="listbox" aria-label="Escolha o tamanho">
                {produto.tamanhos.map((t) => (
                  <li key={t}>
                    <button
                      role="option"
                      aria-selected={t === tamanho}
                      onClick={() => {
                        setTamanho(t)
                        setEscolhendo(false)
                      }}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="caixa preco revela">
            <span>Preço</span>
            <span className="pilula">{reais(produto.preco)}</span>
          </div>
          <button className={`adicionar revela${naSacola ? ' feito' : ''}`} onClick={adicionar}>
            {naSacola ? 'Na sacola' : 'Adicionar à sacola'}
          </button>
        </div>
      </main>

      <Sacola
        aberta={aberta}
        fechar={() => setAberta(false)}
        itens={sacola}
        remover={(i) => setSacola((s) => s.filter((_, j) => j !== i))}
        base={base}
      />
    </div>
  )
}
