import { describe, expect, test } from "bun:test";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { INSTALLED_SKILL_NAMES } from "../src/upstream.ts";

const ROOT = join(import.meta.dir, "..");
const SKILLS_ROOT = join(ROOT, ".claude", "skills");

function parseFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const out: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
  }
  return out;
}

describe("installed marketing skills", () => {
  for (const name of INSTALLED_SKILL_NAMES) {
    test(`${name} has SKILL.md with name and description`, () => {
      const skillPath = join(SKILLS_ROOT, name, "SKILL.md");
      expect(statSync(skillPath).isFile()).toBe(true);
      const fm = parseFrontmatter(readFileSync(skillPath, "utf8"));
      expect(fm?.name).toBe(name);
      expect(fm?.description?.length).toBeGreaterThan(10);
    });
  }
});
