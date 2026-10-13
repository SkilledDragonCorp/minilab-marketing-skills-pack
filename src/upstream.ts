/** Pinned upstream marketingskills commit (see scripts/upstream-validators.sh). */
export const UPSTREAM_REPO =
  "https://github.com/coreyhaines31/marketingskills.git" as const;

export const UPSTREAM_PINNED_SHA = "3b84db2e3dc5a91563cc0c5ab359c5b3f7d3c9cd" as const;

export const UPSTREAM_SKILLS_CLI = "skills@1.7.2" as const;

export const INSTALLED_SKILL_NAMES = [
  "cro",
  "copywriting",
  "ai-seo",
  "launch",
] as const;

export type InstalledSkillName = (typeof INSTALLED_SKILL_NAMES)[number];

export const UPSTREAM_PASS_CRITERIA =
  "Exit code 0 from bash validate-skills.sh (all ~50 skills) and bash tests/run-regression.sh at the pinned SHA." as const;
