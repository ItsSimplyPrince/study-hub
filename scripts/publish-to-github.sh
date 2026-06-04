#!/usr/bin/env bash
# One-shot: sync local edits, commit, push, and trigger GitHub Pages deploy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -x "$ROOT/scripts/sync-from-local.sh" ]]; then
  "$ROOT/scripts/sync-from-local.sh"
fi

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "Run from an initialized git repo. See README.md for first-time setup."
  exit 1
fi

git add -A
if git diff --staged --quiet; then
  echo "No changes to publish."
else
  git commit -m "${1:-Update Study Hub}"
fi

if git remote get-url origin &>/dev/null; then
  git push origin main
  echo ""
  echo "Pushed. GitHub Actions will deploy in ~1–2 minutes."
  echo "Check: GitHub repo → Actions → Deploy Study Hub to GitHub Pages"
else
  echo ""
  echo "No 'origin' remote yet. Create and push once:"
  echo "  gh auth login"
  echo "  gh repo create study-hub --public --source=. --remote=origin --push"
  echo "Then enable Pages: Settings → Pages → Source → GitHub Actions"
fi
