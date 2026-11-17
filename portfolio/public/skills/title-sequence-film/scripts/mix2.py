# python3 -I build/mix2.py OUT.wav [--music-only]
import os, sys, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'build')); import edl2 as edl
out = sys.argv[1]; music_only = '--music-only' in sys.argv
def raw(src):
    d = os.path.join(ROOT, 'clips', 'raw')
    return [os.path.join(d, f) for f in os.listdir(d) if f.rsplit('.', 1)[0] == src and not f.endswith(('.err', '.part'))][0]
inputs, fl, tags = [], [], []
for i, (ft, m0, m1, fo) in enumerate(edl.MUSIC_SEGS):
    inputs += ['-i', os.path.join(ROOT, edl.MUSIC)]; d = m1 - m0
    fl.append(f'[{len(inputs)//2-1}:a]atrim={m0}:{m1},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,'
              f'afade=t=in:d=0.02,afade=t=out:st={d-fo:.3f}:d={fo},adelay={int(ft*1000)}|{int(ft*1000)}[m{i}]')
    tags.append(f'[m{i}]')
duck = []
for i, (ft, src, a, b, g) in enumerate([] if music_only else edl.DIALOG):
    inputs += ['-i', raw(src)]; d = b - a; idx = len(inputs)//2 - 1
    fl.append(f'[{idx}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,'
              f'highpass=f=80,acompressor=threshold=-22dB:ratio=3:attack=5:release=150,'
              f'afade=t=in:d=0.04,afade=t=out:st={d-0.08:.3f}:d=0.08,volume={g}dB,adelay={int(ft*1000)}|{int(ft*1000)}[d{i}]')
    tags.append(f'[d{i}]'); duck.append((ft - 0.15, ft + d + 0.2))
n = len(tags)
mus = ''.join(t for t in tags if t.startswith('[m'))
dia = ''.join(t for t in tags if t.startswith('[d'))
fl.append(f'{mus}amix=inputs={len(edl.MUSIC_SEGS)}:normalize=0,apad=whole_dur={edl.DUR}[mm]')
vol = '+'.join(f'between(t,{a:.2f},{b:.2f})' for a, b in duck) or '0'
fl.append(f"[mm]volume='if({vol},0.42,1)*if(gt(t,75.6),3.2,1)':eval=frame[mu]")
if dia:
    fl.append(f'[mu]{dia}amix=inputs={len(duck)+1}:normalize=0:duration=first,atrim=0:{edl.DUR},loudnorm=I=-15:TP=-1.5:LRA=11[o]')
else:
    fl.append(f'[mu]atrim=0:{edl.DUR},loudnorm=I=-15:TP=-1.5:LRA=11[o]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', '48000', out], check=True)
print('ok', out)
