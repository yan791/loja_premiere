// Fotos da capa com o Desapegue e da última página (como comprar + rodapé), no meio e no fim da animação.
// node ferramentas/desfecho.mjs [url] [--movel] [--pequeno]
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { abrir, esperar } from './navegador.mjs'

const url = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) || 'http://127.0.0.1:5350/'
const movel = process.argv.includes('--movel')
const pequeno = process.argv.includes('--pequeno')
const nome = pequeno ? 'celular-pequeno' : movel ? 'celular' : 'desktop'
const tela = pequeno ? { largura: 360, altura: 640, movel: true, escala: 2 } : movel ? { largura: 390, altura: 844, movel: true, escala: 2 } : { largura: 1440, altura: 900 }
const pasta = fileURLToPath(new URL('./shots/', import.meta.url))
mkdirSync(pasta, { recursive: true })
const { browser, page, erros } = await abrir(tela)
await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForSelector('.fase-pronto', { timeout: 25000 })
await page.mouse.move(tela.largura / 2, tela.altura / 2)
await esperar(500)
await page.screenshot({ path: `${pasta}${nome}-capa-desapegue.png` })
const topo = await page.evaluate(() => document.querySelector('#desfecho').getBoundingClientRect().top + scrollY)
await page.evaluate((y) => scrollTo(0, y), Math.round(topo))
await esperar(700)
await page.screenshot({ path: `${pasta}${nome}-desfecho-entrando.png` })
await esperar(2600)
await page.screenshot({ path: `${pasta}${nome}-desfecho.png` })
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
await esperar(2600)
await page.screenshot({ path: `${pasta}${nome}-desfecho-fim.png` })
const largura = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
console.log(`${nome}: largura da página ${largura[0]} / tela ${largura[1]}`)
console.log(erros.join('\n') || `${nome}: sem erros`)
await browser.close()
