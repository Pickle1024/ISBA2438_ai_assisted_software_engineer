# python3 -I build/render2.py OUT.mp4 [--draft] [--t0 A --t1 B] [--stills 1,2,3]
# v2 compositor: multi-panel layouts with solid blocks, per-shot levels + duotone, lip-synced sources, no radial lines.
import os, sys, math, subprocess, hashlib, argparse, functools
from multiprocessing import Pool
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'build'))
import edl2 as edl

ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--draft', action='store_true')
ap.add_argument('--t0', type=float, default=0); ap.add_argument('--t1', type=float, default=edl.DUR)
ap.add_argument('--stills', default='')
A = ap.parse_args()
TMP = A.out + '.frames'
W, H = (960, 540) if A.draft else (1920, 1080)
FPS = 30
CACHE = os.path.join(ROOT, 'build', 'cache2')
CREAM = (238, 228, 205); ORANGE = (200, 112, 64); BLACK = (8, 12, 12)
MAPS = {'tc': [(0, (4, 10, 10)), (.32, (20, 58, 54)), (.68, (118, 150, 134)), (1, (244, 234, 212))],
        'to': [(0, (6, 10, 10)), (.28, (22, 62, 57)), (.6, (198, 112, 64)), (1, (246, 230, 200))]}

H1 = [([(0, 0), (0.64, 0), (0.54, 1), (0, 1)], 'hero'),
      ([(0.64, 0), (1, 0), (1, 1), (0.54, 1)], 'b'),
      ([(0.78, 0.43), (1, 0.46), (1, 0.70)], 'c')]
LAYOUTS = {
    'H1': H1,
    'H2': [([(1 - x, y) for x, y in p], r) for p, r in H1],
    'H3': [([(0, 0), (1, 0), (1, 1), (0, 1)], 'b'),
           ([(0.20, 0.10), (0.88, 0.05), (0.92, 0.86), (0.16, 0.92)], 'hero'),
           ([(0, 0.66), (0.30, 1), (0, 1)], 'black'),
           ([(0.80, 0), (1, 0), (1, 0.24)], 'cream')],
    'H4': [([(0.12, 0), (0.74, 0), (0.86, 1), (0.24, 1)], 'hero'),
           ([(0, 0), (0.12, 0), (0.24, 1), (0, 1)], 'b'),
           ([(0.74, 0), (1, 0), (1, 0.44), (0.79, 0.42)], 'c'),
           ([(0.79, 0.42), (1, 0.44), (1, 1), (0.86, 1)], 'black')],
    'FULL': [([(-0.05, -0.05), (1.05, -0.05), (1.05, 1.05), (-0.05, 1.05)], 'hero')],
    'END': [([(-0.05, -0.05), (1.05, -0.05), (1.05, 1.05), (-0.05, 1.05)], 'hero')],
    'BARS': [([(-0.05, -0.05), (1.05, -0.05), (1.05, 1.05), (-0.05, 1.05)], 'hero')],
}
TEXTPOS = {'H1': (0.64, 0.62), 'H2': (0.05, 0.62), 'H3': (0.035, 0.035), 'H4': (0.81, 0.56)}

@functools.lru_cache(maxsize=None)
def font(name, size): return ImageFont.truetype(os.path.join(ROOT, 'fonts', name), size)

def raw_path(src):
    d = os.path.join(ROOT, 'clips', 'raw')
    for f in os.listdir(d):
        if f.rsplit('.', 1)[0] == src and not f.endswith(('.err', '.part')): return os.path.join(d, f)
    raise FileNotFoundError(src)

def src_start(p, s):
    if p.get('sync'): return max(0.0, p['sync'][1] - (p['sync'][0] - s['t0']))
    return p['t']

def key(p, s): return hashlib.md5(f"{p['src']}|{src_start(p, s):.3f}|{s['t1'] - s['t0']:.3f}|{p['crop']}|{W}".encode()).hexdigest()[:12]

