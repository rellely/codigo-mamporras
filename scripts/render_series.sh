#!/bin/bash
# Renders series episodes and exports compact, publish-ready MP4s with FFmpeg.
# usage: [SERIES_LANG=es|en] scripts/render_series.sh [ep2 ep3 ...]
set -e
cd "$(dirname "$0")/.."
LANGX=${SERIES_LANG:-es}
EPS=${@:-ep2 ep3 ep4 ep5 ep6}
if [ "$LANGX" = "en" ]; then COMP=TheSixthOne; NAME=the-sixth-one-part; else COMP=ElSexto; NAME=el-sexto-parte; fi
mkdir -p out renders
for ep in $EPS; do
  N=${ep#ep}
  npx remotion render "${COMP}-${ep^^}" "out/${NAME}-$N.mp4" --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=192k > "out/render-${ep}-${LANGX}.log" 2>&1
  ffmpeg -loglevel error -y -i "out/${NAME}-$N.mp4" -c:v libx264 -preset slow -crf 23 -maxrate 9M -bufsize 18M \
    -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy "renders/${NAME}-$N.mp4"
  echo "done $ep $LANGX"
done
