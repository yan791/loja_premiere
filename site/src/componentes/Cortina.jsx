// Tela de carregamento (a mesma da Liví, com a marca da Premier): fundo marrom, PREMIER subindo letra a letra,
// assinatura em itálico e uma linha que se desenha. Fica no ar enquanto a fonte e o tênis carregam
// (no mínimo 1,5 s) e sai subindo como uma cortina; a capa começa a entrar junto com essa saída.
import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const MINIMO = 1500

export function Cortina({ nome, sub, pronto, aoSair }) {
  const raiz = useRef(null)
  const inicio = useRef(performance.now())
  const saiu = useRef(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cortina-marca span', { yPercent: 110, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, delay: 0.08 })
      gsap.from('.cortina-sub', { opacity: 0, duration: 0.6, delay: 0.5 })
      gsap.from('.cortina-linha', { scaleX: 0, duration: 1.2, ease: 'power2.inOut', delay: 0.15 })
    }, raiz)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!pronto || saiu.current) return
    const espera = Math.max(0, MINIMO - (performance.now() - inicio.current))
    const t = setTimeout(() => {
      saiu.current = true
      aoSair()
      gsap.to(raiz.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.95,
        ease: 'power4.inOut',
        onComplete: () => raiz.current && (raiz.current.style.display = 'none'),
      })
    }, espera)
    return () => clearTimeout(t)
  }, [pronto, aoSair])

  return (
    <div className="cortina" ref={raiz} aria-hidden="true">
      <div className="cortina-marca">
        {[...nome].map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <p className="cortina-sub">{sub}</p>
      <span className="cortina-linha" />
    </div>
  )
}