def extract(job):
    src, t, dur, crop, k = job
    d = os.path.join(CACHE, k)
    if os.path.exists(os.path.join(d, 'done')): return
    os.makedirs(d, exist_ok=True)
    x0, y0, x1, y1 = crop
    vf = f'crop=iw*{x1-x0}:ih*{y1-y0}:iw*{x0}:ih*{y0},scale={W}:-2,fps={FPS}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', raw_path(src), '-t', f'{dur + 0.3:.3f}', '-vf', vf,
                    '-q:v', '2', os.path.join(d, '%04d.jpg')], check=True)
    open(os.path.join(d, 'done'), 'w').close()

@functools.lru_cache(maxsize=48)
def load_img(path): return Image.open(path).convert('RGB')

@functools.lru_cache(maxsize=256)
def listing(d): return sorted(f for f in os.listdir(d) if f.endswith('.jpg'))

def source_frame(p, s, t):
    if p['src'].startswith('plate:'): return load_img(os.path.join(ROOT, 'hf', 'refstyle', p['src'][6:]))
    d = os.path.join(CACHE, key(p, s)); files = listing(d)
    lead = 0.0
    if p.get('sync'):  # if the source can't start early enough, hold first frame
        lead = max(0.0, (p['sync'][0] - s['t0']) - p['sync'][1])
    i = int(max(0.0, t - s['t0'] - lead) * FPS)
    return load_img(os.path.join(d, files[min(i, len(files) - 1)]))

def source_mask(p, s, t):
    d = os.path.join(CACHE, key(p, s)); files = listing(d)
    lead = max(0.0, (p['sync'][0] - s['t0']) - p['sync'][1]) if p.get('sync') else 0.0
    f = files[min(int(max(0.0, t - s['t0'] - lead) * FPS), len(files) - 1)]
    m = os.path.join(d, 'm_' + f.replace('.jpg', '.png'))
    return Image.open(m).convert('L').resize(load_img(os.path.join(d, f)).size, Image.BILINEAR) if os.path.exists(m) else None

def sil_amount(p, lt, dur):
    if p.get('sil') == 'in': return 1 - smooth((lt - 0.55) / 0.6)
    if p.get('sil') == 'out': return smooth((lt - 1.0) / 0.5)
    return 0.0

@functools.lru_cache(maxsize=1)
def dark_tex():
    a = np.asarray(cover(load_img(os.path.join(ROOT, 'hf', 'refstyle', 'tex_teal.png')), W, H, 1.3)).astype(np.float32) / 255
    L = lum(a)[..., None]; base = np.array([10, 26, 25], np.float32) / 255
    return base * (0.6 + 0.9 * L)

def silhouette(m, w, h):
    # bright warm panel with a dark ink figure, like the reference titles
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]; y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    warm = np.array([214, 128, 76], np.float32) / 255; light = np.array([240, 226, 198], np.float32) / 255
    g = np.clip(0.25 + 0.9 * x - 0.3 * y, 0, 1)
    bright = warm * (1 - g) + light * g
    ink = np.array([8, 18, 18], np.float32) / 255
    m = np.asarray(m).astype(np.float32)[..., None] / 255
    m = np.clip((m - 0.35) / 0.3, 0, 1)
    return bright * (1 - m) + ink * m

def lum(a): return .3 * a[..., 0] + .59 * a[..., 1] + .11 * a[..., 2]

@functools.lru_cache(maxsize=512)
def levels(pkey, s_t0):
    # per-shot, per-panel black/white points from the panel's first frame (stable, no flicker)
    s = next(x for x in edl.S if x['t0'] == s_t0); p = PANELS[pkey]
    a = np.asarray(source_frame(p, s, s['t0']).resize((320, 180))).astype(np.float32) / 255
    L = lum(a); lo, hi = np.percentile(L, 1.0), np.percentile(L, 99.3)
    return float(lo), float(max(hi, lo + 0.25))

