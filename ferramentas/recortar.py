# Recorta o par de tênis gerado por IA e prepara para a capa do site.
#
# Lê material/tenis-ia/01.png, 02.png... (imagens geradas no ChatGPT com fundo cinza liso, na ordem de
# src/dados/loja.js). Para cada imagem:
#   1. fundo: rembg (isnet) separa o tênis do cinza; o pymatting estima a cor verdadeira da borda (sem halo cinza)
#   2. realce leve de textura (lona, costura) e cor espalhada para fora do recorte (a GPU não puxa cinza na borda)
#   3. corta rente ao par e grava site/public/tenis/NN.webp (2200 px) e NN-m.webp (820 px, celular)
#   4. sombra: silhueta borrada em NN-sombra.webp (só alfa, a cor vem do CSS) para o par "flutuar" sobre a página
#   5. tenis.json com tamanho e bytes de cada arquivo
#
# python ferramentas/recortar.py [--so=01,02]
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

raiz = Path(__file__).resolve().parent.parent
entrada = raiz / 'material' / 'tenis-ia'
saida = raiz / 'site' / 'public' / 'tenis'
saida.mkdir(parents=True, exist_ok=True)
so = next((a.split('=')[1].split(',') for a in sys.argv if a.startswith('--so=')), None)

_sessao = None


def sem_fundo(img):
    global _sessao
    from rembg import remove, new_session
    if _sessao is None:
        _sessao = new_session('isnet-general-use')
    return remove(img, session=_sessao, post_process_mask=True)


def preparar(caminho):
    plano = Image.open(caminho).convert('RGB')
    rgba = sem_fundo(plano).convert('RGBA')
    arr = np.asarray(rgba).astype(np.float32) / 255.0
    alfa = arr[..., 3]
    cor = np.asarray(plano).astype(np.float32) / 255.0
    try:
        from pymatting import estimate_foreground_ml
        cor = estimate_foreground_ml(cor.astype(np.float64), alfa.astype(np.float64)).astype(np.float32)
    except Exception as e:
        print('  aviso: sem estimativa de borda', e)
    cheio = Image.fromarray((np.clip(cor, 0, 1) * 255).astype(np.uint8))
    cheio = cheio.filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=2))
    mascara = Image.fromarray((alfa > 0.5).astype(np.uint8) * 255)
    borrado = cheio
    for raio in (2, 6, 16, 40):
        bn = np.asarray(cheio.filter(ImageFilter.GaussianBlur(raio))).astype(np.float32)
        mn = np.asarray(mascara.filter(ImageFilter.GaussianBlur(raio))).astype(np.float32)[..., None] / 255.0
        media = np.where(mn > 0.02, bn / np.maximum(mn, 1e-3), 0)
        fora = (alfa < 0.5)[..., None] & (mn > 0.02)
        borrado = Image.fromarray(np.clip(np.where(fora, media, np.asarray(borrado).astype(np.float32)), 0, 255).astype(np.uint8))
    rgb = np.where((alfa > 0.5)[..., None], np.asarray(cheio), np.asarray(borrado))

    ys, xs = np.where(alfa > 0.03)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    folga = int((x1 - x0) * 0.012)
    x0, y0 = max(0, x0 - folga), max(0, y0 - folga)
    x1, y1 = min(alfa.shape[1] - 1, x1 + folga), min(alfa.shape[0] - 1, y1 + folga)
    final = np.dstack([rgb, (alfa * 255).astype(np.uint8)])[y0:y1 + 1, x0:x1 + 1]
    return Image.fromarray(final, 'RGBA')


def sombra(recorte, escala=0.5):
    # silhueta em baixa resolução, achatada e bem borrada; o CSS escala e posiciona embaixo do par
    l, a = recorte.size
    pequeno = recorte.split()[3].resize((round(l * escala), round(a * escala)), Image.LANCZOS)
    margem = round(pequeno.width * 0.12)
    tela = Image.new('L', (pequeno.width + margem * 2, pequeno.height + margem * 2), 0)
    tela.paste(pequeno, (margem, margem))
    tela = tela.filter(ImageFilter.GaussianBlur(pequeno.width * 0.022))
    preto = Image.new('L', tela.size, 0)
    return Image.merge('LA', (preto, tela)).convert('RGBA'), margem / escala


arquivos = sorted(entrada.glob('[0-9][0-9].png'))
anterior = {r['n']: r for r in json.loads((saida / 'tenis.json').read_text())} if (saida / 'tenis.json').exists() else {}
info = []
for caminho in arquivos:
    n = caminho.stem
    if so and n not in so and n in anterior:
        info.append(anterior[n])
        continue
    recorte = preparar(caminho)
    l, a = recorte.size
    registro = {'n': n, 'largura': l, 'altura': a}
    for sufixo, alvo in (('', 2200), ('-m', 820)):
        escala = min(1, alvo / l)
        img = recorte.resize((round(l * escala), round(a * escala)), Image.LANCZOS) if escala < 1 else recorte
        arq = saida / f'{n}{sufixo}.webp'
        img.save(arq, quality=92, method=6, exact=True)
        registro['bytes' + sufixo.replace('-', '_')] = arq.stat().st_size
    sb, margem = sombra(recorte)
    arq = saida / f'{n}-sombra.webp'
    sb.save(arq, quality=80, method=6)
    registro['sombra_margem'] = round(margem / l, 4)  # margem da sombra em fração da largura do par
    info.append(registro)
    print(f'{n}: {l}x{a}, {registro["bytes"] // 1024} KB / {registro["bytes_m"] // 1024} KB, sombra {arq.stat().st_size // 1024} KB')
(saida / 'tenis.json').write_text(json.dumps(info, indent=1))
