# ¿Y SI…? — Estudio de vídeos animados de historia alternativa

Serie de vídeos verticales (1080×1920, 30 fps, H.264) de **historia y geografía contrafactual**, animados en 2D con
React + Remotion. Todo (personajes, escenarios, mapas, música y efectos) se genera desde código: no hay recursos de terceros.

| Episodio | Archivo final | Duración |
|---|---|---|
| ¿Y si la URSS no hubiera caído? | `output/urss.mp4` | ~1:36 |
| ¿Y si Napoleón hubiera ganado? | `output/napoleon.mp4` | ~1:21 |
| ¿Y si China invadiera Taiwán hoy? | `output/taiwan.mp4` | ~1:24 |
| ¿Y si España nunca hubiera perdido América? | `output/espana.mp4` | ~1:24 |
| ¿Y si nunca hubiera existido la Segunda Guerra Mundial? | `output/ww2.mp4` | ~1:25 |

## Estructura

```
proyecto/
├── assets/                 # carpeta pública de Remotion
│   ├── audio/narration/    # locución por episodio (Kokoro TTS, es-ES)
│   ├── audio/music/        # banda sonora original sintetizada por episodio
│   ├── audio/sfx/          # librería de efectos (síntesis procedural)
│   ├── backgrounds/        # texturas (grano, papel)
│   ├── characters/         # hojas de modelo de personajes (PNG de referencia)
│   ├── fonts/              # Anton + Montserrat (OFL)
│   └── maps/               # Natural Earth 1:50m y 1:110m (world-atlas, dominio público)
├── components/             # librería reutilizable de la serie
│   ├── Character.tsx       # rig 2D: poses, expresiones, parpadeo, habla, caminar, sombreros, objetos…
│   ├── cast.ts             # "model sheets": diseño fijo de cada personaje histórico
│   ├── World.tsx           # cámara con parallax, cielos, terreno, edificios, vehículos, ejércitos, FX
│   ├── MapView.tsx         # mapas animados reales (d3-geo): rellenos, flechas, etiquetas, globo
│   ├── Overlays.tsx        # subtítulos palabra a palabra, rótulos, cifras, transiciones, acabado
│   ├── Episode.tsx         # montaje: escenas sincronizadas con la voz, ducking de música, SFX
│   └── core.ts(x)          # utilidades de animación y fuentes
├── scenes/<id>/            # cada episodio: index.tsx (escenas), Video.tsx, timing.json
├── scripts/
│   ├── guiones/<id>.json   # guion (texto en pantalla con *resaltados* y texto hablado)
│   ├── tts.py              # FASE 6a: locución + tiempos de escenas/subtítulos
│   ├── music.py            # FASE 6b: composición de la música (sigue la curva narrativa)
│   ├── sfx.py              # FASE 6c: librería de efectos de sonido
│   ├── stills.mjs          # fotogramas de revisión
│   └── render.sh           # FASE 7: render + normalización -14 LUFS
├── src/                    # Root de Remotion (registro de composiciones)
└── output/                 # vídeos finales
```

## Flujo de trabajo

```bash
npm install
pip install kokoro-onnx soundfile scipy
# modelo de voz (una vez): scripts/models/kokoro-v1.0.onnx y voices-v1.0.bin
#   https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0

python3 scripts/sfx.py                    # efectos (una vez)
python3 scripts/tts.py urss               # voz + timing.json
python3 scripts/music.py urss             # música adaptada a la duración real
npx remotion studio src/index.ts          # previsualizar y editar
bash scripts/render.sh urss               # render final → output/urss.mp4
```

### Cambiar la voz por una locución humana o de otro servicio
1. Graba/genera el audio completo de un episodio y guárdalo como `assets/audio/narration/<id>.wav`.
2. Ajusta `scenes/<id>/timing.json` (inicio/fin de cada escena y línea, en segundos). Las animaciones están
   sincronizadas con **palabras clave** del guion (`cue.word('tanques')`), así que se reajustan solas.
3. Si cambias la duración total, vuelve a ejecutar `scripts/music.py <id>` y renderiza.

### Versión en inglés
Duplica `scripts/guiones/<id>.json` traduciendo `t`/`say`, usa una voz inglesa de Kokoro (`am_michael`, `lang: "en-us"`)
en `tts.py`, y traduce los rótulos de `scenes/<id>/index.tsx` (los textos están en los componentes `Chip`, `NameTag`,
`DateStamp` y etiquetas de mapa). Las claves de `cue.word()` deben apuntar a las palabras inglesas equivalentes.

## Identidad visual de la serie
- Estilo 2D con contorno de tinta (#1c1724), sombreado cel y cabezas algo grandes.
- Subtítulos Anton blancos en mayúsculas con contorno negro; palabras clave en amarillo (#FFD60A).
- Sello "¿Y SI…?" amarillo, transición de tinta diagonal con franja amarilla, grano y viñeta.
- Etiqueta permanente **ESCENARIO HIPOTÉTICO** en todas las escenas especulativas.
- Paleta y ambientación adaptadas a cada época (pergamino para mapas históricos, azul táctico para el presente).

## Personajes (diseños fijos, reutilizables entre episodios)
Ver `components/cast.ts` y las hojas `assets/characters/model_sheet_*.png`.
Napoleón aparece en los episodios 2 y 4 con el mismo diseño (bicornio de lado con escarapela, casaca azul con
solapas rojas, chaleco y calzón blancos, botas altas, mano en el chaleco). Stalin, Churchill, Gandhi, Bolívar,
San Martín, Fernando VII, Gorbachov, Yeltsin, Wellington, Blücher, Kutúzov, Aranda, Carlos III y Chamberlain
tienen su propia hoja. En el episodio de Taiwán se usan **personajes ficticios** (general, almirante, soldado,
ingeniera) en lugar de dirigentes reales vivos, porque los hechos narrados son hipotéticos.

Consulta `INVESTIGACION.md` para las fuentes, datos verificados y la separación entre hechos y especulación.