PANELS = {}
def duotone(img, p, s, role):
    if role == 'bg': lo, hi = 0.03, 0.9
    else:
        pk = f"{s['t0']}|{role}"; PANELS[pk] = p
        lo, hi = levels(pk, s['t0'])
    a = np.asarray(img).astype(np.float32) / 255
    L = np.clip((lum(a) - lo) / (hi - lo), 0, 1)
    L = L * L * (3 - 2 * L) * 0.35 + L * 0.65  # gentle S-curve
    st = MAPS[p['map']]; xs = [q[0] for q in st]; out = np.empty_like(a)
    for c in range(3): out[..., c] = np.interp(L, xs, [q[1][c] / 255 for q in st])
    return out * (1 - p['keep']) + a * p['keep']

def cover(img, w, h, zoom, cx=0.5, cy=0.5):
    iw, ih = img.size; sc = max(w / iw, h / ih) * zoom
    nw, nh = max(w, int(iw * sc + 0.5)), max(h, int(ih * sc + 0.5))
    im = img.resize((nw, nh), Image.BILINEAR)
    x = int((nw - w) * cx); y = int((nh - h) * cy)
    return im.crop((x, y, x + w, y + h))

def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def smooth(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)

def xform(poly, ang, sc, dx, dy):
    ca, sa = math.cos(ang), math.sin(ang); out = []
    for x, y in poly:
        X, Y = (x - 0.5) * W * sc, (y - 0.5) * H * sc
        out.append((W / 2 + X * ca - Y * sa + dx * W, H / 2 + X * sa + Y * ca + dy * H))
    return out

@functools.lru_cache(maxsize=1)
def texture():
    return np.asarray(cover(load_img(os.path.join(ROOT, 'hf', 'refstyle', 'tex_teal.png')), W, H, 1.0)).astype(np.float32) / 255

def softlight(b, s, op):
    r = np.where(s < .5, 2 * b * s + b * b * (1 - 2 * s), 2 * b * (1 - s) + np.sqrt(np.clip(b, 0, 1)) * (2 * s - 1))
    return b * (1 - op) + r * op

@functools.lru_cache(maxsize=1)
def vignette():
    y, x = np.mgrid[0:H, 0:W]; r = np.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2))
    return (1 - 0.30 * np.clip(r - 0.4, 0, 1) ** 1.4)[..., None].astype(np.float32)

def shot_at(t):
    for s in edl.S:
        if s['t0'] <= t < s['t1']: return s
    return edl.S[-1]

def draw_text_block(d, s, lt, dur, pos):
    big, small = s['text']
    al = int(255 * smooth(lt / 0.25) * (1 - smooth((lt - dur + 0.12) / 0.12)))
    fb = font('BebasNeue.ttf', int(H * 0.13)); fs = font('Oswald.ttf', int(H * 0.044))
    x, y = pos[0] * W, pos[1] * H + (1 - smooth(lt / 0.4)) * H * 0.012
    d.text((x, y), big, font=fb, fill=CREAM + (al,))
    d.text((x + H * 0.004, y + H * 0.14), small, font=fs, fill=CREAM + (al,))

