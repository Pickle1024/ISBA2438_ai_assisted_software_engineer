# python3 -I build/cover.py SRC T OUT [crop x0,y0,x1,y1] [cx] [map]  -> 1920x1080 cover in the film's style
import sys, os, subprocess, numpy as np
from PIL import Image, ImageDraw
src, T, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
crop = tuple(map(float, sys.argv[4].split(','))) if len(sys.argv) > 4 else (0, 0, 1, 1)
cx = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5; mp = sys.argv[6] if len(sys.argv) > 6 else 'to'
sys.argv = ['render2', '/dev/null']
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
import render2 as R
W, H = R.W, R.H
tmp = out + '.src.png'; x0, y0, x1, y1 = crop
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{T}', '-i', R.raw_path(src), '-frames:v', '1',
                '-vf', f'crop=iw*{x1-x0}:ih*{y1-y0}:iw*{x0}:ih*{y0}', tmp], check=True)
img = Image.open(tmp).convert('RGB'); os.remove(tmp)
frame = R.dark_tex().copy()
poly = [(0, 0), (0.66, 0), (0.56, 1), (0, 1)]
pts = [(x * W, y * H) for x, y in poly]
bw = int(0.66 * W) + 1
face = R.cover(img, bw, H, 1.0, cx, 0.45)
a = np.asarray(face).astype(np.float32) / 255
L = R.lum(a); lo, hi = np.percentile(L, 1), np.percentile(L, 99.3)
L = np.clip((L - lo) / max(hi - lo, .25), 0, 1); L = L * L * (3 - 2 * L) * .35 + L * .65
st = R.MAPS[mp]; xs = [q[0] for q in st]; col = np.empty_like(a)
for c in range(3): col[..., c] = np.interp(L, xs, [q[1][c] / 255 for q in st])
col = col * .94 + a * .06
mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon(pts, fill=255)
mk = np.asarray(mask).astype(np.float32)[:, :bw, None] / 255
frame[:, :bw] = frame[:, :bw] * (1 - mk) + col * mk
# warm accent sliver like the reference
acc = [(0.585 * W, 0.80 * H), (0.70 * W, 0.83 * H), (0.68 * W, H), (0.56 * W, H)]
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
d.polygon(acc, fill=R.ORANGE + (200,))
d.line(pts + [pts[0]], fill=R.CREAM + (150,), width=2)
fb = R.font('BebasNeue.ttf', int(H * 0.19)); fs = R.font('Oswald.ttf', int(H * 0.05))
d.text((0.665 * W, 0.30 * H), 'JENSEN', font=fb, fill=R.CREAM + (255,))
d.text((0.665 * W, 0.47 * H), 'HUANG', font=fb, fill=R.CREAM + (255,))
d.text((0.67 * W, 0.67 * H), 'FOUNDER  ·  SINCE 1993', font=fs, fill=R.CREAM + (230,))
o = np.asarray(ov).astype(np.float32) / 255
frame = frame * (1 - o[..., 3:]) + o[..., :3] * o[..., 3:]
frame = R.softlight(np.clip(frame, 0, 1), R.texture(), 0.28) * R.vignette()
frame += np.random.default_rng(7).normal(0, 0.018, (H, W))[..., None]
Image.fromarray((np.clip(frame, 0, 1) * 255).astype(np.uint8)).save(out, quality=95)
print(out)
