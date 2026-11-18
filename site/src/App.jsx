import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Lenis from 'lenis'
import { marca, menu, capa as dados } from './dados/loja.js'
import { Monograma } from './componentes/Monograma.jsx'
import { Sacola } from './componentes/Sacola.jsx'
import { Cortina } from './componentes/Cortina.jsx'
import { Acervo } from './componentes/Acervo.jsx'
import { Desfecho } from './componentes/Desfecho.jsx'

const movel = () => window.matchMedia('(max-width: 760px)').matches
const toque = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
const base = import.meta.env.BASE_URL
// a máscara do brilho vai por variável CSS, que resolve endereço relativo a partir do arquivo de estilo (assets/);
// por isso o endereço dela é sempre completo
const urlTenis = (sufixo = '') => new URL(`${base}tenis/${dados.tenis.n}${sufixo}.webp`, location.href).href

// o tênis e a palavra são desenhados no tamanho máximo que vão chegar na rolagem e começam reduzidos,
// assim nada fica borrado quando a câmera chega perto
const ZOOM_PAR = 1.24
const ZOOM_NOME = 1.08
const ASPECTO = 1183 / 913 // largura / altura do recorte do par

const limitar = (x) => Math.min(1, Math.max(0, x))
const suave = (a, b, x) => {
  const t = limitar((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const curva = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function Palavra({ texto, quebra, camada }) {
  // a palavra é desenhada duas vezes no mesmo lugar: a sombra que ela faz na parede e as letras em si.
  // No celular ela quebra em duas linhas (PRE / MIER)
  const linhas = [texto.slice(0, quebra), texto.slice(quebra)]
  let k = 0
  return (
    <div className={`palavra palavra-${camada}`} aria-hidden="true">
      <div className="letras">
        {linhas.map((linha, li) => (
          <span className="linha" key={li}>
            {[...linha].map((l) => {
              const i = k++
              return (
                <span className="letra" key={i}>
                  <span data-i={i}>{l}</span>
                </span>
              )
            })}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const capa = useRef(null)
  const sacolaBotao = useRef(null)
  const lenis = useRef(null)
  const pilula = useRef(null)
  const links = useRef(null)

  const [carregado, setCarregado] = useState(false)
  const [fase, setFase] = useState('carregando') // carregando | entrada | pronto
  const [aberta, setAberta] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  // tamanho do nome: ocupa a largura certa (no celular, a linha mais larga) sem passar da altura
  const ajustar = useCallback(() => {
    const el = capa.current
    if (!el) return
    const letras = el.querySelector('.palavra-nome .letras')
    letras.style.fontSize = '100px'
    const linhas = [...letras.querySelectorAll('.linha')]
    // offsetWidth mede sem a escala que o motor aplica (getBoundingClientRect mediria já reduzido)
    const largura100 = movel() ? Math.max(...linhas.map((l) => l.offsetWidth)) : letras.offsetWidth
    letras.style.fontSize = ''
    const W = innerWidth
    const H = innerHeight
    const fs = Math.min((100 * (movel() ? W * 0.94 : W * 0.9)) / largura100, (movel() ? 0.19 : 0.46) * H)
    el.style.setProperty('--nome-fs', `${(fs * ZOOM_NOME).toFixed(1)}px`)
    el.style.setProperty('--nome-fs-visto', `${fs.toFixed(1)}px`)
  }, [])

  // carregamento: fonte + tênis prontos liberam a cortina
  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    scrollTo(0, 0)
    let vivo = true
    const img = new Image()
    img.src = urlTenis(movel() ? '-m' : '')
    Promise.all([document.fonts.ready, img.decode().catch(() => {})]).then(() => {
      if (!vivo) return
      ajustar()
      setCarregado(true)
    })
    const aoRedimensionar = () => ajustar()
    addEventListener('resize', aoRedimensionar)
    return () => {
      vivo = false
      removeEventListener('resize', aoRedimensionar)
    }
  }, [ajustar])

  const entrar = useCallback(() => setFase('entrada'), [])

  // links internos (#acervo) rolam suave até a seção
  const irPara = (ev) => {
    const href = ev.currentTarget.getAttribute('href')
    if (!href?.startsWith('#') || !lenis.current) return
    ev.preventDefault()
    setMenuAberto(false)
    lenis.current.scrollTo(href === '#inicio' ? 0 : href, { offset: -10, duration: 2.2 })
  }

  // entrada da capa, junto com a cortina subindo: o nome nasce do centro para fora, o par desce e assenta na frente
  useLayoutEffect(() => {
    if (fase !== 'entrada') return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => setFase('pronto') })
      const centro = (dados.palavra.length - 1) / 2
      // a cortina leva ~1 s para subir: a câmera já vem se acomodando, e o nome e o par entram quando ela está quase saindo
      tl.from('.cena', { scale: 1.07, duration: 2.8, ease: 'power3.out' }, 0)
        .from('.palavra-nome .letra > span', {
          yPercent: 112,
          x: (i, el) => (+el.dataset.i - centro) * 26,
          duration: 1.7,
          delay: (i, el) => Math.abs(+el.dataset.i - centro) * 0.08,
        }, 0.55)
        .from('.palavra-sombra', { opacity: 0, duration: 1.6, ease: 'power2.out' }, 1.5)
        .from('.par-movimento', { y: () => -innerHeight * 0.5, rotate: -12, opacity: 0.01, duration: 2.1, ease: 'power4.out' }, 0.8)
        .from('.sombra-movimento', { scale: 0.4, opacity: 0.01, duration: 2.1, ease: 'power4.out' }, 0.8)
        .from('.barra', { opacity: 0, y: -18, duration: 1.2 }, 0.9)
        .from('.barra .surge', { opacity: 0, y: 10, stagger: 0.05, duration: 1 }, 1.0)
        .from('.linha-revela > span', { yPercent: 110, stagger: 0.06, duration: 1.1 }, 1.45)
        .from('.revela', { opacity: 0, y: 18, stagger: 0.07, duration: 1.2 }, 1.55)
    }, capa.current.closest('.pagina'))
    return () => ctx.revert()
  }, [fase])

  // rolagem suave (sempre ligada, mesmo com "efeitos de animação" desligados no Windows)
  useEffect(() => {
    const l = new Lenis({ lerp: 0.1, respectReducedMotion: false })
    l.stop()
    lenis.current = l
    return () => l.destroy()
  }, [])
  useEffect(() => {
    if (fase !== 'carregando') lenis.current?.start()
  }, [fase])

  // o motor da capa: rolagem (câmera chegando perto), mouse (profundidade entre os planos) e o par flutuando
  useEffect(() => {
    const el = capa.current
    const q = (s) => el.querySelector(s)
    const camadas = {
      nome: [q('.palavra-nome .letras'), q('.palavra-sombra .letras')],
      par: q('.par-parallax'),
      sombra: q('.sombra-parallax'),
      brilho: q('.brilho i'),
      cedo: [...el.querySelectorAll('.some-na-rolagem')],
      tarde: [...el.querySelectorAll('.surge-na-rolagem')],
      dica: q('.dica'),
    }
    const voo$ = {
      posicao: q('.par-posicao'),
      acervo: document.querySelector('#acervo'),
      alvo: document.querySelector('.destaque-alvo'),
      alvoSombra: document.querySelector('.peca-destaque .peca-sombra'),
      img: document.querySelector('.voador'),
    }
    let alvoX = 0
    let alvoY = 0
    let x = 0
    let y = 0
    let ultimoMouse = -1e9
    let p = 0
    const aoMover = (e) => {
      alvoX = (e.clientX / innerWidth) * 2 - 1
      alvoY = (e.clientY / innerHeight) * 2 - 1
      ultimoMouse = performance.now()
    }
    addEventListener('pointermove', aoMover, { passive: true })
    let raf = 0
    const t0 = performance.now()
    const cache = new Map()
    const escrever = (no, prop, v) => {
      const chave = no
      const c = cache.get(chave) || {}
      if (c[prop] !== v) {
        c[prop] = v
        cache.set(chave, c)
        no.style[prop] = v
      }
    }
    const passo = (agora) => {
      raf = requestAnimationFrame(passo)
      lenis.current?.raf(agora)
      const t = (agora - t0) / 1000
      if (toque || agora - ultimoMouse > 4000) {
        // sem mouse, a câmera passeia devagar sozinha
        alvoX = Math.sin(t * 0.35) * 0.45
        alvoY = Math.sin(t * 0.27 + 1) * 0.3
      }
      x += (alvoX - x) * 0.06
      y += (alvoY - y) * 0.06
      const curso = el.offsetHeight - innerHeight
      const bruto = curso > 0 ? limitar(scrollY / curso) : 0
      p += (bruto - p) * 0.14
      const e = curva(p)
      const H = innerHeight
      const W = innerWidth
      const boia = Math.sin(t * 1.15)
      const celular = W <= 760

      // nome: plano de trás, anda pouco; com a rolagem cresce um tiquinho e desce (o par sobe e revela o nome)
      const sNome = (1 + (ZOOM_NOME - 1) * e) / ZOOM_NOME
      const nome = `translate3d(${(-x * 10).toFixed(2)}px, ${(-y * 5 + e * H * (celular ? 0.02 : 0.05)).toFixed(2)}px, 0) scale(${sNome.toFixed(4)})`
      camadas.nome.forEach((n) => escrever(n, 'transform', nome))

      // par: plano da frente; com a rolagem chega perto (cresce), sobe e gira um pouco
      const sPar = (1 + (ZOOM_PAR - 1) * e) / ZOOM_PAR
      const parX = x * 22 + e * W * 0.015
      const parY = y * 12 + boia * 9 - e * H * 0.045
      const parGiro = Math.sin(t * 0.8) * 0.7 - e * 5
      escrever(
        camadas.par,
        'transform',
        `translate3d(${parX.toFixed(2)}px, ${parY.toFixed(2)}px, 0) ` +
          `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) rotateZ(${parGiro.toFixed(2)}deg) scale(${sPar.toFixed(4)})`,
      )

      // voo: quando o acervo entra na tela, o par sai da capa e pousa no cartão de destaque
      let voo = 0
      const alvo = voo$.alvo
      if (alvo && alvo.offsetParent && voo$.acervo) {
        voo = limitar((H - voo$.acervo.getBoundingClientRect().top) / (H * 0.85))
        const pr = voo$.posicao.getBoundingClientRect()
        const lA = pr.width * sPar
        const cA = [pr.left + pr.width / 2 + parX, pr.top + pr.height / 2 + parY]
        const rb = alvo.getBoundingClientRect()
        const lB = rb.width
        const cB = [rb.left + rb.width / 2, rb.top + rb.height / 2]
        const k = suave(0, 1, voo)
        const lV = lA + (lB - lA) * k
        const cx = cA[0] + (cB[0] - cA[0]) * k
        // o caminho faz uma curvinha para baixo, como se o par caísse no cartão
        const cy = cA[1] + (cB[1] - cA[1]) * k + Math.sin(k * Math.PI) * H * 0.06
        const giro = parGiro * (1 - k) + Math.sin(k * Math.PI) * 6
        const voando = voo > 0 && voo < 1
        escrever(voo$.img, 'visibility', voando ? 'visible' : 'hidden')
        if (voando) escrever(voo$.img, 'transform', `translate3d(${(cx - 500).toFixed(1)}px, ${(cy - 500 / ASPECTO).toFixed(1)}px, 0) rotate(${giro.toFixed(2)}deg) scale(${(lV / 1000).toFixed(4)})`)
        escrever(camadas.par, 'opacity', voo > 0 ? '0' : '1')
        escrever(alvo, 'opacity', voo >= 1 ? '1' : '0')
        if (voo$.alvoSombra) escrever(voo$.alvoSombra, 'opacity', (0.5 * suave(0.75, 1, voo)).toFixed(3))
      } else {
        escrever(camadas.par, 'opacity', '1')
        if (voo$.img) escrever(voo$.img, 'visibility', 'hidden')
      }

      // sombra do par na parede: quanto mais perto da câmera, mais longe da parede, mais larga e mais fraca
      escrever(
        camadas.sombra,
        'transform',
        `translate3d(${(x * 8 - x * 6 * e).toFixed(2)}px, ${(y * 4 + e * H * 0.03).toFixed(2)}px, 0) scale(${(1 - boia * 0.035 + e * 0.22).toFixed(4)})`,
      )
      escrever(camadas.sombra, 'opacity', ((0.42 - boia * 0.05 - e * 0.16) * (1 - suave(0, 0.3, voo))).toFixed(3))
      escrever(camadas.brilho, 'transform', `translate3d(${(x * 38 - 10 + Math.sin(t * 0.5) * 12 + e * 90).toFixed(2)}%, 0, 0) rotate(14deg)`)

      const cedo = (1 - suave(0.05, 0.4, p)).toFixed(3)
      camadas.cedo.forEach((n) => {
        escrever(n, 'opacity', cedo)
        escrever(n, 'translate', `0 ${((1 - cedo) * -18).toFixed(1)}px`)
        escrever(n, 'pointerEvents', cedo < 0.05 ? 'none' : '')
      })
      const tarde = suave(0.55, 0.92, p).toFixed(3)
      camadas.tarde.forEach((n) => {
        escrever(n, 'opacity', tarde)
        escrever(n, 'translate', `0 ${((1 - tarde) * 22).toFixed(1)}px`)
      })
      escrever(camadas.dica, 'opacity', (1 - suave(0.01, 0.12, p)).toFixed(3))
    }
    raf = requestAnimationFrame(passo)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', aoMover)
    }
  }, [])

  // a pílula marrom do menu escorrega até o link sob o mouse e volta para o primeiro
  const moverPilula = (alvo) => {
    const lista = links.current
    if (!lista || movel()) return
    const a = alvo || lista.querySelector('a')
    const r = a.getBoundingClientRect()
    const rl = lista.getBoundingClientRect()
    gsap.to(pilula.current, { x: r.left - rl.left, width: r.width, duration: 0.55, ease: 'expo.out' })
    lista.querySelectorAll('a').forEach((n) => n.classList.toggle('sob-pilula', n === a))
  }
  useEffect(() => {
    if (fase === 'carregando') return
    moverPilula()
    const r = () => moverPilula()
    addEventListener('resize', r)
    return () => removeEventListener('resize', r)
  }, [fase])

  return (
    <div className={`pagina fase-${fase}`}>
      <Cortina nome="PREMIER" sub="luxury second hand" pronto={carregado} aoSair={entrar} />

      <header className="topo">
        <nav className="barra" aria-label="Principal">
          <button className="menu-botao surge" aria-expanded={menuAberto} onClick={() => setMenuAberto((v) => !v)}>
            Menu
          </button>
          <ul className={`links${menuAberto ? ' aberto' : ''}`} ref={links} onMouseLeave={() => moverPilula()}>
            <span className="pilula-menu" ref={pilula} aria-hidden="true" />
            {menu.map((m) => (
              <li key={m.nome} className="surge">
                <a
                  href={m.href}
                  onMouseEnter={(e) => moverPilula(e.currentTarget)}
                  onFocus={(e) => moverPilula(e.currentTarget)}
                  {...(m.fora ? { target: '_blank', rel: 'noreferrer' } : {})}
                  onClick={m.fora ? () => setMenuAberto(false) : irPara}
                >
                  {m.nome}
                </a>
              </li>
            ))}
          </ul>
          <a className="logo surge" href="#inicio" aria-label="Premier.co, início" onClick={irPara}>
            <Monograma className="logo-monograma" />
            <span className="logo-nome">
              PREMIER<span>.CO</span>
            </span>
          </a>
          <button className="sacola-botao surge" ref={sacolaBotao} onClick={() => setAberta(true)}>
            Sacola
            <span className="contador" aria-label="0 itens">
              0
            </span>
          </button>
        </nav>
      </header>

      <main>
        <section id="inicio" className="capa" ref={capa}>
          <div className="capa-palco">
            <h1 className="so-leitor">
              {marca.nome}: luxury second hand. Peças de alto padrão pre-owned com curadoria, autênticas e certificadas.
            </h1>

            <div className="cena">
              <Palavra texto={dados.palavra} quebra={dados.quebra} camada="sombra" />
              <Palavra texto={dados.palavra} quebra={dados.quebra} camada="nome" />

              <div className="sombra-posicao" aria-hidden="true">
                <div className="sombra-movimento">
                  <div className="sombra-parallax">
                    <img src={`${base}tenis/${dados.tenis.n}-sombra.webp`} alt="" draggable="false" />
                  </div>
                </div>
              </div>

              <div className="par-posicao">
                <div className="par-movimento">
                  <div className="par-parallax">
                    <picture>
                      <source media="(max-width: 760px)" srcSet={`${base}tenis/${dados.tenis.n}-m.webp`} />
                      <img src={`${base}tenis/${dados.tenis.n}.webp`} alt={dados.tenis.alt} draggable="false" />
                    </picture>
                    <div className="brilho" aria-hidden="true" style={{ '--mascara': `url(${urlTenis(movel() ? '-m' : '')})` }}>
                      <i />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="legenda legenda-topo some-na-rolagem">
              {dados.legendaTopo.map((l) => (
                <span className="linha-revela" key={l}>
                  <span>{l}</span>
                </span>
              ))}
            </p>
            <p className="legenda legenda-lado some-na-rolagem">
              {dados.legendaLado.map((l) => (
                <span className="linha-revela" key={l}>
                  <span>{l}</span>
                </span>
              ))}
            </p>

            <div className="final surge-na-rolagem">
              <p className="final-titulo">{dados.final.titulo}</p>
              <p className="final-texto">{dados.final.texto}</p>
            </div>

            <p className="garantia revela">
              <span className="some-na-rolagem">{dados.garantia}</span>
            </p>

            <div className="numero revela">
              <strong>{dados.numero.valor}</strong>
              <span>{dados.numero.texto}</span>
            </div>

            <div className="acoes">
              <a className="acao acao-principal revela" href="#acervo" onClick={irPara}>
                Ver o acervo
                <span aria-hidden="true">↗</span>
              </a>
              <a className="acao acao-contorno revela" href={marca.whatsapp} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
            </div>

            <div className="dica revela" aria-hidden="true">
              <span>Role para chegar perto</span>
              <i />
            </div>
          </div>
        </section>

        <Acervo />
        <Desfecho />
      </main>

      {/* o par que voa da capa até o cartão de destaque do acervo */}
      <img className="voador" src={`${base}tenis/${dados.tenis.n}.webp`} alt="" aria-hidden="true" draggable="false" />

      <Sacola aberta={aberta} fechar={() => setAberta(false)} itens={[]} remover={() => {}} base={base} />
    </div>
  )
}
