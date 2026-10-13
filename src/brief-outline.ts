/** Deterministic brief → outline heuristic (no LLM). Used for golden-file regression. */

const REQUIRED_SECTIONS = [
  "Audience & problem",
  "Core promise",
  "Key messages",
  "Channels",
  "Launch checklist",
] as const;

export function extractProductName(brief: string): string {
  const m = brief.match(/^#\s+(.+)$/m);
  if (!m) throw new Error("Brief must start with # Title");
  return m[1].trim();
}

export function outlineFromBrief(brief: string): string {
  const product = extractProductName(brief);
  const lines = [
    `# Launch outline: ${product}`,
    "",
    ...REQUIRED_SECTIONS.map((s) => `## ${s}\n\n- TBD\n`),
  ];
  return lines.join("\n").trimEnd() + "\n";
}

export function requiredSectionTitles(): readonly string[] {
  return REQUIRED_SECTIONS;
}

export function outlineHasRequiredSections(outline: string): boolean {
  return REQUIRED_SECTIONS.every((s) =>
    outline.includes(`## ${s}`),
  );
}