def bars(d, t, s):
    lt = t - s['t0']; fb = font('BebasNeue.ttf', int(H * 0.11)); fm = font('Oswald.ttf', int(H * 0.046)); fsm = font('Oswald.ttf', int(H * 0.022))
    a0 = int(255 * smooth(lt / 0.3))
    if lt < 2.9:
        d.text((W * 0.07, H * 0.10), '$2T  TO  $3T', font=fb, fill=CREAM + (a0,))
        rows = [('MICROSOFT', 945, CREAM), ('APPLE', 1044, CREAM), ('NVIDIA', 96, ORANGE)]
        for i, (name, days, col) in enumerate(rows):
            y = H * (0.36 + i * 0.16); g = ease((lt - 0.15 - i * 0.3) / 0.55)
            if g <= 0: continue
            al = int(255 * min(1, g * 1.5))
            d.text((W * 0.07, y), name, font=fm, fill=CREAM + (al,))
            bx0 = W * 0.26; bw = W * 0.50 * days / 1044 * g
            d.rectangle([bx0, y + H * 0.012, bx0 + bw, y + H * 0.052], fill=col + (al,))
            d.text((bx0 + bw + W * 0.015, y), f'{days:,} DAYS', font=fm, fill=col + (al,))
        d.text((W * 0.07, H * 0.88), 'SOURCE: BESPOKE INVESTMENT GROUP, VIA REUTERS (JUNE 2024)', font=fsm, fill=CREAM + (int(a0 * 0.7),))
    else:
        l2 = lt - 2.9; al = int(255 * smooth(l2 / 0.2))
        fb2 = font('BebasNeue.ttf', int(H * 0.24)); tw = d.textlength('$5T', font=fb2)
        d.text(((W - tw) / 2, H * 0.28), '$5T', font=fb2, fill=CREAM + (al,))
        sub = 'OCT 2025 · FIRST COMPANY EVER'; sw = d.textlength(sub, font=fm)
        d.text(((W - sw) / 2, H * 0.56), sub, font=fm, fill=CREAM + (al,))

