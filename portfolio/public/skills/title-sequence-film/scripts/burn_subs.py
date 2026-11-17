# python3 -I build/burn_subs.py VIDEO.mp4 MIX.wav subs/cues.tsv OUT.mp4 [--cover COVER.jpg]
# cues.tsv: start<TAB>end<TAB>english<TAB>chinese (film seconds). Bilingual burn-in without libass/drawtext:
# each cue -> transparent PNG (PIL) -> ffmpeg overlay with enable=between(). Optional 0.5s cover frame + embedded thumbnail.
import sys, os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
video, mix, cues, out = sys.argv[1:5]
cover = sys.argv[sys.argv.index('--cover') + 1] if '--cover' in sys.argv else None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1920, 1080
fc = ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc', 50, index=1)
fe = ImageFont.truetype(os.path.join(ROOT, 'fonts', 'Oswald.ttf'), 32)
rows = [l.rstrip('\n').split('\t') for l in open(cues) if l.strip()]
d0 = os.path.join(os.path.dirname(os.path.abspath(cues)), 'burn'); os.makedirs(d0, exist_ok=True)
for i, (a, b, en, cn) in enumerate(rows):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for txt, f, y in ((cn, fc, H * 0.835), (en, fe, H * 0.905)):
        w = d.textlength(txt, font=f)
        d.text(((W - w) / 2, y), txt, font=f, fill=(244, 234, 212, 255), stroke_width=3, stroke_fill=(8, 14, 14, 200))
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rectangle([0, int(H * 0.80), W, H], fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(40)); sh.alpha_composite(im); sh.save(os.path.join(d0, f'{i:02d}.png'))
ins = ['-i', video, '-i', mix]; off = 2
if cover: ins = ['-loop', '1', '-framerate', '30', '-t', '0.5', '-i', cover] + ins; off = 3
vi, ai = (1, 2) if cover else (0, 1)
fl = [f'[{vi}:v]setsar=1[v0]']
for i, (a, b, *_ ) in enumerate(rows):
    ins += ['-i', os.path.join(d0, f'{i:02d}.png')]
    fl.append(f"[v{i}][{i + off}:v]overlay=enable='between(t,{float(a)},{float(b)})'[v{i + 1}]")
n = len(rows); maps = []
if cover:
    fl += ['[0:v]scale=1920:1080,format=yuv420p,setsar=1[c]', f'[c][v{n}]concat=n=2:v=1:a=0[vo]', f'[{ai}:a]adelay=500|500[ao]']
    ins += ['-i', cover]; maps = ['-map', '[vo]', '-map', '[ao]', '-map', str(n + off), '-c:v:1', 'mjpeg', '-disposition:v:1', 'attached_pic']
else:
    fl.append(f'[v{n}]null[vo]'); maps = ['-map', '[vo]', '-map', f'{ai}:a']
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), *maps, '-c:v:0', 'libx264', '-crf', '23',
                '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out], check=True)
print('ok', out)
