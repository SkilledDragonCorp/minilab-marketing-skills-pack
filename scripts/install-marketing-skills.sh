#!/usr/bin/env bash
# Re-install the curated subset from coreyhaines31/marketingskills into .claude/skills/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DISABLE_TELEMETRY=1 bun --bun x skills@1.7.2 add coreyhaines31/marketingskills \
  --skill cro \
  --skill copywriting \
  --skill ai-seo \
  --skill launch \
  -a claude-code \
  -y \
  --copy

EXPECTED="$ROOT/fixtures/expected-skills-lock.json"
if [[ ! -f skills-lock.json ]]; then
  echo "Missing skills-lock.json" >&2
  exit 1
fi

python3 - <<'PY' "$EXPECTED" "$ROOT/skills-lock.json"
import json, sys
exp, got = sys.argv[1], sys.argv[2]
with open(exp) as f: e = json.load(f)
with open(got) as f: g = json.load(f)
if e.get("skills") != g.get("skills"):
    print("skills-lock.json mismatch — update fixtures/expected-skills-lock.json if upstream changed deliberately", file=sys.stderr)
    sys.exit(1)
print("skills-lock.json OK")
PY

for skill in cro copywriting ai-seo launch; do
  if [[ ! -f ".claude/skills/$skill/SKILL.md" ]]; then
    echo "Missing .claude/skills/$skill/SKILL.md" >&2
    exit 1
  fi
done

rm -rf .agents 2>/dev/null || true
echo "Marketing skills install OK"