def render(fi):
    t = A.t0 + fi / FPS
    s = shot_at(t); dur = s['t1'] - s['t0']; u = (t - s['t0']) / dur; lt = t - s['t0']
    frame = np.zeros((H, W, 3), np.float32)
    if s['layout'] != 'BLACK':
        bgi = cover(load_img(os.path.join(ROOT, 'hf', 'refstyle', s['bg'][6:])), W, H, 1.0 + 0.04 * u)
        frame = duotone(bgi, dict(map='tc', keep=0.1), s, 'bg') * 0.45
        lay = LAYOUTS[s['layout']]
        ang = math.radians(s['rot'] * (u - 0.5)) if s['layout'] not in ('END', 'BARS') else 0.0
        sc = 1.0 + s['push'] * u
        roles = {'hero': s['hero'], 'b': s['b'], 'c': s['c']}
        hero_pts = None
        for j, (poly, role) in enumerate(lay):
            enter = ease(lt / 0.32) if s['layout'] not in ('FULL', 'END', 'BARS') else 1.0
            sgn = 1 if (j + int(s['t0'] * 10)) % 2 else -1
            dx = sgn * 0.14 * (1 - enter); dy = (0.06 if j % 2 else -0.06) * (1 - enter)
            pts = xform(poly, ang * (1 if role == 'hero' else 0.7), sc, dx, dy)
            if role == 'hero': hero_pts = pts
            xs = [q[0] for q in pts]; ys = [q[1] for q in pts]
            bx0, by0 = max(0, int(min(xs))), max(0, int(min(ys))); bx1, by1 = min(W, int(max(xs)) + 1), min(H, int(max(ys)) + 1)
            if bx1 - bx0 < 4 or by1 - by0 < 4: continue
            mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon(pts, fill=255)
            mk = np.asarray(mask.crop((bx0, by0, bx1, by1))).astype(np.float32)[..., None] / 255
            if role == 'black' or (role != 'hero' and roles.get(role) and roles[role]['src'] == 'solid:black' and s['layout'] not in ('FULL', 'END')):
                col = dark_tex()[by0:by1, bx0:bx1]
            elif role == 'cream':
                col = np.broadcast_to(np.array((214, 204, 182), np.float32) / 255, (by1 - by0, bx1 - bx0, 3))
            else:
                p = roles.get(role)
                if p is None: continue
                if p['src'].startswith('solid:'):
                    col = np.broadcast_to(np.array(BLACK if 'black' in p['src'] else (214, 204, 182), np.float32) / 255, (by1 - by0, bx1 - bx0, 3))
                else:
                    z = p['zoom'][0] + (p['zoom'][1] - p['zoom'][0]) * u
                    img = cover(source_frame(p, s, t), bx1 - bx0, by1 - by0, z, p['cx'], p['cy'])
                    col = duotone(img, p, s, role)
                    sa = sil_amount(p, lt, dur) if role == 'hero' else 0.0
                    if sa > 0.001:
                        mi = source_mask(p, s, t)
                        if mi is not None:
                            sm = silhouette(cover(mi, bx1 - bx0, by1 - by0, z, p['cx'], p['cy']), bx1 - bx0, by1 - by0)
                            col = col * (1 - sa) + sm * sa
                    if s['layout'] == 'BARS': col = col * 0.42
                    if s['layout'] == 'END': col = col * (1 - smooth((t - edl.TITLE[0] + 0.5) / 0.5))
            frame[by0:by1, bx0:bx1] = frame[by0:by1, bx0:bx1] * (1 - mk) + col * mk
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        if hero_pts and s['layout'] not in ('FULL', 'END', 'BARS'):
            d.line(hero_pts + [hero_pts[0]], fill=CREAM + (120,), width=max(1, W // 960))
        if s['text']: draw_text_block(d, s, lt, dur, TEXTPOS.get(s['layout'], (0.05, 0.08)))
        if s['layout'] == 'BARS': bars(d, t, s)
        if s['layout'] == 'END':
            a0, a1 = edl.TITLE; al = int(255 * smooth((t - a0) / 0.7) * (1 - smooth((t - a1) / 0.7)))
            if al > 0:
                fb = font('BebasNeue.ttf', int(H * 0.17)); fs = font('Oswald.ttf', int(H * 0.044))
                tl = 'JENSEN HUANG'; wb = d.textlength(tl, font=fb); d.text(((W - wb) / 2, H * 0.33), tl, font=fb, fill=CREAM + (al,))
                st = 'FOUNDER  ·  SINCE 1993'; ws = d.textlength(st, font=fs); d.text(((W - ws) / 2, H * 0.54), st, font=fs, fill=CREAM + (al,))
        o = np.asarray(ov).astype(np.float32) / 255
        frame = frame * (1 - o[..., 3:]) + o[..., :3] * o[..., 3:]
        frame = softlight(np.clip(frame, 0, 1), texture(), 0.28)
        frame *= vignette()
        rng = np.random.default_rng(fi + int(A.t0 * FPS)); frame += rng.normal(0, 0.02, (H, W))[..., None].astype(np.float32)
    fade = smooth(t / 0.5) * (1 - smooth((t - (edl.DUR - 0.8)) / 0.8))
    return (np.clip(frame * fade, 0, 1) * 255).astype(np.uint8)

def write(fi): Image.fromarray(render(fi)).save(os.path.join(TMP, f'{fi:05d}.jpg'), quality=92)

if __name__ == '__main__':
    jobs = {}
    for s in edl.S:
        for p in (s['hero'], s['b'], s['c']):
            if p and not p['src'].startswith(('plate:', 'solid:')):
                k = key(p, s); jobs[k] = (p['src'], src_start(p, s), s['t1'] - s['t0'], p['crop'], k)
    with Pool(8) as pool: pool.map(extract, list(jobs.values()))
    sil = {key(p, s) for s in edl.S for p in (s['hero'],) if p and p.get('sil')}
    for k in sil: subprocess.run([os.path.join(ROOT, 'tools', 'personmask'), os.path.join(CACHE, k)], check=True)
    if A.stills:
        for x in A.stills.split(','):
            A.t0 = float(x); Image.fromarray(render(0)).save(A.out.replace('.png', f'_{x}.png'))
        sys.exit()
    os.makedirs(TMP, exist_ok=True)
    n = int(round((A.t1 - A.t0) * FPS))
    with Pool(8) as pool: pool.map(write, range(n), chunksize=6)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', os.path.join(TMP, '%05d.jpg'),
                    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', A.out], check=True)
    subprocess.run(['rm', '-rf', TMP])
