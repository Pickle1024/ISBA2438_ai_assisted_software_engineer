# v2 edit decision list. Film seconds, 30fps. Dialog timings are word-level (faster-whisper) in CLIP-RELATIVE seconds.
# Panel: src = clip name | plate:<file> | solid:black | solid:cream ; t = source time at shot start.
# sync=(film_t, src_t): source time is locked so that src_t plays at film_t (lip sync with dialog).
DUR = 80.0
BEAT, LIFT = 0.627, 34.0
def snap(t): return round(LIFT + round((t - LIFT) / BEAT) * BEAT, 3)

S = []
def shot(t0, t1, layout, hero, b=None, c=None, text=None, push=0.06, rot=4.0, bg='plate:tex_teal.png'):
    S.append(dict(t0=t0, t1=t1, layout=layout, hero=hero, b=b, c=c, text=text, push=push, rot=rot, bg=bg))

def P(src, t=0.0, crop=(0, 0, 1, 1), m='tc', keep=.06, zoom=(1.0, 1.06), cx=.5, cy=.5, sync=None, sil=None):
    return dict(src=src, t=t, crop=crop, map=m, keep=keep, zoom=zoom, cx=cx, cy=cy, sync=sync, sil=sil)
def SY(src, film_t, src_t, **k): return P(src, sync=(film_t, src_t), **k)
NO60 = (0.10, 0.12, 1, 1)

# Dialog: (film_t, clip, src_in, src_out, gain_db)
D_DISH  = (0.6,  '02_dennys_story', 14.25, 18.95, 0)     # I used to wash dishes at Denny's, busboy, waiter
D_BOOTH = (5.6,  '01_dennys_return', 42.90, 48.70, 0)    # So we came here, right here... decided to start the company
D_SHOT  = (13.4, '05_onegshot_acquired', 15.20, 21.80, 0)  # I know it's going to be perfect... we'll be out of business... We get one shot
D_BUY   = (28.6, '24_computex23_moreyoubuy', 16.60, 18.05, 2)  # The more you buy, the more you save
D_CONC  = (30.1, '28_gtc24_notconcert', 20.05, 23.95, 2)  # I hope you realize this is not a concert
D_ANN   = (34.0, '61_gtc25_open', 7.55, 10.45, 4)         # NVIDIA founder and CEO, Jensen Huang
D_W25   = (37.135, '61_gtc25_open', 20.05, 22.42, 0)        # Welcome to GTC! (walks on)
D_W26   = (44.70, '49_gtc26_techconf', 8.05, 9.95, 0)      # Welcome to GTC!
D_WDC   = (39.70, '62_dc25_open', 26.95, 28.70, 0)         # welcome to GTC (D.C.)
D_WTW   = (41.58, '50_gtctaipei26', 8.95, 11.70, 0)        # Welcome to GTC Taiwan
D_WCES  = (43.6, '63_ces26_open', 24.35, 26.05, 0)        # Welcome to CES!
D_R1    = (51.0, '60_rogan_fear', 19.25, 33.40, 2)        # the phrase 30 days... 33 years / You still feel that? Oh yeah... Every morning / But you guys are one of the biggest companies on planet earth / But the feeling doesn't change
D_R2    = (66.4, '60_rogan_fear', 34.45, 43.75, 2)        # The sense of vulnerability, uncertainty, insecurity... it doesn't leave you
DIALOG = [D_DISH, D_BOOTH, D_SHOT, D_BUY, D_CONC, D_ANN, D_W25, D_WDC, D_WTW, D_W26, D_R1, D_R2]
def lip(d, **k): return SY(d[1], d[0], d[2], **k)

# ---------------- Act 1: origins (0–13.4) ----------------
shot(0.0, 4.9, 'H2', P('01_dennys_return', 16.3, NO60, 'to', zoom=(1.0, 1.08), sil='in'), b=P('plate:tex_orange.png', m='to'), c=P('plate:diner_ref.png', m='tc'),
     text=('1993', "DENNY'S · SAN JOSE"), bg='plate:tex_orange.png')
shot(4.9, 5.6, 'H2', P('plate:diner_ref.png', m='to', zoom=(1.0, 1.04)), b=P('plate:tex_orange.png', m='to'), c=P('plate:diner_ref.png', m='tc'), bg='plate:tex_orange.png')
shot(5.6, 10.3, 'H1', lip(D_BOOTH, crop=NO60, m='to', cy=.4, sil='in'), b=P('plate:diner_ref.png'), c=P('01_dennys_return', 14.5, NO60, 'tc'))
shot(10.3, 11.6, 'H2', P('01_dennys_return', 45.2, NO60, 'to'), b=P('plate:diner_ref.png', m='tc'))
shot(11.6, 13.4, 'H2', P('01_dennys_return', 29.6, NO60, 'to', cx=.35), b=P('plate:office90s_ref.png', m='tc'),
     text=('1993', 'NVIDIA IS FOUNDED'))
# ---------------- Act 1b: one shot (13.4–20.5) ----------------
shot(13.4, 17.0, 'H4', P('plate:office90s_ref.png', m='to'), b=P('plate:die_ref.png'), c=P('plate:wafer_ref.png', m='to'),
     text=('1997', 'RIVA 128'))
