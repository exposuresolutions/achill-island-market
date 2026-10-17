#!/usr/bin/env bash
# Builds every screen ad MP4 (15s A Las Raices ad; small "Powered by Exposure" on the end card).
#   ad-landscape-1920x1080.mp4 / ad-portrait-1080x1920.mp4   generic ad
#   venues/<venue>-landscape.mp4 / -portrait.mp4             "Live here at <venue>" for each partner venue
# Venue list and dates come from ../data/band.js. Re-run after editing it.
set -euo pipefail
cd "$(dirname "$0")"
export PLAYWRIGHT_PATH="${PLAYWRIGHT_PATH:-/opt/node-tools/node_modules/playwright}"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
mkdir -p venues



one() { # <query> <out-prefix> <orientation>
  local o=$3 W H tmp
  if [ $o = landscape ]; then W=1920; H=1080; else W=1080; H=1920; fi
  node render.mjs "ad.html$1" "$2-$o.mp4" $W $H >/dev/null
  echo "wrote $2-$o.mp4"
}
build() { one "$1" "$2" landscape & one "$1" "$2" portrait & wait; }

build "" "ad"
mv ad-landscape.mp4 ad-landscape-1920x1080.mp4; mv ad-portrait.mp4 ad-portrait-1080x1920.mp4
node -e 'global.window={};require("../data/band.js");window.ALR.venues.filter(v=>v.party).forEach(v=>console.log(v.name))' |
while IFS= read -r v; do
  slug=$(echo "$v" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]\+/-/g; s/^-//; s/-$//')
  build "?venue=$(node -e 'console.log(encodeURIComponent(process.argv[1]))' "$v")" "venues/$slug"
done
