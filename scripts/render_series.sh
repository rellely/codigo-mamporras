#!/bin/bash
# Renders every series episode (Spanish) and exports a compact, publish-ready MP4 with FFmpeg.
# usage: scripts/render_series.sh [ep2 ep3 ...]
set -e
cd "$(dirname "$0")/.."
EPS=${@:-ep2 ep3 ep4 ep5 ep6}
mkdir -p out renders
for ep in $EPS; do
  N=${ep#ep}
  npx remotion render "ElSexto-${ep^^}" "out/el-sexto-parte-$N.mp4" --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=192k > "out/render-$ep.log" 2>&1
  ffmpeg -loglevel error -y -i "out/el-sexto-parte-$N.mp4" -c:v libx264 -preset slow -crf 23 -maxrate 9M -bufsize 18M \
    -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy "renders/el-sexto-parte-$N.mp4"
  echo "done $ep"
done