shot(17.0, 20.0, 'H1', lip(D_SHOT, m='tc', crop=(0, 0, 0.6, 1), cx=.5, sil='in'), b=P('plate:die_ref.png', m='to'), c=P('plate:tex_orange.png', m='to'))
# ---------------- Act 2: the bets (20.5–34) ----------------
shot(20.0, 21.8, 'H2', P('plate:die_ref.png', m='tc', zoom=(1.0, 1.12)), b=P('plate:wafer_ref.png', m='to'), text=('1999', 'GEFORCE 256'))
shot(21.8, 23.1, 'H3', P('11_charlierose_cuda', 16.5, m='to'), b=P('plate:die_ref.png'), text=('2006', 'CUDA'))
shot(23.1, 24.4, 'H1', P('plate:racks_ref.png', m='tc'), b=P('14_gtc2015_titanx', 1.5, m='to'), c=P('plate:wafer_ref.png'),
     text=('2012', 'ALEXNET'))
shot(24.4, 25.7, 'H4', P('16_dgx1_reveal', 18.6, (0.0, 0.28, 0.42, 0.72), 'tc'), b=P('plate:racks_ref.png', m='to'),
     c=P('plate:tex_teal.png'), text=('2016', 'DGX-1'))
shot(25.7, 27.0, 'H2', P('22_kitchen', 10.5, m='to'), b=P('plate:office90s_ref.png'), text=('2020', 'THE KITCHEN KEYNOTE'))
shot(27.0, 28.4, 'H3', P('23_oven', 12.0, m='to'), b=P('plate:tex_orange.png', m='to'))
shot(28.4, 30.1, 'H1', lip(D_BUY, m='tc', crop=(0.33, 0.02, 0.67, 0.42)), b=P('plate:die_ref.png', m='to'), c=P('plate:racks_ref.png'), text=('2023', '$1 TRILLION'))
shot(30.1, 34.0, 'H2', lip(D_CONC, m='to', cy=.35), b=P('28_gtc24_notconcert', 2.5, m='tc'), c=P('plate:tex_teal.png'),
     text=('2024', 'GTC · SAN JOSE'))
# ---------------- Act 3: welcome to GTC (34–45.6) — music lift ----------------
shot(34.0, 37.135, 'FULL', P('61_gtc25_open', 13.5, m='tc', zoom=(1.0, 1.1)), b=P('solid:black'), rot=2.0)
shot(37.135, 39.643, 'H1', lip(D_W25, m='to', cx=.35, zoom=(1.05, 1.14), sil='in'), b=P('49_gtc26_techconf', 2.0, m='tc'), c=P('solid:cream'), text=('2025', 'GTC · SAN JOSE'))
shot(39.643, 41.524, 'H2', lip(D_WDC, m='tc', zoom=(1.1, 1.2)), b=P('plate:racks_ref.png', m='to'), text=('2025', 'GTC · WASHINGTON D.C.'))
shot(41.524, 44.659, 'H3', lip(D_WTW, m='to', zoom=(1.12, 1.24)), b=P('plate:taipei_ref.png', m='tc'), text=('2026', 'GTC · TAIPEI'))
shot(44.659, 46.540, 'H4', lip(D_W26, m='tc', zoom=(1.18, 1.3)), b=P('36_taiwan_fans', 21.5, (0, 0.05, 1, 0.7), 'to'), c=P('solid:black'),
     text=('2026', 'GTC · SAN JOSE'))
# ---------------- 96 days (45.6–50.6) ----------------
shot(46.540, 50.6, 'BARS', P('29_gtc24_blackwell', 21.5, m='tc', zoom=(1.05, 1.15)))
# ---------------- silence ----------------
shot(50.6, 51.6, 'BLACK', None)
# ---------------- Act 4: the fear (51.6–75.8) ----------------
shot(51.6, 56.4, 'FULL', lip(D_R1, m='tc', zoom=(1.0, 1.05), sil='in'), b=P('solid:black'), rot=1.0, push=0.03)
shot(56.4, 60.2, 'FULL', P('37_nightmarket', 25.0, (0.3, 0.0, 1, 0.72), 'to', zoom=(1.0, 1.06)), b=P('solid:black'), rot=1.0, push=0.03)
shot(60.2, 63.6, 'H2', lip(D_R1, m='tc', crop=(0.22, 0.32, 1, 1)), b=P('plate:tex_teal.png'), rot=1.5, push=0.03)
shot(63.6, 66.4, 'FULL', P('28_gtc24_notconcert', 31.5, m='to', zoom=(1.0, 1.08)), b=P('solid:black'), rot=1.0, push=0.03)
shot(66.4, 70.4, 'FULL', P('41_ces25_shield', 3.0, m='to', zoom=(1.0, 1.08)), b=P('solid:black'), rot=1.0, push=0.03)
shot(70.4, 75.8, 'FULL', lip(D_R2, m='tc', zoom=(1.0, 1.08), sil='in'), b=P('solid:black'), rot=1.0, push=0.04)
# ---------------- Coda (75.8–80) ----------------
shot(75.8, 80.0, 'END', P('28_gtc24_notconcert', 2.0, m='tc', zoom=(1.0, 1.06), sil='out'))
TITLE = (77.6, 79.7)

# Music: (film_t0, music_t0, music_t1, fade_out_s)
MUSIC = 'music/D_v2.mp3'
MUSIC_SEGS = [(0.0, 13.95, 64.55, 0.06), (51.6, 72.0, 100.4, 1.5)]
