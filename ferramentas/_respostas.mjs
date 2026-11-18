import { abrir } from './navegador.mjs'
const url = process.argv[2]
const { browser, page } = await abrir({ largura: 1440, altura: 900 })
page.on('response', (r) => r.status() >= 400 && console.log(r.status(), r.url()))
await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForSelector('.fase-pronto', { timeout: 20000 })
console.log('pronto', await page.$eval('.brilho', (e) => getComputedStyle(e).maskImage.slice(0, 80)))
await browser.close()
