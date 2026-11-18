// A última página: como comprar em três passos, o WhatsApp e o rodapé com o PREMIER gigante saindo pela borda.
import { useEffect, useRef } from 'react'
import { marca, desfecho, capa } from '../dados/loja.js'
import { caminhosMonograma } from './Monograma.jsx'

// o monograma se desenha traço por traço e depois ganha o preenchimento
function MonogramaDesenhado() {
  return (
    <svg className="mono-desenho" viewBox="0 0 290 205" role="img" aria-label="Premier.co">
      {['i', 'p', 'barriga'].map((k, n) => (
        <path key={k} d={caminhosMonograma[k]} pathLength="1" style={{ '--n': n }} />
      ))}
      <path className="mono-traco" d={caminhosMonograma.traco} pathLength="1" style={{ '--n': 3 }} />
    </svg>
  )
}

export function Desfecho() {
  const raiz = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.setAttribute('data-visivel', '')
          obs.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -18% 0px' },
    )
    raiz.current.querySelectorAll('.desfecho-conteudo, .rodape').forEach((n) => obs.observe(n))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="desfecho" className="desfecho" ref={raiz} aria-labelledby="desfecho-titulo">
      <div className="desfecho-conteudo">
        <p className="acervo-rotulo">
          <span>03</span> {desfecho.rotulo}
        </p>
        <h2 className="desfecho-titulo" id="desfecho-titulo">
          {desfecho.titulo.split(' ').map((palavra, i) => (
            <span className="letra" key={i}>
              <span style={{ '--i': i }}>{palavra}</span>
            </span>
          ))}
        </h2>
        <ol className="passos">
          {desfecho.passos.map((p, i) => (
            <li className="passo" key={p.titulo} style={{ '--i': i }}>
              <span className="passo-n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="passo-titulo">{p.titulo}</h3>
              <p className="passo-texto">{p.texto}</p>
            </li>
          ))}
        </ol>
        <div className="desfecho-acoes">
          <a className="acao acao-principal" href={marca.whatsapp} target="_blank" rel="noreferrer">
            {desfecho.chamada} <span aria-hidden="true">↗</span>
          </a>
          <a className="acao acao-contorno" href={marca.instagram} target="_blank" rel="noreferrer">
            Instagram <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <footer className="rodape">
        <div className="rodape-linha">
          <a className="rodape-marca" href="#inicio" aria-label="Premier.co, voltar ao início">
            <MonogramaDesenhado />
            <span>
              Premier.co
              <small>{capa.legendaTopo[0]}</small>
            </span>
          </a>
          <nav className="rodape-links" aria-label="Contato">
            <a href={marca.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={marca.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={marca.instagram} target="_blank" rel="noreferrer">
              Desapegue
            </a>
          </nav>
          <p className="rodape-copy">© {new Date().getFullYear()} Premier.co</p>
        </div>
        <p className="rodape-nome" aria-hidden="true">
          {[...capa.palavra].map((l, i) => (
            <span className="letra" key={i}>
              <span style={{ '--i': i }}>{l}</span>
            </span>
          ))}
        </p>
      </footer>
    </section>
  )
}
