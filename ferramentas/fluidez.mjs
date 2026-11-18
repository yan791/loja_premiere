// Mede o tempo de cada quadro na entrada e com o mouse passeando pela capa.
// node ferramentas/fluidez.mjs [url] [--movel]
import { abrir, esperar } from './navegador.mjs'

const url = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) || 'http://127.0.0.1:5350/'
const movel = process.argv.includes('--movel')
const { browser, page, erros } = await abrir(movel ? { largura: 390, altura: 844, movel: true, escala: 2 } : { largura: 1440, altura: 900 })
await page.evaluateOnNewDocument(() => {
  window.__q = []
  let ult = performance.now()
  const f = (t) => {
    window.__q.push(t - ult)
    ult = t
    requestAnimationFrame(f)
  }
  requestAnimationFrame(f)
})
const resumo = (nome, q) => {
  q = q.slice(2)
  const longos = q.map((d, i) => [i, d]).filter(([, d]) => d > 25).map(([i, d]) => `#${i}:${d.toFixed(0)}`)
  if (longos.length) console.log(`  quadros longos em ${nome}: ${longos.join(' ')}`)
  q = q.sort((a, b) => a - b)
  const p = (x) => q[Math.min(q.length - 1, Math.floor(q.length * x))].toFixed(1)
  console.log(`${nome.padEnd(8)} quadros ${String(q.length).padStart(4)}  mediana ${p(0.5)} ms  p95 ${p(0.95)} ms  pior ${q[q.length - 1].toFixed(1)} ms  >25ms: ${q.filter((x) => x > 25).length}`)
}
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.fase-entrada, .fase-pronto', { timeout: 20000 })
await page.evaluate(() => (window.__q = []))
await page.waitForSelector('.fase-pronto', { timeout: 20000 })
resumo('entrada', await page.evaluate(() => window.__q))
await page.evaluate(() => (window.__q = []))
if (!movel) {
  for (let i = 0; i <= 60; i++) {
    await page.mouse.move(200 + i * 18, 200 + Math.sin(i / 6) * 220)
    await esperar(33)
  }
} else await esperar(2000)
resumo(movel ? 'parado' : 'mouse', await page.evaluate(() => window.__q))
// rolagem pela capa inteira, descendo e subindo de volta
await page.evaluate(() => (window.__q = []))
await page.mouse.move(movel ? 195 : 720, movel ? 420 : 450)
for (const sentido of [1, -1]) {
  for (let i = 0; i < 34; i++) {
    await page.mouse.wheel({ deltaY: sentido * 120 })
    await esperar(70)
  }
  await esperar(900)
}
resumo('rolagem', await page.evaluate(() => window.__q))
console.log(erros.join('\n') || 'sem erros')
await browser.close()
