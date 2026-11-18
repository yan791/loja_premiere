// Fotos do voo do par (capa -> cartão de destaque) e do acervo: grade, filtro, foto real, sold out.
// node ferramentas/acervo.mjs [url] [--movel]
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { abrir, esperar } from './navegador.mjs'

const url = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) || 'http://127.0.0.1:5350/'
const movel = process.argv.includes('--movel')
const nome = movel ? 'celular' : 'desktop'
const pasta = fileURLToPath(new URL('./shots/', import.meta.url))
mkdirSync(pasta, { recursive: true })
const { browser, page, erros } = await abrir(movel ? { largura: 390, altura: 844, movel: true, escala: 2 } : { largura: 1440, altura: 900 })
await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForSelector('.fase-pronto', { timeout: 25000 })
const topoAcervo = await page.evaluate(() => document.querySelector('#acervo').getBoundingClientRect().top + scrollY)
const H = await page.evaluate(() => innerHeight)
// voo: acervo entrando (topo do acervo em 75%, 45% e 15% da tela)
for (const [rotulo, f] of [['voo-1', 0.75], ['voo-2', 0.45], ['voo-3', 0.12]]) {
  await page.evaluate((y) => scrollTo(0, y), Math.round(topoAcervo - H * f))
  await esperar(1500)
  await page.screenshot({ path: `${pasta}${nome}-acervo-${rotulo}.png` })
}
// grade inteira
await page.evaluate((y) => scrollTo(0, y), Math.round(topoAcervo + H * 0.55))
await esperar(1800)
await page.screenshot({ path: `${pasta}${nome}-acervo-grade.png` })
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
await esperar(1800)
await page.screenshot({ path: `${pasta}${nome}-acervo-fim.png` })
await page.evaluate((y) => scrollTo(0, y), Math.round(topoAcervo + H * 0.55))
await esperar(1200)
// foto real (botão de um cartão recortado)
await page.click('.peca-recorte .peca-ver-foto')
await esperar(800)
await page.screenshot({ path: `${pasta}${nome}-acervo-foto-real.png` })
// filtro: camisetas
await page.evaluate((y) => scrollTo(0, y), Math.round(topoAcervo + H * 0.05))
await esperar(1200)
const botoes = await page.$$('.filtro')
await botoes[3].click()
await esperar(400)
await page.screenshot({ path: `${pasta}${nome}-acervo-filtro-meio.png` })
await esperar(1200)
await page.screenshot({ path: `${pasta}${nome}-acervo-filtro.png` })
await botoes[0].click()
await esperar(1500)
console.log(erros.join('\n') || `${nome}: sem erros`)
await browser.close()
