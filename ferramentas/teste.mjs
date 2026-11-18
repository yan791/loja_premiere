// Fotos da capa em vários tamanhos de tela + o fluxo de compra (tamanho, sacola).
// node ferramentas/teste.mjs [url]
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { abrir, esperar } from './navegador.mjs'

const url = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) || 'http://127.0.0.1:5350/'
const pasta = fileURLToPath(new URL('./shots/', import.meta.url))
mkdirSync(pasta, { recursive: true })
const foto = (n) => pasta + n
const telas = [
  { nome: 'desktop', largura: 1440, altura: 900 },
  { nome: 'notebook', largura: 1366, altura: 657 },
  { nome: 'largo', largura: 1920, altura: 1080 },
  { nome: 'celular', largura: 390, altura: 844, movel: true, escala: 2 },
  { nome: 'celular-pequeno', largura: 360, altura: 640, movel: true, escala: 2 },
]
const so = process.argv.find((a) => a.startsWith('--so='))?.split('=')[1]?.split(',')
for (const t of telas.filter((t) => !so || so.includes(t.nome))) {
  const { browser, page, erros } = await abrir(t)
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForSelector('.fase-pronto', { timeout: 20000 })
  await page.screenshot({ path: foto(`${t.nome}.png`) })
  if (t.nome === 'desktop' || t.nome === 'celular') {
    if (t.nome === 'celular') await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.click('.tamanho .pilula')
    await esperar(500)
    await page.screenshot({ path: foto(`${t.nome}-tamanhos.png`) })
    await page.click('.tamanhos li:last-child button')
    await page.click('.ficha-botao')
    await esperar(800)
    await page.screenshot({ path: foto(`${t.nome}-detalhes.png`) })
    await page.click('.adicionar')
    await esperar(450)
    await page.screenshot({ path: foto(`${t.nome}-voo.png`) })
    await esperar(1400)
    const contador = await page.$eval('.contador', (e) => e.textContent)
    await page.click('.sacola-botao')
    await esperar(1000)
    await page.screenshot({ path: foto(`${t.nome}-sacola.png`) })
    console.log(`${t.nome}: contador ${contador}`)
  }
  const largura = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
  console.log(`${t.nome}: largura da página ${largura[0]} / tela ${largura[1]}`)
  console.log(erros.join('\n') || `${t.nome}: sem erros`)
  await browser.close()
}
