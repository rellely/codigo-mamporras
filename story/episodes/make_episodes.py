"""Writes the series episode scripts (Spanish). Run: python3 story/episodes/make_episodes.py"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
VOICES = {
    "narrator": {"voice": "em_alex", "fx": "narrator", "speed": 0.92},
    "sixth": {"voice": "em_santa", "fx": "sixth", "pitch": 0.86, "speed": 0.95},
    "hugo": {"voice": "em_santa", "fx": "hugo", "pitch": 0.94, "speed": 0.92},
    "marta": {"voice": "ef_dora", "fx": "room", "speed": 1.0},
    "sara": {"voice": "ef_dora", "fx": "room", "pitch": 1.08, "speed": 0.94},
    "leo": {"voice": "em_alex", "fx": "room", "pitch": 1.12, "speed": 0.94},
    "dani": {"voice": "em_santa", "fx": "room", "pitch": 1.16, "speed": 0.9},
    "iker": {"voice": "em_santa", "fx": "room", "pitch": 1.05, "speed": 0.95},
}
DARK = {"drone": 1.0, "cluster": 0.5}
TENSE = {"drone": 1.0, "cluster": 0.9, "pulse": 0.7}
SOFT = {"drone": 0.5, "pad": 0.3}
WARM = {"pad": 0.8, "pluck": 0.6}


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


def S(id, lines, mood, cues=(), minSeconds=4.0, tail=0.6):
    # a little extra breathing room on every beat (series pacing ~1 min)
    return {"id": id, "minSeconds": round(minSeconds + 0.5, 2), "tail": round(tail + 0.35, 2), "mood": mood, "lines": lines, "cues": list(cues)}


EPISODES = {
    "ep2": ("PARTE 2", "LA FOTO", [
        S("recap", [L("narrator", "Volvieron *cinco* del bosque.", at=0.3), L("narrator", "O eso creían.", gap=0.35)],
          {"drone": 1, "pulse": 0.6, "cluster": 0.3}, [C("boom", "boom", gain=0.9), C("sting", "sting", "line1.start", gain=0.7)], 4.6, 0.6),
        S("bedroom", [L("narrator", "Esa noche, en casa, Sara no podía *dormir*.", at=0.4), L("narrator", "Cada vez que cerraba los ojos, volvía a ver aquella *sonrisa*.", gap=0.5)], SOFT,
          [C("clock", "clock", span="scene", gain=0.5)], 4.6, 0.8),
        S("gallery", [L("narrator", "Abrió las fotos de la acampada. Una por una.", at=0.3)], {"pad": 0.4, "drone": 0.4},
          [C("swipe1", "swipe", "line0.end", 0.1, 0.6)], 4.4, 0.6),
        S("trailphoto", [L("narrator", "En la del camino, entre los árboles... había *alguien* mirando.", at=0.3)], {"drone": 0.8, "cluster": 0.4},
          [C("glitch", "glitch", "word:alguien", gain=0.5), C("sting", "sting", "word:alguien", gain=0.6)], 5.0, 0.8),
        S("tentphoto", [L("narrator", "En la de las tiendas, estaba *más cerca*.", at=0.4)], {"drone": 0.9, "cluster": 0.6},
          [C("swipe", "swipe", "start", 0.0, 0.6), C("sting", "sting", "word:más", gain=0.7)], 4.0, 0.8),
        S("firephoto", [L("narrator", "Y en la del fuego... tenía la mano en el *hombro* de Sara.", at=0.4)], {"drone": 1, "cluster": 0.8},
          [C("swipe", "swipe", "start", 0.0, 0.6), C("heart", "heartbeat", "start", 0.3, 0.7, "scene"), C("sting", "sting", "word:hombro", gain=0.9)], 5.0, 0.9),
        S("lastphoto", [L("narrator", "Pero la última foto era de *esa noche*.", at=0.4), L("narrator", "Sara, dormida. En su *cama*.", gap=0.4)], TENSE,
          [C("swipe", "swipe", "start", 0.0, 0.6), C("glitch", "glitch", "word:esa", gain=0.6), C("boom", "boom", "word:cama", gain=1.0)], 5.5, 1.0),
        S("corner", [L("narrator", "Alguien la había hecho... desde *dentro* de su habitación.", at=0.6), L("sara", "¿Hay... alguien ahí?", gap=0.9)], {"drone": 0.7, "cluster": 0.6},
          [C("heart", "heartbeat", "start", 0.0, 0.8, "scene"), C("riser", "riser", "start", 0.5, 0.5)], 5.5, 0.6),
        S("flash", [L("sixth", "Sonríe.", at=1.4, whisper=True)], {"drone": 0.2},
          [C("shutter", "shutter", "line0.end", 0.35, 1.0), C("boom", "boom", "line0.end", 0.35, 1.0)], 4.6, 1.6),
        S("end", [L("narrator", "¿Le has visto tú... en el *flash*?", at=0.4)], {"drone": 0.8, "cluster": 0.4},
          [C("boom", "boom", gain=0.8)], 4.0, 1.4),
    ]),
    "ep3": ("PARTE 3", "EL MIEMBRO NUEVO", [
        S("hook", [L("narrator", "Al día siguiente, alguien se unió al grupo de la *acampada*.", at=0.6)], {"drone": 0.8, "pulse": 0.4},
          [C("ping", "ping", gain=0.8), C("boom", "boom", "line0.end", 0.0, 0.6)], 4.6, 0.6),
        S("chat", [L("narrator", "Nadie lo había añadido.", at=2.4), L("narrator", "Y entonces... *escribió*.", gap=0.5)], {"drone": 0.7, "cluster": 0.4},
          [C("m1", "ping", "start", 0.3, 0.6), C("m2", "ping", "start", 1.3, 0.6), C("typing", "typing", "line1.start", 0.0, 0.6),
           C("m3", "ping", "line1.end", 0.5, 0.8), C("sting", "sting", "line1.end", 0.5, 0.8)], 7.0, 1.6),
        S("garage", [L("narrator", "Quedaron en el garaje de Leo. Dani llevaba toda la noche *investigando*.", at=0.4), L("leo", "Esto ya no tiene gracia, chicos.", gap=0.4)], SOFT,
          [C("whoosh", "whoosh", "start", -0.2, 0.5)], 5.0, 0.6),
        S("news", [L("dani", "Mirad esto. Es de hace veinte años.", at=0.3),
                   L("narrator", "Seis chicos acamparon junto a la misma roca. Solo volvieron *cinco*.", gap=0.4)], {"drone": 0.8, "cluster": 0.5},
          [C("typing", "typing", "start", 0.0, 0.4), C("sting", "sting", "word:cinco@1", gain=0.8)], 7.0, 0.7),
        S("hugo", [L("narrator", "El que no volvió se llamaba *Hugo*.", at=0.3), L("narrator", "Llevaba una sudadera *gris*.", gap=0.3)], {"drone": 1, "cluster": 0.8},
          [C("glitch", "glitch", "word:hugo", gain=0.5), C("boom", "boom", "word:gris", gain=0.9)], 5.0, 0.8),
        S("discuss", [L("dani", "Sus amigos dijeron que se contaron antes de irse... y les salían cinco.", at=0.3),
                      L("marta", "Se olvidaron de *él*.", gap=0.4)], {"drone": 0.7, "pad": 0.2},
          [], 6.0, 0.7),
        S("newphoto", [L("narrator", "Entonces, Hugo envió otra foto.", at=0.9), L("narrator", "Del garaje. Desde *fuera*.", gap=0.4)], TENSE,
          [C("buzz", "buzz", "start", 0.2, 0.8), C("ping", "ping", "start", 0.3, 0.8), C("boom", "boom", "word:fuera", gain=1.0)], 5.5, 0.6),
        S("window", [L("sixth", "Esta vez... contadme *bien*.", at=1.6), L("narrator", "Cuando salieron a mirar, no había nadie. Solo olía a *hoguera*.", gap=0.8)], {"drone": 1, "cluster": 1},
          [C("whoosh", "whoosh", "start", 0.3, 0.6), C("sting", "sting", "line0.start", -0.2, 0.9)], 5.0, 1.2),
        S("end", [L("narrator", "¿Qué crees que quiere *Hugo*?", at=0.4)], {"drone": 0.8, "cluster": 0.4},
          [C("boom", "boom", gain=0.8)], 4.0, 1.4),
    ]),
    "ep4": ("PARTE 4", "LA VUELTA", [
        S("hook", [L("narrator", "Volvieron al bosque. De *noche*.", at=0.3), L("narrator", "Era la única forma de acabar con esto.", gap=0.3)], {"drone": 1, "pulse": 0.5},
          [C("boom", "boom", gain=0.8), C("click", "click", "start", 0.6, 0.6), C("owl", "owl", "line1.start", 0.0, 0.5)], 5.5, 0.6),
        S("path", [L("leo", "No os separéis.", at=0.4), L("narrator", "Iker iba el último. Cada vez más *callado*.", gap=0.4)], {"drone": 0.8, "cluster": 0.3},
          [C("steps", "footsteps", "start", 0.0, 0.5, "scene"), C("crickets", "crickets", "start", 0.0, 0.2, "scene")], 6.0, 0.7),
        S("carvings", [L("narrator", "En la roca seguían grabados seis nombres.", at=0.4), L("narrator", "Uno estaba tachado: *Hugo*.", gap=0.4), L("dani", "Son los nombres de aquel grupo.", gap=0.5)], {"drone": 0.9, "cluster": 0.6},
          [C("whoosh", "whoosh", "start", 0.0, 0.5), C("sting", "sting", "word:hugo", gain=0.8)], 6.0, 0.8),
        S("fire", [L("narrator", "Encendieron el fuego en el mismo sitio que la otra vez.", at=0.4)], {"drone": 0.6, "pad": 0.3},
          [C("fire", "fire", "start", 0.4, 0.5, "scene"), C("whoosh", "whoosh", "start", 0.3, 0.6)], 4.6, 0.6),
        S("count", [L("leo", "Uno, dos, tres, cuatro, cinco.", at=0.3, slow=0.9), L("narrator", "Cinco. Todo en orden.", gap=0.4)], {"drone": 0.6, "pulse": 0.5},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("c1", "tick", "word:uno", gain=0.5), C("c2", "tick", "word:dos", gain=0.5), C("c3", "tick", "word:tres", gain=0.5),
           C("c4", "tick", "word:cuatro", gain=0.5), C("c5", "tick", "word:cinco@0", gain=0.5)], 5.5, 0.6),
        S("shadows", [L("sara", "Mirad la roca...", at=0.3), L("narrator", "Eran cinco. Pero en la roca solo había *cuatro* sombras.", gap=0.4)], TENSE,
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("sting", "sting", "word:cuatro", gain=0.9)], 6.0, 0.8),
        S("iker", [L("narrator", "A Iker le faltaba la *suya*.", at=0.3), L("iker", "¿Por qué me miráis así?", gap=0.5)], {"drone": 1, "cluster": 0.8},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("heart", "heartbeat", "start", 0.0, 0.7, "scene")], 5.0, 0.8),
        S("hugo", [L("narrator", "Hugo estaba sentado en su sitio. Y por primera vez... tenía *sombra*.", at=0.5),
                   L("narrator", "La sombra de *Iker*.", gap=0.5)], {"drone": 1, "cluster": 1, "pulse": 0.6},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("whoosh", "whoosh", "start", 0.2, 0.5), C("sting", "sting", "word:sombra", gain=0.8), C("boom", "boom", "word:iker", gain=1.0)], 7.0, 0.8),
        S("talk", [L("sixth", "Ahora me toca a mí volver a *casa*.", at=0.5)], {"drone": 1, "cluster": 0.8},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("riser", "riser", "start", 0.0, 0.6)], 4.5, 1.2),
        S("end", [L("narrator", "¿Cómo salvarías tú a *Iker*?", at=0.4)], {"drone": 0.8, "cluster": 0.4},
          [C("boom", "boom", gain=0.8)], 4.0, 1.4),
    ]),
    "ep5": ("PARTE 5", "EL INTERCAMBIO", [
        S("hook", [L("narrator", "Iker se estaba *borrando*.", at=0.3), L("narrator", "Y Hugo era cada vez más *real*.", gap=0.4)], {"drone": 1, "cluster": 0.6, "pulse": 0.5},
          [C("boom", "boom", gain=0.8), C("fire", "fire", "start", 0.0, 0.4, "scene"), C("glitch", "glitch", "word:borrando", gain=0.5)], 5.0, 0.6),
        S("approach", [L("narrator", "Hugo se levantó... y caminó hacia él.", at=0.4), L("narrator", "A cada paso, Iker se volvía más *transparente*.", gap=0.4)], {"drone": 1, "pulse": 0.8},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("steps", "footsteps", "start", 1.0, 0.4, "scene")], 4.6, 0.6),
        S("protect", [L("leo", "¡No te lo vas a *llevar*!", at=0.3), L("narrator", "Los cuatro se pusieron delante de Iker.", gap=0.4)], {"drone": 1, "cluster": 0.9, "pulse": 1},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("boom", "boom", "line0.start", 0.0, 0.8)], 3.6, 0.8),
        S("sad", [L("narrator", "Pero Hugo no parecía enfadado. Parecía... *triste*.", at=0.4), L("hugo", "Yo también estaba aquí... y se fueron *sin mí*.", gap=0.6)], {"pad": 0.5, "drone": 0.4},
          [C("fire", "fire", "start", 0.0, 0.35, "scene")], 5.0, 1.0),
        S("flashback", [L("narrator", "Hace veinte años, sus amigos se contaron con *prisas*... y se marcharon.", at=0.4),
                        L("narrator", "Hugo se quedó junto al fuego. *Esperando*.", gap=0.5)], {"pad": 0.7, "pluck": 0.3},
          [C("whoosh", "whoosh", "start", -0.2, 0.6), C("steps", "footsteps", "start", 1.5, 0.3)], 8.0, 1.0),
        S("realize", [L("narrator", "Dani lo entendió de golpe.", at=0.3), L("dani", "No quiere a Iker. Quiere que le *cuenten*.", gap=0.3)], {"drone": 0.6, "pad": 0.5},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("chime", "chime", "word:cuenten", gain=0.5)], 5.5, 0.6),
        S("hurry", [L("iker", "Chicos... no me siento las *manos*.", at=0.3), L("marta", "¡Rápido! Sentaos todos alrededor del *fuego*.", gap=0.3), L("dani", "Y dejad un sitio *libre*.", gap=0.3)], TENSE,
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("heart", "heartbeat", "start", 0.0, 0.8, "scene"), C("riser", "riser", "line1.start", 0.0, 0.6)], 5.5, 0.8),
        S("end", [L("narrator", "¿Llegarán a *tiempo*?", at=0.4)], {"drone": 0.8, "cluster": 0.4},
          [C("boom", "boom", gain=0.8)], 3.8, 1.4),
    ]),
    "ep6": ("PARTE 6", "SEIS", [
        S("hook", [L("narrator", "Se sentaron alrededor del fuego. Los *seis*.", at=0.4)], {"drone": 0.7, "pad": 0.3},
          [C("boom", "boom", gain=0.6), C("fire", "fire", "start", 0.0, 0.45, "scene")], 4.4, 0.6),
        S("count", [L("leo", "Uno, dos, tres, cuatro, cinco...", at=0.3, slow=0.88), L("leo", "y seis. *Hugo*.", gap=0.8, slow=0.9)], {"drone": 0.5, "pad": 0.5},
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("c1", "tick", "word:uno", gain=0.5), C("c2", "tick", "word:dos", gain=0.5), C("c3", "tick", "word:tres", gain=0.5),
           C("c4", "tick", "word:cuatro", gain=0.5), C("c5", "tick", "word:cinco", gain=0.5), C("c6", "chime", "word:hugo", gain=0.7)], 6.0, 0.8),
        S("reaction", [L("narrator", "Por primera vez en veinte años, alguien le había *contado*.", at=0.5), L("narrator", "Sus ojos cambiaron. Ya no daban *miedo*.", gap=0.5)], WARM,
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("magic", "magic", "start", 0.3, 0.5)], 5.0, 0.8),
        S("shadows", [L("narrator", "La sombra de Iker volvió a su sitio.", at=0.4), L("narrator", "Y Hugo, por fin, tuvo la *suya*.", gap=0.4)], WARM,
          [C("fire", "fire", "start", 0.0, 0.4, "scene"), C("whoosh", "whoosh", "start", 0.6, 0.5), C("chime", "chime", "word:suya", gain=0.6)], 6.0, 0.8),
        S("goodbye", [L("hugo", "Gracias por *contarme*.", at=0.5), L("narrator", "Y se deshizo en luz, como las chispas del fuego.", gap=0.6)], {"pad": 1.0, "pluck": 0.4},
          [C("fire", "fire", "start", 0.0, 0.35, "scene"), C("magic", "magic", "line1.start", 0.0, 0.8)], 6.5, 1.0),
        S("dawn", [L("narrator", "Al amanecer eran cinco. Cinco personas. *Cinco* sombras.", at=0.6), L("narrator", "Esta vez, nadie se quedó *atrás*.", gap=0.5)], {"pad": 0.8, "pluck": 0.6},
          [C("birds", "birds", "start", 0.2, 0.3, "scene"), C("chime", "chime", "word:cinco@0", gain=0.0)], 5.5, 0.8),
        S("epilogue", [L("narrator", "Desde entonces, cada vez que acampan, dejan un sitio libre junto al fuego.", at=0.5),
                       L("narrator", "Por si alguien necesita que le *cuenten*.", gap=0.5)], {"pad": 0.7, "pluck": 0.5, "cluster": 0.2},
          [C("fire", "fire", "start", 0.0, 0.35, "scene"), C("crickets", "crickets", "start", 0.0, 0.2, "scene"), C("chime", "chime", "line1.end", 0.3, 0.5)], 8.0, 1.2),
        S("end", [L("narrator", "¿Le habrías contado *tú*?", at=0.4)], {"pad": 0.6, "drone": 0.3},
          [C("boom", "boom", gain=0.6)], 4.0, 1.4),
    ]),
}

for slug, (part, subtitle, scenes) in EPISODES.items():
    data = {"slug": slug, "title": {"es": "EL SEXTO"}, "part": {"es": f"{part} · {subtitle}"}, "voices": {"es": VOICES},
            "langCodes": {"es": "es"}, "scenes": scenes}
    with open(os.path.join(HERE, f"{slug}.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("wrote", slug)
