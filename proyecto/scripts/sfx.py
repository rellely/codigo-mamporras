"""Genera la librería de efectos de sonido (síntesis procedural, libre de derechos) en assets/audio/sfx."""
import os, numpy as np, soundfile as sf
from scipy import signal
SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets/audio/sfx")
rng = np.random.default_rng(7)
def t(d): return np.arange(int(d*SR))/SR
def noise(d): return rng.standard_normal(int(d*SR))
def lp(x, f, o=2): b, a = signal.butter(o, f/(SR/2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f/(SR/2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f1, f2, o=2): b, a = signal.butter(o, [f1/(SR/2), f2/(SR/2)], 'band'); return signal.lfilter(b, a, x)
def env(n, a, r, curve=3):
    e = np.ones(n); A = int(a*SR); e[:A] = np.linspace(0, 1, A) if A else 1
    rem = n - A; e[A:] = np.exp(-curve*np.linspace(0, 1, rem)) if r else 1
    return e
def verb(x, dur=1.6, mix=0.3):
    ir = noise(dur) * np.exp(-5*t(dur)/dur); ir = lp(ir, 5000)
    w = signal.fftconvolve(x, ir)[:len(x)+int(dur*SR)]
    w = w/ (np.abs(w).max()+1e-9) * np.abs(x).max()
    y = np.zeros(len(w)); y[:len(x)] += x*(1-mix); y += w*mix
    return y
def save(name, x, stereo_w=0.0):
    x = x / (np.abs(x).max()+1e-9) * 0.9
    if stereo_w:
        d = int(0.012*SR); r = np.concatenate([np.zeros(d), x])[:len(x)]
        x = np.stack([x, x*(1-stereo_w)+r*stereo_w], 1)
    sf.write(f"{OUT}/{name}.wav", x.astype(np.float32), SR)

def loopify(x, fade=0.5):
    n = int(fade*SR); a = x[:n]; b = x[-n:]; r = np.linspace(0, 1, n)
    y = x[n:-n].copy() if len(x) > 2*n else x
    head = b*(1-r) + a*r
    return np.concatenate([head, x[n:-n]])

os.makedirs(OUT, exist_ok=True)
# whoosh
d = 0.9; n = noise(d); tt = t(d); f = 300 + 2600*np.sin(np.pi*tt/d)**2
y = np.zeros_like(n); 
for i in range(0, len(n), 512):
    seg = n[i:i+512]; y[i:i+512] = bp(seg, max(100, f[i]*0.6), min(15000, f[i]*1.4), 1)
save("whoosh", y*np.sin(np.pi*tt/d)**1.5, 0.5)
# boom / explosión
d = 3.0; tt = t(d); y = lp(noise(d), 900, 2)*env(len(tt), 0.005, 1, 4) + 0.9*np.sin(2*np.pi*(55*np.exp(-tt*2))*tt)*env(len(tt), 0.002, 1, 3)
y += 0.3*lp(noise(d), 4000)*env(len(tt), 0.001, 1, 18)
save("boom", verb(y, 2.0, 0.25), 0.4)
# cañonazo
d = 2.2; tt = t(d); y = lp(noise(d), 1400)*env(len(tt), 0.001, 1, 9) + np.sin(2*np.pi*70*np.exp(-tt*3)*tt)*env(len(tt), 0.001, 1, 5)
save("cannon", verb(y, 2.5, 0.4), 0.4)
# impacto cinematográfico
d = 3.5; tt = t(d); y = np.sin(2*np.pi*(45+30*np.exp(-tt*8))*tt)*env(len(tt), 0.002, 1, 2.5) + 0.5*lp(noise(d), 2500)*env(len(tt), 0.001, 1, 25)
save("impact", verb(y, 3, 0.35), 0.3)
# taiko
d = 1.6; tt = t(d); y = np.sin(2*np.pi*(80*np.exp(-tt*4)+55)*tt)*env(len(tt), 0.002, 1, 6) + 0.25*lp(noise(d), 600)*env(len(tt), 0.001, 1, 30)
save("taiko", verb(y, 1.5, 0.3))
# choque de espadas
d = 1.4; tt = t(d); y = sum(np.sin(2*np.pi*f*tt+rng.random()*6)*np.exp(-tt*(3+k)) for k, f in enumerate([1870, 2730, 3910, 5250, 6600])) + 0.6*hp(noise(d), 3000)*env(len(tt), 0.0005, 1, 60)
save("sword", verb(y, 1.2, 0.3), 0.3)
# viento (loop)
d = 10; tt = t(d); m = 0.6+0.4*np.sin(2*np.pi*0.13*tt)*np.sin(2*np.pi*0.07*tt+1); y = bp(noise(d), 200, 1200, 1)*m + 0.3*bp(noise(d), 600, 2500, 2)*m**2
save("wind", loopify(y), 0.6)
# lluvia (loop)
d = 10; y = hp(noise(d), 1500)*0.4 + lp(noise(d), 600)*0.5
drops = np.zeros(int(d*SR)); idx = rng.integers(0, len(drops)-500, 3000)
for i in idx: drops[i:i+300] += hp(rng.standard_normal(300), 3000)*np.exp(-np.arange(300)/40)*rng.random()
save("rain", loopify(y+drops*0.8), 0.6)
# multitud (loop)
d = 10; tt = t(d); y = np.zeros(int(d*SR))
for k in range(40):
    f0 = rng.uniform(110, 260); ph = rng.random()*6
    vow = bp(noise(d), 300, 3000, 1) * (0.5+0.5*np.sin(2*np.pi*rng.uniform(1, 4)*tt+ph))
    y += vow*rng.uniform(0.3, 1)
save("crowd", loopify(lp(y, 2500)), 0.7)
# vítores
d = 4; tt = t(d); y = bp(noise(d), 500, 4000, 1)*env(len(tt), 0.3, 1, 2)
for k in range(25):
    f0 = rng.uniform(250, 600); s = rng.uniform(0, 1.2); seg = (tt > s)*np.exp(-(tt-s)*rng.uniform(1, 3))
    y += 0.15*np.sin(2*np.pi*f0*(1+0.05*np.sin(2*np.pi*6*tt))*tt)*seg*(tt > s)
save("cheer", verb(y, 1.5, 0.3), 0.7)
# mar / olas (loop)
d = 12; tt = t(d); m = 0.35+0.65*np.clip(np.sin(2*np.pi*tt/6), 0, 1)**2; y = lp(noise(d), 900)*m + 0.3*hp(noise(d), 2500)*m**3
save("sea", loopify(y), 0.6)
# marcha de pasos (loop, 2 pasos/s)
d = 8; y = np.zeros(int(d*SR))
for i in range(int(d*2.2)):
    p = int(i*SR/2.2 + rng.integers(0, 600)); L = 3000
    if p+L < len(y): y[p:p+L] += lp(rng.standard_normal(L), 900)*np.exp(-np.arange(L)/350)*(1 if i % 2 else 0.8)
save("march", loopify(verb(y, 0.8, 0.3)[:int(d*SR)]), 0.5)
# tambor militar (redoble, loop 4s)
d = 4; y = np.zeros(int(d*SR)); pat = [0, .25, .5, .625, .75, 1, 1.25, 1.5, 1.625, 1.75]
for b in range(2):
    for p in pat:
        i = int((b*2+p)*SR); L = 6000
        y[i:i+L] += (bp(rng.standard_normal(L), 1500, 6000)*0.7 + np.sin(2*np.pi*190*np.arange(L)/SR)*0.5)*np.exp(-np.arange(L)/900)
save("snare_march", verb(y, 1, 0.25)[:int(d*SR)])
# rumor de tanque (loop)
d = 8; tt = t(d); y = lp(noise(d), 180, 3)*(1+0.3*np.sin(2*np.pi*11*tt)) + 0.4*np.sin(2*np.pi*42*tt)*(1+0.2*np.sin(2*np.pi*7*tt)) + 0.15*bp(noise(d), 1500, 3000)*(0.5+0.5*np.sign(np.sin(2*np.pi*9*tt)))
save("tank", loopify(y), 0.3)
# reactor (paso de avión)
d = 3.5; tt = t(d); m = np.exp(-((tt-1.6)/0.7)**2); y = (bp(noise(d), 400, 6000, 1)*m + lp(noise(d), 300)*m)
save("jet", y, 0.8)
# sirena (loop 6s)
d = 6; tt = t(d); f = 600+250*np.sin(2*np.pi*tt/3); ph = 2*np.pi*np.cumsum(f)/SR; y = np.sign(np.sin(ph))*0.3+np.sin(ph)
save("siren", verb(lp(y, 2500), 2, 0.5)[:int(d*SR)])
# subida (riser)
d = 2.5; tt = t(d); f = 200*np.exp(tt*1.4); ph = 2*np.pi*np.cumsum(f)/SR; y = (np.sin(ph)*0.3 + hp(noise(d), 2000)*0.5)*(tt/d)**2
save("riser", verb(y, 1, 0.3), 0.5)
# pop (texto)
d = 0.15; tt = t(d); y = np.sin(2*np.pi*(900-3000*tt)*tt)*env(len(tt), 0.002, 1, 12); save("pop", y)
# ding (dato)
d = 1.5; tt = t(d); y = sum(np.sin(2*np.pi*f*tt)*np.exp(-tt*k) for f, k in [(1318, 3), (2636, 5), (3951, 8)]); save("ding", verb(y, 1.5, 0.3))
# glitch (giro "¿y si...?")
d = 0.8; y = np.zeros(int(d*SR))
for i in range(0, len(y), 1500):
    L = min(1500, len(y)-i)
    if rng.random() < 0.7:
        tone = np.sign(np.sin(2*np.pi*rng.uniform(80, 2000)*np.arange(L)/SR))*rng.uniform(0.2, 1)
        y[i:i+L] = tone if rng.random() < 0.5 else hp(rng.standard_normal(L), 1000)*0.7
save("glitch", y, 0.5)
# cohete
d = 6; tt = t(d); y = lp(noise(d), 500)*np.clip(tt/1.5, 0, 1) + 0.4*bp(noise(d), 800, 3000)*np.clip(tt/1.5, 0, 1)*(1-tt/d*0.5); save("rocket", y, 0.6)
# fuego (loop)
d = 8; y = lp(noise(d), 500)*0.5; cr = np.zeros(int(d*SR))
for i in rng.integers(0, len(cr)-400, 900): cr[i:i+200] += hp(rng.standard_normal(200), 2000)*np.exp(-np.arange(200)/30)*rng.random()
save("fire", loopify(y+cr), 0.5)
# disparos lejanos
d = 4; y = np.zeros(int(d*SR))
for s in sorted(rng.uniform(0, 3.4, 9)):
    i = int(s*SR); L = 8000; y[i:i+L] += lp(rng.standard_normal(L), 2500)*np.exp(-np.arange(L)/700)*rng.uniform(.3, 1)
save("gunfire", verb(y, 2, 0.45)[:int(d*SR)], 0.6)
# trueno
d = 5; tt = t(d); y = lp(noise(d), 300, 3)*(env(len(tt), 0.05, 1, 2.5)*(1+0.5*np.sin(2*np.pi*3*tt))) + 0.3*lp(noise(d), 3000)*env(len(tt), 0.001, 1, 30)
save("thunder", verb(y, 2, 0.3), 0.6)
# campana (Kremlin)
d = 5; tt = t(d); y = sum(a*np.sin(2*np.pi*f*tt)*np.exp(-tt*k) for f, a, k in [(196, 1, .6), (392*1.01, .6, 1), (466, .4, 1.5), (587, .3, 1.8), (784, .2, 2.5), (1050, .15, 3)])
save("bell", verb(y, 3, 0.35), 0.4)
# papel / pergamino
d = 0.7; y = bp(noise(d), 1500, 8000)*np.abs(np.sin(np.pi*t(d)/d*3))*env(int(d*SR), 0.01, 1, 3); save("paper", y)
# sello / golpe de mesa
d = 0.6; tt = t(d); y = lp(noise(d), 1500)*env(len(tt), 0.001, 1, 25)+np.sin(2*np.pi*120*tt)*env(len(tt), 0.001, 1, 20); save("stamp", verb(y, .6, .2))
# máquina de escribir/teclas
d = 1.2; y = np.zeros(int(d*SR))
for i in range(10):
    p = int((i*0.11+rng.uniform(0, .03))*SR); y[p:p+900] += hp(rng.standard_normal(900), 2500)*np.exp(-np.arange(900)/90)
save("typing", y)
# latido
d = 1.0; tt = t(d); b = lambda s: np.sin(2*np.pi*55*(tt-s))*np.exp(-np.clip(tt-s, 0, None)*14)*(tt > s)
save("heartbeat", lp(b(0)+0.7*b(0.28), 200))
# muro cayendo / derrumbe
d = 3; tt = t(d); y = lp(noise(d), 700)*env(len(tt), 0.01, 1, 2.5)
for s in rng.uniform(0, 2, 25):
    i = int(s*SR); L = 4000; y[i:i+L] += lp(rng.standard_normal(L), 2000)*np.exp(-np.arange(L)/500)*rng.uniform(.3, 1)
save("crumble", verb(y, 1.5, .3), 0.5)
# electricidad / chip (zumbido digital)
d = 2; tt = t(d); y = (np.sign(np.sin(2*np.pi*120*tt))*0.2 + np.sin(2*np.pi*2400*tt)*0.2*(np.sin(2*np.pi*8*tt) > 0))*env(len(tt), 0.05, 1, 2); save("digital", lp(y, 6000))
print("sfx ok:", len(os.listdir(OUT)))
