// Confere para onde vão os links "Desapegue" (menu e rodapé) e se a capa está sem o bloco antigo.
// node ferramentas/links-desapegue.mjs [url]
import { abrir } from './navegador.mjs'
const { browser, page } = await abrir({ largura: 1440, altura: 900 })
await page.goto(process.argv[2] || 'http://127.0.0.1:5350/', { waitUntil: 'networkidle0' })
await page.waitForSelector('.fase-pronto', { timeout: 25000 })
console.log(await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => /desapegue/i.test(a.textContent)).map((a) => `${a.closest('nav')?.className || '?'}: ${a.getAttribute('href')}`).join(' | ')), '| bloco na capa:', await page.$('.desapegue') ? 'sim' : 'não')
await browser.close()
