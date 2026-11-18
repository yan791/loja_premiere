import { useEffect, useRef } from 'react'
import { marca, reais } from '../dados/loja.js'

// Sacola lateral: lista o que foi escolhido e fecha o pedido pelo WhatsApp da Premier
export function Sacola({ aberta, fechar, itens, remover, base }) {
  const painel = useRef(null)
  const total = itens.reduce((t, i) => t + i.preco, 0)

  useEffect(() => {
    if (!aberta) return
    const tecla = (e) => e.key === 'Escape' && fechar()
    window.addEventListener('keydown', tecla)
    painel.current?.focus()
    return () => window.removeEventListener('keydown', tecla)
  }, [aberta, fechar])

  return (
    <div className={`sacola${aberta ? ' aberta' : ''}`} aria-hidden={!aberta} inert={!aberta}>
      <div className="sacola-fundo" onClick={fechar} />
      <aside className="sacola-painel" role="dialog" aria-modal="true" aria-label="Sacola" tabIndex={-1} ref={painel}>
        <header className="sacola-topo">
          <h2>Sacola</h2>
          <button className="sacola-fechar" onClick={fechar}>
            Fechar
          </button>
        </header>
        {itens.length === 0 ? (
          <p className="sacola-vazia">Sua sacola está vazia.</p>
        ) : (
          <ul className="sacola-itens">
            {itens.map((item, i) => (
              <li key={`${item.slug}-${item.tamanho}-${i}`}>
                <img src={`${base}tenis/${item.n}-m.webp`} alt="" />
                <div>
                  <strong>{item.nome}</strong>
                  <span>Tamanho {item.tamanho}</span>
                  <span>{reais(item.preco)}</span>
                </div>
                <button onClick={() => remover(i)} aria-label={`Remover ${item.nome}`}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
        <footer className="sacola-rodape">
          <p className="sacola-total">
            <span>Total</span>
            <strong>{reais(total)}</strong>
          </p>
          <a
            className={`sacola-finalizar${itens.length ? '' : ' desligado'}`}
            href={itens.length ? marca.whatsapp : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!itens.length}
          >
            Finalizar pelo WhatsApp
          </a>
          <p className="sacola-nota">Peças autênticas e certificadas. A Premier confirma o pedido e o envio pelo WhatsApp.</p>
        </footer>
      </aside>
    </div>
  )
}
