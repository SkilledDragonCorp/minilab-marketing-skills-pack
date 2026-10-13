# Security Policy

**Built by [SkilledDragon LLC](https://skilleddragon.com)**

This is a **SkilledDragon educational minilab**, not a production product. We do **not** maintain these repos on a regular schedule and we do **not** operate a vulnerability response program for them.

## Contact

General questions: **hello@skilleddragon.com**  
Do not use a dedicated security mailbox for this repo — none exists.

## If you find an issue

- Prefer reporting **upstream** when the issue is in [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), the [`skills`](https://www.npmjs.com/package/skills) CLI, or other dependencies.
- For something specific to this minilab’s CI or scripts, you may email hello@skilleddragon.com. There is **no SLA**, and we may not patch or reply quickly.
- Do not expect private coordinated disclosure or paid bounty handling here.

## Scope / hygiene

- Never commit `.env`, API keys, or tokens.
- CI is **keyless** by default (gitleaks, `bun audit`, skills layout, upstream validators, unit tests).
- Optional `MARKETING_SKILLS_LIVE_GEMINI=1` runs a single Generative Language smoke test locally only when you supply `GEMINI_API_KEY`.

Use at your own risk. Pin versions, review skill content, and treat this as sample material.
