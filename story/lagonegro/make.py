"""LAGO NEGRO — interactive slasher mini-series. Writes one JSON script per chapter.
Run: python3 story/lagonegro/make.py"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
VOICES = {
    "narrator": {"voice": "em_alex", "fx": "narrator", "speed": 0.92},
    "vera": {"voice": "ef_dora", "fx": "room", "pitch": 1.05, "speed": 0.92},
    "lucia": {"voice": "ef_dora", "fx": "room", "pitch": 0.98, "speed": 1.0},
    "mateo": {"voice": "em_alex", "fx": "room", "pitch": 1.1, "speed": 0.95},
    "carlos": {"voice": "em_santa", "fx": "room", "pitch": 1.14, "speed": 0.92},
    "radio": {"voice": "em_alex", "fx": "phone", "pitch": 1.1, "speed": 0.95},
}


def L(speaker, text, at=None, gap=None, **kw):
    d = {"speaker": speaker, "es": text}
    if at is not None:
        d["at"] = at
    if gap is not None:
        d["gap"] = gap
    d.update(kw)
    return d


def C(id, sound, ref="start", offset=0.0, gain=0.7, span=None):
    d = {"id": id, "sound": sound, "ref": ref, "offset": offset, "gain": gain}
    if span:
        d["span"] = span
    return d


def S(id, lines, mood, cues=(), minSeconds=4.0, tail=0.8):
    return {"id": id, "minSeconds": minSeconds, "tail": tail, "mood": mood, "lines": lines, "cues": list(cues)}


CHAPTERS = {
    "ln1": ("CAPÍTULO 1", "LA PRIMERA NOCHE", [
        S("hook", [L("narrator", "El Campamento Lago Negro cerró hace *treinta* años.", at=0.4),
                   L("narrator", "Nadie volvió a hablar de por qué.", gap=0.4)],
          {"drone": 1, "pulse": 0.5, "cluster": 0.4},
          [C("boom", "boom", gain=0.8), C("rise", "splash", "start", 1.6, 0.7), C("sting", "sting", "line1.end", 0.1, 0.9)], 6.5, 1.2),
        S("arrival", [L("narrator", "Este verano, seis monitores llegaron para *reabrirlo*.", at=0.4),
                      L("narrator", "Mateo, Lucía, Carlos, Vera, Álex y Bea.", gap=0.4)],
          {"pluck": 1, "pad": 0.5},
          [C("whoosh", "whoosh", "start", -0.2, 0.5), C("steps", "footsteps", "start", 0.2, 0.4, "scene"), C("birds", "birds", "start", 0.3, 0.35, "scene")], 7.0, 0.6),
        S("lake", [L("narrator", "El primer día fue *perfecto*.", at=0.3), L("lucia", "¡Álex, que el agua está helada!", gap=0.4)],
          {"pluck": 0.8, "pad": 0.5},
          [C("steps", "footsteps", "start", 0.3, 0.4), C("splash", "splash", "line1.end", 0.5, 0.9), C("birds", "birds", "start", 0.0, 0.25, "scene")], 6.0, 1.2),
        S("legend", [L("vera", "Dicen que el guarda del lago sigue aquí...", at=0.5),
                     L("vera", "Con su impermeable *amarillo*... y su *gancho*.", gap=0.4),
                     L("mateo", "Uy, qué miedo, Vera.", gap=0.5)],
          {"drone": 0.4, "pad": 0.4},
          [C("fire", "fire", "start", 0.0, 0.45, "scene"), C("crickets", "crickets", "start", 0.0, 0.2, "scene"), C("sting", "sting", "word:gancho", gain=0.45)], 8.0, 0.8),
        S("blackout", [L("narrator", "A medianoche, el generador se *paró*.", at=0.4), L("carlos", "Tranquilos. Voy a mirarlo.", gap=0.7)],
          {"drone": 0.7, "cluster": 0.3},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("engine", "engine", "start", 0.0, 0.25), C("off", "powerdown", "word:paró", gain=0.9)], 6.0, 1.2),
        S("shed", [L("narrator", "Carlos fue *solo*.", at=0.4)],
          {"drone": 1, "cluster": 0.8, "pulse": 0.6},
          [C("crickets", "crickets", "start", 0.0, 0.15, "scene"), C("pull", "engine", "start", 2.0, 0.35), C("scrape", "scrape", "start", 3.4, 0.8),
           C("turn", "sting", "start", 4.6, 0.8), C("drop", "thud", "start", 6.6, 0.9)], 8.0, 0.4),
        S("waiting", [L("narrator", "Pasaron diez minutos. Luego, *veinte*.", at=0.4), L("mateo", "¿Carlos? ¿Me oyes?", gap=0.5),
                      L("narrator", "Alguien *respiraba* al otro lado.", gap=2.6)],
          {"drone": 0.9, "cluster": 0.6},
          [C("fire", "fire", "start", 0.0, 0.35, "scene"), C("static", "static", "line1.end", 0.1, 0.6), C("breath", "breath", "line1.end", 0.5, 0.8)], 9.0, 0.8),
        S("reveal", [L("narrator", "Y entonces... lo *vieron*.", at=2.6)],
          {"drone": 1, "cluster": 1, "pulse": 1},
          [C("fire", "fire", "start", 0.0, 0.35, "scene"), C("roll", "thud", "start", 0.4, 0.6), C("boom", "boom", "word:vieron", gain=1.0), C("sting", "sting", "word:vieron", gain=0.9)], 6.0, 1.6),
        S("choice", [L("narrator", "¿Qué deben *hacer*?", at=0.6),
                     L("narrator", "A: huir por el bosque hasta la *carretera*.", gap=0.6),
                     L("narrator", "B: encerrarse en la *cabaña* principal.", gap=0.5),
                     L("narrator", "Tú decides. Comenta *A* o *B*.", gap=0.6)],
          {"drone": 0.8, "pulse": 0.5},
          [C("boom", "boom", gain=0.6), C("a", "tick", "line1.start", 0.0, 0.6), C("b", "tick", "line2.start", 0.0, 0.6), C("end", "boom", "line3.end", 0.3, 0.7)], 10.0, 2.0),
    ]),
}

for slug, (chap, subtitle, scenes) in CHAPTERS.items():
    data = {"slug": slug, "title": {"es": "LAGO NEGRO"}, "part": {"es": f"{chap} · {subtitle}"}, "voices": {"es": VOICES},
            "langCodes": {"es": "es"}, "scenes": scenes}
    with open(os.path.join(HERE, f"{slug}.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("wrote", slug)
