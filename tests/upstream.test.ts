import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { UPSTREAM_PINNED_SHA, UPSTREAM_REPO } from "../src/upstream.ts";

const ROOT = join(import.meta.dir, "..");

describe("upstream pin", () => {
  test("validators script reads pin from src/upstream.ts", () => {
    const script = readFileSync(
      join(ROOT, "scripts/upstream-validators.sh"),
      "utf8",
    );
    expect(script).toContain("src/upstream.ts");
    expect(script).toContain(UPSTREAM_REPO);
    const upstreamTs = readFileSync(join(ROOT, "src/upstream.ts"), "utf8");
    expect(upstreamTs).toContain(UPSTREAM_PINNED_SHA);
  });

  test("SHA is 40-char hex", () => {
    expect(UPSTREAM_PINNED_SHA).toMatch(/^[0-9a-f]{40}$/);
  });
});
