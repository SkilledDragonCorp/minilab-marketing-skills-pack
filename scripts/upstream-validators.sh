#!/usr/bin/env bash
# Clone pinned marketingskills and run upstream validate-skills.sh + regression tests.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPSTREAM_SHA="$(grep -E '^export const UPSTREAM_PINNED_SHA' "$ROOT/src/upstream.ts" | sed -E 's/.*"([0-9a-f]{40})".*/\1/')"
if [[ ! "$UPSTREAM_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Could not read UPSTREAM_PINNED_SHA from src/upstream.ts" >&2
  exit 1
fi
UPSTREAM_REPO="https://github.com/coreyhaines31/marketingskills.git"

WORK="${UPSTREAM_WORKDIR:-$ROOT/.upstream/marketingskills}"
KEEP="${UPSTREAM_KEEP:-0}"

if [[ "$KEEP" != "1" && -d "$WORK/.git" ]]; then
  rm -rf "$WORK"
fi

mkdir -p "$(dirname "$WORK")"
if [[ ! -d "$WORK/.git" ]]; then
  echo "==> Cloning marketingskills @ ${UPSTREAM_SHA}"
  rm -rf "$WORK"
  mkdir -p "$WORK"
  git -C "$WORK" init -q
  git -C "$WORK" remote add origin "$UPSTREAM_REPO"
  git -C "$WORK" fetch --depth 1 origin "$UPSTREAM_SHA"
  git -C "$WORK" checkout FETCH_HEAD -q
fi

echo "==> bash validate-skills.sh"
(cd "$WORK" && bash ./validate-skills.sh)

echo "==> bash tests/run-regression.sh"
(cd "$WORK" && bash ./tests/run-regression.sh)

echo "==> PASS: upstream validators @ ${UPSTREAM_SHA}"
