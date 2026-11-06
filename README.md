# EL SEXTO / THE SIXTH ONE

Cortometraje animado 2D vertical (1080×1920, 30 fps, H.264) para TikTok, Reels y Shorts,
generado íntegramente por código: personajes SVG articulados, escenarios, cámara virtual,
voz neuronal local, música y efectos sintetizados, subtítulos sincronizados.

> *Cinco amigos se van de acampada. Esa noche, alrededor del fuego, son seis.*

## Renders

### Parte 1 (piloto, bilingüe)

| Idioma | Archivo |
|---|---|
| Español | `renders/el-sexto-es.mp4` |
| English | `renders/the-sixth-one-en.mp4` |

### Serie (español + inglés, ~1 min por capítulo)

Versión inglesa: `renders/the-sixth-one-part-N.mp4` (*THE SIXTH ONE*), con voz, subtítulos y
textos en pantalla en inglés.

| Parte | Título | Archivo (ES) | De qué va |
|---|---|---|---|
| 2 | La foto | `renders/el-sexto-parte-2.mp4` | En casa, Sara revisa las fotos: él aparece en todas, cada vez más cerca… y la última es de ella dormida. |
| 3 | El miembro nuevo | `renders/el-sexto-parte-3.mp4` | «?» entra en el chat del grupo. Una noticia de 2006 revela quién es: Hugo, el chico que no volvió. |
| 4 | La vuelta | `renders/el-sexto-parte-4.mp4` | Vuelven a la roca. Cinco personas, cuatro sombras: Hugo tiene la sombra de Iker. |
| 5 | El intercambio | `renders/el-sexto-parte-5.mp4` | Iker se borra. Hugo no es malvado: en 2006 sus amigos se contaron mal y lo dejaron atrás. |
| 6 | Seis | `renders/el-sexto-parte-6.mp4` | Lo cuentan a propósito. Las sombras vuelven a su sitio y Hugo se despide. Final. |

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

## Serie

- `story/episodes/make_episodes.py` genera los guiones `ep2…ep6.json` (voces por personaje,
  escenas, *mood* musical por escena y cues de sonido).
- `src/series/ep2.tsx … ep6.tsx` contienen las escenas de cada capítulo, montadas con los
  mismos personajes y sets (`CampNight`, `DawnSet`) más sets nuevos reutilizables en
  `src/components/sets/` (dormitorio, móvil/galería/chat, garaje, portátil con periódico,
  bosque nocturno con linternas, nombres grabados en la roca).
- `src/series/Episode.tsx` es la composición genérica de capítulo (audio, escenas,
  subtítulos, etiqueta «EL SEXTO · PARTE N» y tarjeta final).

```bash
npm run audio:series     # voces + música + SFX de las partes 2-6
npm run render:series    # renders/el-sexto-parte-N.mp4
npm run render:series:en # renders/the-sixth-one-part-N.mp4
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
