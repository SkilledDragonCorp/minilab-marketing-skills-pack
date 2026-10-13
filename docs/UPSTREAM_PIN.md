# Upstream pin

| Field | Value |
| --- | --- |
| Repository | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| Pinned SHA | `3b84db2e3dc5a91563cc0c5ab359c5b3f7d3c9cd` |
| Install CLI | `skills@1.7.2` |

Reproduce install:

```bash
DISABLE_TELEMETRY=1 bun --bun x skills@1.7.2 add coreyhaines31/marketingskills \
  --skill cro --skill copywriting --skill ai-seo --skill launch \
  -a claude-code -y --copy
```

Upstream validators at the pin:

```bash
bash scripts/upstream-validators.sh
```
