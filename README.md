# EL SEXTO / THE SIXTH ONE

Cortometraje animado 2D vertical (1080×1920, 30 fps, H.264) para TikTok, Reels y Shorts,
generado íntegramente por código: personajes SVG articulados, escenarios, cámara virtual,
voz neuronal local, música y efectos sintetizados, subtítulos sincronizados.

> *Cinco amigos se van de acampada. Esa noche, alrededor del fuego, son seis.*

## Renders

| Idioma | Archivo |
|---|---|
| Español | `renders/el-sexto-es.mp4` |
| English | `renders/the-sixth-one-en.mp4` |

## Pipeline

```
story/script.json ──► scripts/build_audio.py ──► public/audio/mix_<lang>.wav
   (guion ES/EN,         · TTS Kokoro (local)        src/generated/timeline_<lang>.json
    escenas, cues)       · procesado de voces          (escenas, líneas, tiempos por palabra, cues)
                         · tiempos por palabra                    │
                         · música adaptativa + SFX                ▼
                         · mezcla con ducking         Remotion (React + SVG) ──► MP4 H.264
                         · loudnorm FFmpeg (-14 LUFS)
```

El guion es la **única fuente de verdad**: la duración de cada escena se adapta a la
locución de cada idioma y las animaciones (flash, recuento, giros de cámara) se sincronizan
con *cues* resueltas sobre palabras concretas (`word:seis|six`, `line0.end`, …), igual que los
efectos de sonido.

## Estructura

```
story/script.json            Guion bilingüe, voces, escenas, cues de sonido
scripts/build_audio.py       TTS, alineación, música, SFX, mezcla
src/Video.tsx                Composición: audio + escenas + transiciones + subtítulos
src/lib/                     Timeline, cámara virtual, easing/keyframes
src/components/Character.tsx Personaje articulado (poses, expresiones, siluetas)
src/components/CampNight.tsx Set nocturno reutilizable (hoguera, sombras en la roca)
src/components/DawnSet.tsx   Set del amanecer (sombras proyectadas por el sol)
src/components/env/          Cielo, montañas, pinos, roca, niebla, partículas, luz
src/components/Subtitles.tsx Subtítulos estilo TikTok (palabras clave en amarillo)
src/scenes/S01…S12           Escenas independientes
```

## Uso

```bash
npm install
pip install -r requirements.txt     # descarga los modelos Kokoro a models/ la primera vez
npm run audio                       # genera voces, música, SFX y timelines (es + en)
npm run studio                      # previsualizar
npm run render:es                   # out/el-sexto-es.mp4
npm run render:en                   # out/the-sixth-one-en.mp4
```

Para una historia nueva: edita `story/script.json` (líneas, cues) y crea/reutiliza escenas
en `src/scenes/` registrándolas en `SCENES` dentro de `src/Video.tsx`.

El navegador usado para renderizar se configura en `remotion.config.ts`
(variable `REMOTION_BROWSER`).
