#!/usr/bin/env bash
# FASE 7: renderizado final 1080x1920 · 30 fps · H.264 · MP4 (+ normalización de sonoridad a -14 LUFS para redes)
# Uso: bash scripts/render.sh <id> [<id> ...]
set -e
cd "$(dirname "$0")/.."
mkdir -p output/tmp
for id in "$@"; do
  npx remotion render src/index.ts "$id" "output/tmp/$id.mp4" --concurrency=4 --crf=19 --audio-codec=aac --audio-bitrate=192k --log=error
  ffmpeg -y -v error -i "output/tmp/$id.mp4" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart "output/$id.mp4"
  rm -f "output/tmp/$id.mp4"
  echo "renderizado: output/$id.mp4"
done
rmdir output/tmp 2>/dev/null || true
