// Fotos da capa em vários tamanhos de tela: no topo, no meio e no fim da rolagem da capa (+ a sacola no desktop).
// node ferramentas/teste.mjs [url] [--so=desktop,celular]
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
  await esperar(400)
  await page.screenshot({ path: foto(`${t.nome}-0-cortina.png`) })
  await page.waitForSelector('.fase-pronto', { timeout: 20000 })
  await page.mouse.move(t.largura / 2, t.altura / 2)
  await esperar(600)
  await page.screenshot({ path: foto(`${t.nome}-1-capa.png`) })
  const curso = await page.evaluate(() => document.querySelector('.capa').offsetHeight - innerHeight)
  for (const [nome, f] of [['2-meio', 0.5], ['3-fim', 1]]) {
    await page.evaluate((y) => scrollTo(0, y), Math.round(curso * f))
    await esperar(1600)
    await page.screenshot({ path: foto(`${t.nome}-${nome}.png`) })
  }
  if (t.nome === 'desktop') {
    await page.click('.sacola-botao')
    await esperar(1000)
    await page.screenshot({ path: foto(`${t.nome}-4-sacola.png`) })
  }
  const largura = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
  console.log(`${t.nome}: largura da página ${largura[0]} / tela ${largura[1]}`)
  console.log(erros.join('\n') || `${t.nome}: sem erros`)
  await browser.close()
}
