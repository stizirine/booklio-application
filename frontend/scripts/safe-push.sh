#!/usr/bin/env bash
set -euo pipefail

# Safe git push: run lint, tests, and build before pushing
# Usage: scripts/safe-push.sh [remote] [branch]
# Defaults: remote=origin, branch=current

remote="${1:-origin}"
branch="${2:-$(git rev-parse --abbrev-ref HEAD)}"

echo "[safe-push] Target: ${remote} ${branch}"

if ! command -v npm >/dev/null 2>&1; then
  echo "[safe-push] Error: npm not found in PATH" >&2
  exit 1
fi

echo "[safe-push] Installing dependencies (if needed)"
npm ci --legacy-peer-deps || npm install --legacy-peer-deps

echo "[safe-push] Running lint"
npm run lint

echo "[safe-push] Running tests"
npm test -- --watchAll=false --ci

echo "[safe-push] Running build"
npm run build

echo "[safe-push] Pushing ${branch} to ${remote}"
git push "${remote}" "${branch}"

echo "[safe-push] Done ✔"


