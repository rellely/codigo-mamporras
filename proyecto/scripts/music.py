"""Compone y sintetiza la banda sonora original de cada vídeo (sin derechos de terceros).
La intensidad sigue la estructura narrativa (gancho, desarrollo, clímax, final) leída de scenes/<id>/timing.json.
Uso: python3 scripts/music.py <id> [...]"""
import json, os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(3)
def mtof(m): return 440*2**((m-69)/12)
def lp(x, f, o=2): b, a = signal.butter(o, min(f, SR/2-100)/(SR/2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f/(SR/2), 'high'); return signal.lfilter(b, a, x)
def adsr(n, a, d, s, r):
    A, D, R = int(a*SR), int(d*SR), int(r*SR); S = max(0, n-A-D-R)
    e = np.concatenate([np.linspace(0, 1, A), np.linspace(1, s, D), np.full(S, s), np.linspace(s, 0, R)])
    return np.pad(e, (0, max(0, n-len(e))))[:n]
def saw(f, n, ph=0):
    tt = np.arange(n)/SR; vib = 1+0.004*np.sin(2*np.pi*5.2*tt+ph)
    p = np.cumsum(f*vib/SR)+ph; return 2*(p % 1)-1

def strings(m, dur, vel=1, bright=2200):
    n = int(dur*SR); x = sum(saw(mtof(m)*(1+d), n, rng.random()) for d in (-0.006, -0.002, 0.003, 0.007))/4
    return lp(x, bright)*adsr(n, min(0.5, dur*0.4), 0.2, 0.85, min(0.6, dur*0.3))*vel
def choir(m, dur, vel=1):
    n = int(dur*SR); x = sum(saw(mtof(m)*(1+d), n, rng.random()) for d in (-0.005, 0, 0.006))/3
    y = sum(g*signal.lfilter(*signal.butter(2, [f*0.85/(SR/2), f*1.15/(SR/2)], 'band'), x) for f, g in ((700, 1), (1150, .6), (2800, .25)))
    return y*adsr(n, min(0.7, dur*0.4), 0.3, 0.9, min(0.7, dur*0.3))*vel*2.2
def brass(m, dur, vel=1):
    n = int(dur*SR); x = saw(mtof(m), n)+0.5*saw(mtof(m)*1.003, n)
    e = adsr(n, 0.06, 0.25, 0.7, 0.25); y = np.zeros(n)
    for i in range(0, n, 1024):
        fc = 500+2200*e[i]*vel; y[i:i+1024] = lp(x[i:i+1024], fc, 1)
    return y*e*vel*0.7
def bass(m, dur, vel=1):
    n = int(dur*SR); tt = np.arange(n)/SR
    return (np.sin(2*np.pi*mtof(m)*tt)+0.3*lp(saw(mtof(m), n), 400))*adsr(n, 0.02, 0.3, 0.8, 0.2)*vel
def piano(m, dur, vel=1):
    n = int(max(dur, 2.5)*SR); tt = np.arange(n)/SR; f = mtof(m)
    y = sum(a*np.sin(2*np.pi*f*k*(1+0.0004*k*k)*tt)*np.exp(-tt*(1.2+k*0.9)) for k, a in ((1, 1), (2, .5), (3, .25), (4, .12), (5, .06)))
    return y*adsr(n, 0.003, 0.05, 1, 0.3)*vel
def pluck(m, dur, vel=1):
    f = mtof(m); N = int(SR/f); n = int(max(dur, 1.5)*SR); buf = rng.uniform(-1, 1, N); y = np.zeros(n)
    for i in range(n):
        y[i] = buf[i % N]; buf[i % N] = 0.5*(buf[i % N]+buf[(i+1) % N])*0.996
    return lp(y, 3500)*vel
def pulse(m, dur, vel=1):
    n = int(dur*SR); x = saw(mtof(m), n)+saw(mtof(m)*1.01, n)
    return lp(x, 1800)*adsr(n, 0.005, 0.08, 0.3, 0.05)*vel*0.5
def drum(kind, vel=1):
    if kind == 'taiko':
        n = int(1.2*SR); tt = np.arange(n)/SR
        return (np.sin(2*np.pi*(70*np.exp(-tt*5)+50)*tt)*np.exp(-tt*5)+0.2*lp(rng.standard_normal(n), 700)*np.exp(-tt*30))*vel
    if kind == 'timp':
        n = int(1.8*SR); tt = np.arange(n)/SR
        return (np.sin(2*np.pi*73*tt)+0.4*np.sin(2*np.pi*110*tt))*np.exp(-tt*2.5)*vel*0.8
    if kind == 'snare':
        n = int(0.25*SR); tt = np.arange(n)/SR
        return (hp(rng.standard_normal(n), 1500)*0.8+0.4*np.sin(2*np.pi*190*tt))*np.exp(-tt*25)*vel*0.6
    if kind == 'kick':
        n = int(0.5*SR); tt = np.arange(n)/SR
        return np.sin(2*np.pi*(45+90*np.exp(-tt*25))*tt)*np.exp(-tt*7)*vel
    if kind == 'hat':
        n = int(0.06*SR); return hp(rng.standard_normal(n), 7000)*np.exp(-np.arange(n)/SR*60)*vel*0.25
    if kind == 'clap':
        n = int(0.2*SR); x = hp(rng.standard_normal(n), 1200)*np.exp(-np.arange(n)/SR*30)
        return x*vel*0.5
def place(buf, x, t0, pan=0.0):
    i = int(t0*SR); L = min(len(x), buf.shape[0]-i)
    if L <= 0: return
    buf[i:i+L, 0] += x[:L]*(1-max(0, pan)); buf[i:i+L, 1] += x[:L]*(1+min(0, pan))
def reverb(x, dur=2.8, mix=0.35):
    n = int(dur*SR); tt = np.arange(n)/SR; out = np.zeros_like(x)
    for c in range(2):
        ir = lp(rng.standard_normal(n), 4500)*np.exp(-tt*4.5/dur); ir /= np.sqrt((ir**2).sum())
        out[:, c] = signal.fftconvolve(x[:, c], ir)[:len(x)]
    return x*(1-mix)+out*mix*3

SPECS = {
 # tono, compás(s), progresión (raíces midi + tipo), timbres; intensidad por escena
 "urss":     dict(bpm=72, prog=[(50, 'm'), (46, 'M'), (43, 'm'), (45, 'M')], pad=choir, lead=brass, perc='timp', style='epic',
                  inten=[0.55, 0.5, 0.45, 0.6, 0.9, 1.0, 0.7, 0.85, 0.5]),
 "napoleon": dict(bpm=100, prog=[(48, 'm'), (44, 'M'), (51, 'M'), (43, 'M')], pad=strings, lead=brass, perc='march', style='march',
                  inten=[0.6, 0.75, 0.7, 0.5, 0.95, 1.0, 0.6, 0.85, 0.45]),
 "taiwan":   dict(bpm=118, prog=[(52, 'm'), (48, 'M'), (45, 'm'), (47, 'M')], pad=strings, lead=pulse, perc='modern', style='tense',
                  inten=[0.55, 0.5, 0.65, 0.8, 1.0, 0.75, 0.95, 0.7, 0.4]),
 "espana":   dict(bpm=92, prog=[(45, 'm'), (43, 'M'), (41, 'M'), (40, 'M')], pad=strings, lead=pluck, perc='flamenco', style='spanish',
                  inten=[0.6, 0.7, 0.5, 0.8, 0.95, 0.85, 0.6, 0.9, 0.45]),
 "ww2":      dict(bpm=66, prog=[(41, 'm'), (49, 'M'), (44, 'M'), (39, 'M')], pad=strings, lead=piano, perc='timp', style='somber',
                  inten=[0.45, 0.8, 0.6, 0.4, 0.3, 0.6, 0.65, 0.75, 0.45]),
}
def chord(root, q): return [root, root+(3 if q == 'm' else 4), root+7]

def compose(vid):
    tm = json.load(open(f"{ROOT}/scenes/{vid}/timing.json")); sp = SPECS[vid]
    total = tm["total"]+1.0; buf = np.zeros((int((total+4)*SR), 2))
    beat = 60/sp["bpm"]; bar = beat*4
    def inten(t):
        for i, s in enumerate(tm["scenes"]):
            if s["s"] <= t < s["e"]: return sp["inten"][min(i, len(sp["inten"])-1)]
        return sp["inten"][-1]
    nb = int(total/bar)+1
    motif = [0, 2, 1, 0]  # índice de nota del acorde por tiempo
    for b in range(nb):
        t0 = b*bar; I = inten(t0+bar/2); root, q = sp["prog"][b % len(sp["prog"])]; ch = chord(root, q)
        fade_out = max(0, min(1, (total-t0)/4))
        g = fade_out
        # colchón armónico
        for k, m in enumerate(ch):
            place(buf, sp["pad"](m+12, bar*1.05, 0.25*g*(0.6+0.4*I)), t0, pan=(k-1)*0.5)
        place(buf, bass(root-12, bar*0.98, 0.5*g), t0)
        st = sp["style"]
        if st == 'epic':
            if I > 0.55: place(buf, drum('timp', 0.7*I*g), t0); place(buf, drum('timp', 0.5*I*g), t0+beat*2.5)
            if I > 0.8:
                for k in range(4): place(buf, brass(ch[motif[k] % 3]+24, beat*0.95, 0.35*g), t0+k*beat, 0.2)
        elif st == 'march':
            for k in range(8): place(buf, drum('snare', (0.9 if k % 2 == 0 else 0.5)*I*g), t0+k*beat/2, 0.3)
            if I > 0.7: place(buf, drum('timp', 0.8*g), t0); place(buf, drum('timp', 0.6*g), t0+beat*2)
            for k in range(8): place(buf, strings(ch[k % 3]+24, beat*0.45, 0.18*g*I, 3500), t0+k*beat/2, -0.3)
            if I > 0.85:
                for k, dur in enumerate([1.5, 0.5, 1, 1]):
                    place(buf, brass(ch[motif[k] % 3]+24, beat*dur*0.95, 0.35*g), t0+sum([1.5, 0.5, 1, 1][:k])*beat)
        elif st == 'tense':
            for k in range(16): place(buf, pulse(ch[(k//2) % 3]+24, beat/4*0.9, 0.25*g*(0.5+I*0.5)), t0+k*beat/4, (k % 2-0.5)*0.6)
            for k in range(4):
                if I > 0.5: place(buf, drum('kick', 0.7*I*g), t0+k*beat)
                if I > 0.7: place(buf, drum('hat', I*g), t0+k*beat+beat/2, 0.4)
            if I > 0.85: place(buf, drum('taiko', 0.9*g), t0); place(buf, drum('taiko', 0.7*g), t0+beat*1.5); place(buf, drum('taiko', 0.8*g), t0+beat*3)
        elif st == 'spanish':
            arp = [0, 1, 2, 1, 2, 1, 0, 2]
            for k in range(8): place(buf, pluck(ch[arp[k]]+12+(12 if k == 4 else 0), beat/2, 0.45*g), t0+k*beat/2, 0.3)
            if I > 0.6:
                for k in (0, 1.5, 3, 3.5): place(buf, drum('clap', 0.7*I*g), t0+k*beat, -0.3)
                place(buf, drum('kick', 0.6*I*g), t0); place(buf, drum('kick', 0.5*I*g), t0+beat*2)
            if I > 0.85:
                for k in range(4): place(buf, brass(ch[motif[k] % 3]+24, beat*0.9, 0.25*g), t0+k*beat)
        elif st == 'somber':
            for k in range(4): place(buf, piano(ch[(k*2) % 3]+24+(12 if k == 3 else 0), beat, 0.35*g), t0+k*beat, 0.2)
            if I > 0.6: place(buf, drum('timp', 0.5*I*g), t0)
            if I > 0.7: place(buf, strings(ch[2]+24, bar, 0.2*g, 2800), t0, -0.2)
    out = reverb(buf, 2.6 if sp['style'] != 'tense' else 1.8, 0.3)[:int(total*SR)]
    fi = int(0.8*SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
    out = out/np.abs(out).max()*0.85
    os.makedirs(f"{ROOT}/assets/audio/music", exist_ok=True)
    sf.write(f"{ROOT}/assets/audio/music/{vid}.wav", out.astype(np.float32), SR)
    print(vid, "música", round(total, 1), "s")

if __name__ == "__main__":
    for v in sys.argv[1:]: compose(v)
