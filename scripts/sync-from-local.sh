#!/usr/bin/env bash
# Copy the latest Study Hub files from your home directory into this deploy repo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${STUDY_HUB_SRC:-$HOME}"

cp "$SRC/study_hub.html" "$ROOT/index.html"
cp "$SRC/study_app_data.js" "$SRC/study_app_ui.js" "$ROOT/"

echo "Synced into $ROOT"
echo "  index.html"
echo "  study_app_data.js"
echo "  study_app_ui.js"
