"""FASE 6a: genera la narración (Kokoro TTS, español de España) y los tiempos de escenas/subtítulos.
Uso: python3 scripts/tts.py <id_video> [...]
Salida: assets/audio/narration/<id>.wav  y  scenes/<id>/timing.json
Para usar una locución humana: sustituye el wav por uno grabado y ajusta timing.json
(o graba línea a línea respetando los nombres de narration/<id>/lineNN.wav y ejecuta con --from-wavs)."""
import json, os, re, sys
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 24000
HEAD, GAP, TAIL = 0.25, 0.30, 0.5

def trim(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0: return x
    a = max(0, idx[0] - int(0.02*SR)); b = min(len(x), idx[-1] + int(0.06*SR))
    return x[a:b]

def words_timing(text, start, end):
    toks = text.split()
    w = []
    for t in toks:
        clean = t.replace('*', '')
        weight = len(re.sub(r'[^\wáéíóúüñÁÉÍÓÚÑ%]', '', clean)) + 1.5
        if re.search(r'[,:;]$', clean): weight += 3
        if re.search(r'[.?!…]$|\.\.\.$', clean): weight += 4
        if re.search(r'\d', clean): weight += 4 * len(re.sub(r'\D', '', clean))
        w.append(weight)
    tot = sum(w); out = []; t = start; hl = False
    for tok, wt in zip(toks, w):
        d = (end - start) * wt / tot
        starts_hl = tok.startswith('*'); ends_hl = tok.rstrip('.,:;?!¿¡…').endswith('*')
        h = hl or starts_hl
        out.append({"w": tok.replace('*', ''), "s": round(t, 3), "e": round(t + d, 3), "hl": h})
        hl = (hl or starts_hl) and not ends_hl
        t += d
    return out

def main(vid):
    g = json.load(open(f"{ROOT}/scripts/guiones/{vid}.json"))
    from kokoro_onnx import Kokoro
    k = Kokoro(f"{ROOT}/scripts/models/kokoro-v1.0.onnx", f"{ROOT}/scripts/models/voices-v1.0.bin")
    audio = []; t = 0.0; scenes = []
    for sc in g["scenes"]:
        s0 = t; lines = []
        audio.append(np.zeros(int(HEAD*SR))); t += HEAD
        for i, ln in enumerate(sc["lines"]):
            say = ln.get("say", ln["t"].replace('*', ''))
            x, sr = k.create(say, voice=g.get("voice", "em_alex"), speed=g.get("speed", 1.05), lang="es")
            x = trim(x); dur = len(x)/SR
            lines.append({"text": ln["t"], "s": round(t, 3), "e": round(t+dur, 3), "words": words_timing(ln["t"], t, t+dur)})
            audio.append(x); t += dur
            g_ = GAP if i < len(sc["lines"])-1 else sc.get("tail", TAIL)
            audio.append(np.zeros(int(g_*SR))); t += g_
        t = max(t, s0 + sc.get("min", 0))
        scenes.append({"id": sc["id"], "s": round(s0, 3), "e": round(t, 3), "lines": lines})
        print(f"  {sc['id']}: {t-s0:.1f}s")
    wav = np.concatenate(audio).astype(np.float32)
    wav = wav / max(1e-6, np.abs(wav).max()) * 0.89
    os.makedirs(f"{ROOT}/assets/audio/narration", exist_ok=True)
    sf.write(f"{ROOT}/assets/audio/narration/{vid}.wav", wav, SR)
    os.makedirs(f"{ROOT}/scenes/{vid}", exist_ok=True)
    json.dump({"id": vid, "titulo": g["titulo"], "total": round(len(wav)/SR, 3), "scenes": scenes},
              open(f"{ROOT}/scenes/{vid}/timing.json", "w"), ensure_ascii=False, indent=1)
    print(vid, "total", round(len(wav)/SR, 1), "s")

if __name__ == "__main__":
    for v in sys.argv[1:]: main(v)
