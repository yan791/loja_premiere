// Fotos da animação de entrada em alguns instantes (para conferir a coreografia).
// node ferramentas/entrada.mjs [url]
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { abrir, esperar } from './navegador.mjs'

const url = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) || 'http://127.0.0.1:5350/'
const pasta = fileURLToPath(new URL('./shots/', import.meta.url))
mkdirSync(pasta, { recursive: true })
const { browser, page, erros } = await abrir({ largura: 1440, altura: 900 })
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.fase-entrada', { timeout: 20000 })
let antes = 0
for (const ms of [450, 900, 1400, 2100]) {
  await esperar(ms - antes)
  antes = ms
  await page.screenshot({ path: `${pasta}entrada-${ms}.png` })
}
console.log(erros.join('\n') || 'sem erros')
await browser.close()
