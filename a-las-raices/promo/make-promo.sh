#!/usr/bin/env bash
# Builds the A Las Raices promo video:
#   Exposure Solutions animated intro (3s) -> band logo intro (4s) -> best bits of each live clip (band's own sound) -> "Book the band" end card (3.5s)
#
# Usage: ./make-promo.sh <clips-folder> [portrait|landscape] [seconds-per-clip=5]
#   portrait  = 1080x1920 (Reels, TikTok, portrait screens)  [default]
#   landscape = 1920x1080 (YouTube, landscape screens)
#
# Clips are used in name order, so number them (01-intro.mp4, 02-crowd.mp4 …) to set the running order.
# Each clip is cut from 25% of the way in, which usually skips the shaky start of a phone video.
set -euo pipefail

CLIPS="${1:?clips folder}"
MODE="${2:-portrait}"
PER="${3:-5}"
HERE="$(cd "$(dirname "$0")" && pwd)"
SIGN="$HERE/../signage"
export PLAYWRIGHT_PATH="${PLAYWRIGHT_PATH:-/opt/node-tools/node_modules/playwright}"

if [ "$MODE" = landscape ]; then W=1920; H=1080; else W=1080; H=1920; fi
OUT="$HERE/promo-$MODE-${W}x${H}.mp4"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
FPS=30
ENC=(-c:v libx264 -pix_fmt yuv420p -r $FPS -crf 19 -preset medium -c:a aac -b:a 192k -ar 48000 -ac 2)
SILENT=(-f lavfi -i anullsrc=r=48000:cl=stereo)

echo "Rendering intro and end card…"
node "$SIGN/render.mjs" "$SIGN/exposure-intro.html" "$WORK/xintro-v.mp4" $W $H 3 $FPS 0 >/dev/null
node "$SIGN/render.mjs" "$SIGN/ad.html" "$WORK/intro-v.mp4" $W $H 4 $FPS 0 >/dev/null
node "$SIGN/render.mjs" "$SIGN/ad.html" "$WORK/outro-v.mp4" $W $H 3.5 $FPS 11.5 >/dev/null
ffmpeg -nostdin -loglevel error -y -i "$WORK/xintro-v.mp4" "${SILENT[@]}" -shortest "${ENC[@]}" "$WORK/000.mp4"
ffmpeg -nostdin -loglevel error -y -i "$WORK/intro-v.mp4" "${SILENT[@]}" -shortest "${ENC[@]}" "$WORK/00.mp4"

i=1
shopt -s nullglob nocaseglob
for f in "$CLIPS"/*.{mp4,mov,m4v,webm,mkv}; do
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  ss=$(awk -v d="$dur" -v p="$PER" 'BEGIN{s=d*0.25; if (s+p>d) s=d-p; if (s<0) s=0; printf "%.2f", s}')
  len=$(awk -v d="$dur" -v p="$PER" 'BEGIN{printf "%.2f", (d<p?d:p)}')
  fo=$(awk -v l="$len" 'BEGIN{printf "%.2f", l-0.4}')
  n=$(printf "%02d" $i)
  echo "Clip $n: $(basename "$f") (from ${ss}s, ${len}s)"
  vf="scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,setsar=1,fps=$FPS,eq=contrast=1.06:saturation=1.08,fade=t=in:st=0:d=0.3,fade=t=out:st=$fo:d=0.4"
  af="afade=t=in:st=0:d=0.3,afade=t=out:st=$fo:d=0.4,loudnorm=I=-16:TP=-1.5"
  if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$f" | grep -q .; then
    ffmpeg -nostdin -loglevel error -y -ss "$ss" -t "$len" -i "$f" -vf "$vf" -af "$af" "${ENC[@]}" "$WORK/$n.mp4"
  else
    ffmpeg -nostdin -loglevel error -y -ss "$ss" -t "$len" -i "$f" "${SILENT[@]}" -vf "$vf" -map 0:v -map 1:a -shortest "${ENC[@]}" "$WORK/$n.mp4"
  fi
  i=$((i+1))
done
[ $i -gt 1 ] || { echo "No video clips found in $CLIPS"; exit 1; }

ffmpeg -nostdin -loglevel error -y -i "$WORK/outro-v.mp4" "${SILENT[@]}" -shortest "${ENC[@]}" "$WORK/99.mp4"

{ echo "$WORK/000.mp4"; ls "$WORK"/[0-9][0-9].mp4; } | sed "s/^/file '/; s/$/'/" > "$WORK/list.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$WORK/list.txt" -c copy -movflags +faststart "$OUT"
echo "Done: $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT" | cut -d. -f1)s)"
