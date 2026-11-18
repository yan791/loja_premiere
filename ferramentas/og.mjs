// Gera a imagem de prévia do link (site/public/og.jpg, 1200x630) a partir da capa pronta.
// node ferramentas/og.mjs [url]
import { fileURLToPath } from 'node:url'
import { abrir } from './navegador.mjs'

const url = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) || 'http://127.0.0.1:5350/'
const { browser, page } = await abrir({ largura: 1200, altura: 630 })
await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForSelector('.fase-pronto', { timeout: 20000 })
// tira o passeio automático do mouse para a foto sair com o par centralizado
await page.mouse.move(600, 315)
await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: fileURLToPath(new URL('../site/public/og.jpg', import.meta.url)), type: 'jpeg', quality: 86 })
await browser.close()
console.log('og.jpg pronto')
