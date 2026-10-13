# minilab-marketing-skills-pack — skills report

- generated_at: `2026-10-13T14:56:40.984Z`
- elapsed: 7868 ms
- overall: **PASS**
- upstream: https://github.com/coreyhaines31/marketingskills.git @ `3b84db2e3dc5a91563cc0c5ab359c5b3f7d3c9cd` (checkout matches pin)

| Metric | Value |
| --- | ---: |
| Upstream skills at pin | 50 |
| Local skills (.claude/skills) | 4 |
| Upstream frontmatter ok | yes |
| Pinned commit | `3b84db2e` |

| Step | Result | ms | Detail |
| --- | --- | ---: | --- |
| install | PASS | 1 | verified existing install; 4 skills present, skills-lock.json matches fixture (skills@1.7.2) |
| frontmatter | PASS | 0 | 4/4 local SKILL.md frontmatter ok (name = folder, description ≤ 1024) |
| validators | PASS | 7512 | validate-skills.sh + tests/run-regression.sh PASS @ 3b84db2e |
| smoke | PASS | 268 | smoke:node ok (v24.14.1) |

Local skills: ai-seo, copywriting, cro, launch
