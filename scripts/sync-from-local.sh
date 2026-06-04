#!/usr/bin/env bash
# Copy the latest Study Hub files from your home directory into this deploy repo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${STUDY_HUB_SRC:-$HOME}"

cp "$SRC/study_hub.html" "$ROOT/index.html"
cp "$SRC/study_app_data.js" "$SRC/study_app_ui.js" "$ROOT/"
mkdir -p "$ROOT/docs"
cp "$ROOT/index.html" "$ROOT/study_app_data.js" "$ROOT/study_app_ui.js" "$ROOT/.nojekyll" "$ROOT/docs/"

echo "Synced into $ROOT and $ROOT/docs/"
echo "  index.html, study_app_data.js, study_app_ui.js"
