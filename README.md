# minilab-marketing-skills-pack

**Built by [SkilledDragon LLC](https://skilleddragon.com)** — install a curated subset of [Marketing Skills](https://github.com/coreyhaines31/marketingskills) (MIT) into `.claude/skills/`, pin upstream, and run upstream validators plus local frontmatter checks.

Featured upstream: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) · CLI: [`skills@1.7.2`](https://www.npmjs.com/package/skills) · Pin: [`3b84db2e`](docs/UPSTREAM_PIN.md)

## Included skills

| Skill | Path | Focus |
| --- | --- | --- |
| `cro` | `.claude/skills/cro/` | Conversion rate optimization for pages and forms |
| `copywriting` | `.claude/skills/copywriting/` | Marketing copy frameworks and voice |
| `ai-seo` | `.claude/skills/ai-seo/` | AI-era SEO and citation-oriented content |
| `launch` | `.claude/skills/launch/` | Product and site launch checklists |

Each skill ships with upstream `references/` and `evals/` where the source repo provides them.

## What we built

| Piece | Purpose |
| --- | --- |
| `.claude/skills/{cro,copywriting,ai-seo,launch}/` | Committed copies installed via `skills` CLI |
| `skills-lock.json` + `fixtures/expected-skills-lock.json` | Detect unintended upstream drift |
| `scripts/upstream-validators.sh` | Clone pinned SHA → `validate-skills.sh` + `tests/run-regression.sh` |
| `scripts/install-marketing-skills.sh` | Re-install the four skills and verify lock file |
| `src/brief-outline.ts` | Keyless brief → outline heuristic + golden fixture |
| CI | `bun test`, `check:skills`, gitleaks 8.30.1, `bun audit`, upstream validators |

## Setup

- **Node** `>=24` (see `.nvmrc` → `24`)
- **Bun** `>=1.2.0`

```bash
nvm use   # or fnm / mise
bun install
```

No API keys are required for CI or default tests. Copy `.env.example` to `.env` only if you enable the optional Gemini live slice locally.

## Tutorial

1. **Verify layout** (frontmatter `name` + `description` on all four skills):

   ```bash
   bun run check:skills
   ```

2. **Run upstream validators** at the pinned commit (~50 skills + regression fixtures):

   ```bash
   bash scripts/upstream-validators.sh
   ```

3. **Run local tests** (frontmatter, pin consistency, brief → outline golden):

   ```bash
   bun test
   ```

4. **Re-install from upstream** after bumping the pin in `src/upstream.ts` and `docs/UPSTREAM_PIN.md`:

   ```bash
   bash scripts/install-marketing-skills.sh
   bun run check:skills && bun test && bash scripts/upstream-validators.sh
   ```

5. **Add more skills** — extend the install script with additional `--skill <name>` flags (see [upstream `skills/` tree](https://github.com/coreyhaines31/marketingskills/tree/main/skills)), update `INSTALLED_SKILL_NAMES` in `src/upstream.ts`, refresh `fixtures/expected-skills-lock.json`, and re-run validators. Use `-a claude-code` so files land under `.claude/skills/`, not `.agents/skills`.

   ```bash
   DISABLE_TELEMETRY=1 bun --bun x skills@1.7.2 add coreyhaines31/marketingskills \
     --skill <new-skill> -a claude-code -y --copy
   ```

   **Claude Code plugin note:** upstream documents `/plugin` for interactive installs. CI and this lab use the **skills CLI** only (non-interactive, reproducible).

## Test results (local, Oct 13 2026)

```text
$ bun install && bun test && bun run check:skills && bun audit
$ bash scripts/upstream-validators.sh
$ gitleaks detect --source . --redact --verbose --no-banner

bun test v1.4.2
 8 pass, 1 skip (optional GEMINI live), 0 fail

bun run check:skills — OK cro, copywriting, ai-seo, launch

bun audit — no vulnerabilities (5 packages)

upstream @ 3b84db2e — validate-skills: 50 passed; regression: 4/4 passed

gitleaks 8.30.1 — no leaks found
```

## Using these skills in Claude Code and Cursor

- **Claude Code:** open this repo as the project root. Skills load from `.claude/skills/<name>/SKILL.md`.
- **Cursor:** use the same `.claude/skills/` paths in your workspace. Do **not** duplicate under `.agents/skills` or `.cursor/skills` for this minilab standard.

Invoke by name in chat (e.g. “use the cro skill on this landing page URL”) or `@` the skill folder when your client supports it.

## API keys

| Variable | Required | Purpose |
| --- | --- | --- |
| *(none)* | No | CI, upstream validators, layout checks, brief heuristic |
| `GEMINI_API_KEY` | Optional | Only when `MARKETING_SKILLS_LIVE_GEMINI=1` for `tests/gemini-live.test.ts` |
| `MARKETING_SKILLS_LIVE_GEMINI` | Optional | Default off (`0` / unset). Set to `1` to run the live Gemini smoke test locally |

Get a Gemini key from [Google AI Studio](https://aistudio.google.com/apikey) if you enable the optional slice.

## Security

See [SECURITY.md](SECURITY.md). Contact: **hello@skilleddragon.com** only.

## License

MIT — see [LICENSE](LICENSE). Upstream [marketingskills](https://github.com/coreyhaines31/marketingskills) is MIT separately.
