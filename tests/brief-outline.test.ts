import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  outlineFromBrief,
  outlineHasRequiredSections,
  requiredSectionTitles,
} from "../src/brief-outline.ts";

const ROOT = join(import.meta.dir, "..");

describe("brief → outline heuristic", () => {
  test("golden outline matches generator", () => {
    const brief = readFileSync(
      join(ROOT, "fixtures/sample-brief.md"),
      "utf8",
    );
    const golden = readFileSync(
      join(ROOT, "fixtures/outline.golden.md"),
      "utf8",
    );
    expect(outlineFromBrief(brief)).toBe(golden);
  });

  test("required sections are stable", () => {
    expect(requiredSectionTitles().length).toBe(5);
    expect(
      outlineHasRequiredSections(readFileSync(join(ROOT, "fixtures/outline.golden.md"), "utf8")),
    ).toBe(true);
  });
});
