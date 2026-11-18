# Recorta as peças das fotos dos posts da Premier (material/instagram/hd/<slug>.jpg, as originais em alta) para o acervo.
# Cada foto tem caixa, papel ou texto em volta; aqui sobra só a peça, que vai num cartão creme igual para todas.
#   1. rembg (isnet) separa a peça; o pymatting limpa a cor da borda
#   2. corta rente, centraliza num quadro 4:5 com folga e grava site/public/acervo/<slug>.webp (+ sombra borrada)
#   3. grava também a foto real da peça em 4:5 (<slug>-foto.webp), que aparece quando a pessoa passa o mouse
#
# python ferramentas/recortar_acervo.py [--so=slug1,slug2] [--modelo=isnet-general-use]
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

raiz = Path(__file__).resolve().parent.parent
entrada = raiz / 'material' / 'instagram' / 'hd'
saida = raiz / 'site' / 'public' / 'acervo'
saida.mkdir(parents=True, exist_ok=True)
so = next((a.split('=')[1].split(',') for a in sys.argv if a.startswith('--so=')), None)
modelo = next((a.split('=')[1] for a in sys.argv if a.startswith('--modelo=')), 'isnet-general-use')

# fotos escolhidas em cada carrossel (slug: post de origem)
PECAS = {
    'ggdb-superstar-preto': 'DffOsmbFQN0',
    'ggdb-superstar-branco': 'Dc1_fKxt0Bd',
    'off-white-vulc-preto': 'DchMpNviWJ2',
    'birkenstock-arizona': 'DchLFgmCZIu',
    'allsaints-london-onda': 'Da_T23KCeHA',
    'allsaints-london-cinza': 'Da_T23KCeHA',
}

# fotos em que a peça divide a cena com caixa e papel da mesma cor: o recorte não fica limpo,
# então o site usa só a foto real (cartão de "recém-chegado")
SO_FOTO = {'ggdb-superstar-preto'}

_sessao = None


def sem_fundo(img):
    global _sessao
    from rembg import remove, new_session
    if _sessao is None:
        _sessao = new_session(modelo)
    return remove(img, session=_sessao, post_process_mask=True)


def recortar(caminho):
    plano = Image.open(caminho).convert('RGB')
    if plano.height > 1800:
        plano = plano.resize((round(plano.width * 1800 / plano.height), 1800), Image.LANCZOS)
    alfa = np.asarray(sem_fundo(plano).convert('RGBA'))[..., 3].astype(np.float32) / 255
    # fica só o maior pedaço (e o que encosta nele): some com etiquetas soltas e restos de papel
    from scipy import ndimage
    rotulos, n = ndimage.label(alfa > 0.5)
    if n > 1:
        tamanhos = ndimage.sum(np.ones_like(alfa), rotulos, range(1, n + 1))
        grandes = [i + 1 for i, t in enumerate(tamanhos) if t > tamanhos.max() * 0.12]
        manter = ndimage.binary_dilation(np.isin(rotulos, grandes), iterations=3)
        alfa = alfa * manter
    cor = np.asarray(plano).astype(np.float64) / 255
    try:
        from pymatting import estimate_foreground_ml
        cor = estimate_foreground_ml(cor, alfa.astype(np.float64))
    except Exception as e:
        print('  aviso: sem estimativa de borda', e)
    rgb = Image.fromarray((np.clip(cor, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=2))
    ys, xs = np.where(alfa > 0.03)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    peca = Image.fromarray(np.dstack([np.asarray(rgb), (alfa * 255).astype(np.uint8)]), 'RGBA').crop((x0, y0, x1, y1))
    return peca


def no_quadro(peca, largura=800, altura=1000, ocupa=0.8):
    # centraliza a peça num quadro 4:5 transparente, ocupando no máximo 80% da largura ou da altura
    escala = min(largura * ocupa / peca.width, altura * ocupa / peca.height)
    p = peca.resize((round(peca.width * escala), round(peca.height * escala)), Image.LANCZOS)
    quadro = Image.new('RGBA', (largura, altura), (0, 0, 0, 0))
    quadro.paste(p, ((largura - p.width) // 2, (altura - p.height) // 2 - round(altura * 0.02)), p)
    return quadro


def sombra(quadro):
    a = quadro.split()[3].filter(ImageFilter.GaussianBlur(quadro.width * 0.03))
    return Image.merge('LA', (Image.new('L', quadro.size, 0), a)).convert('RGBA')


registro = json.loads((saida / 'acervo.json').read_text()) if (saida / 'acervo.json').exists() else {}
for slug, post in PECAS.items():
    if so and slug not in so:
        continue
    if slug not in SO_FOTO:
        q = no_quadro(recortar(entrada / f'{slug}.jpg'))
        q.save(saida / f'{slug}.webp', quality=90, method=6, exact=True)
        sombra(q).resize((320, 400), Image.LANCZOS).save(saida / f'{slug}-sombra.webp', quality=80, method=6)
    foto = Image.open(entrada / f'{slug}.jpg').convert('RGB')
    alvo = 0.8  # 4:5
    if foto.width / foto.height > alvo:
        l = round(foto.height * alvo)
        foto = foto.crop(((foto.width - l) // 2, 0, (foto.width + l) // 2, foto.height))
    else:
        a = round(foto.width / alvo)
        foto = foto.crop((0, (foto.height - a) // 2, foto.width, (foto.height + a) // 2))
    foto.resize((800, 1000), Image.LANCZOS).save(saida / f'{slug}-foto.webp', quality=82, method=6)
    registro[slug] = {'post': post, 'recorte': slug not in SO_FOTO}
    print(f'{slug}: pronto')
(saida / 'acervo.json').write_text(json.dumps(registro, indent=1))
