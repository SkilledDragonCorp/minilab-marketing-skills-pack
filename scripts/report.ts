#!/usr/bin/env bun
/**
 * Keyless, deterministic lab report → reports/skills.json + reports/skills.md
 *
 * Steps (all keyless):
 *   1. install  — verify the curated install (SKILL.md per pinned name + skills-lock.json
 *                 matches fixtures/expected-skills-lock.json). Set REPORT_INSTALL=1 to run
 *                 `bun run install:skills` first (network: npm + GitHub).
 *   2. frontmatter — name/description checks on every local skill.
 *   3. validators — `bash scripts/upstream-validators.sh` at the pinned SHA (network: git clone).
 *   4. smoke — `bun run smoke:node`.
 *
 * Network failures are recorded (pass=false + detail) and the report is still written.
 * Exit code is 1 when any step fails so CI can gate on it.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { INSTALLED_SKILL_NAMES, UPSTREAM_PINNED_SHA, UPSTREAM_REPO, UPSTREAM_SKILLS_CLI } from "../src/upstream.ts";

const ROOT = join(import.meta.dir, "..");
const LOCAL_SKILLS = join(ROOT, ".claude", "skills");
const UPSTREAM_DIR = join(ROOT, ".upstream", "marketingskills");
const UPSTREAM_SKILLS = join(UPSTREAM_DIR, "skills");
const REPORTS = join(ROOT, "reports");

type Step = { name: string; pass: boolean; elapsed_ms: number; detail: string };

function listSkillDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => statSync(join(dir, n)).isDirectory() && existsSync(join(dir, n, "SKILL.md")))
    .sort();
}

function parseFrontmatter(md: string): { name?: string; description?: string } {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const block = m[1];
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim().replace(/^"|"$/g, "");
  const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim().replace(/^"|"$/g, "");
  return { name, description };
}

function validateFrontmatter(skillsRoot: string, folder: string) {
  const path = join(skillsRoot, folder, "SKILL.md");
  const fm = parseFrontmatter(readFileSync(path, "utf8"));
  const errors: string[] = [];
  if (!fm.name) errors.push("missing name");
  else if (fm.name !== folder) errors.push(`name ${fm.name} != folder ${folder}`);
  if (!fm.description) errors.push("missing description");
  else if (fm.description.length > 1024) errors.push(`description ${fm.description.length} > 1024`);
  return { folder, ok: errors.length === 0, errors, name: fm.name ?? null, description_len: fm.description?.length ?? 0 };
}

function run(cmd: string, args: string[]) {
  const t0 = performance.now();
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1", UPSTREAM_KEEP: "1", DISABLE_TELEMETRY: "1" },
  });
  return {
    exitCode: r.status ?? 1,
    stdout: r.stdout ?? "",
    stderr: r.stderr ?? "",
    error: r.error ? String(r.error) : "",
    elapsed_ms: Math.round(performance.now() - t0),
  };
}

function tail(s: string, n = 600): string {
  return s.trim().slice(-n);
}

const t0 = performance.now();
const steps: Step[] = [];

// 1. install (verify, or run when REPORT_INSTALL=1)
{
  const t = performance.now();
  const problems: string[] = [];
  let installRan = false;
  if (process.env.REPORT_INSTALL === "1") {
    installRan = true;
    const r = run("bun", ["run", "install:skills"]);
    if (r.exitCode !== 0) problems.push(`install:skills exit ${r.exitCode}: ${tail(r.stderr || r.stdout || r.error, 300)}`);
  }
  for (const name of INSTALLED_SKILL_NAMES) {
    if (!existsSync(join(LOCAL_SKILLS, name, "SKILL.md"))) problems.push(`missing .claude/skills/${name}/SKILL.md`);
  }
  const lockPath = join(ROOT, "skills-lock.json");
  const expectedPath = join(ROOT, "fixtures", "expected-skills-lock.json");
  if (!existsSync(lockPath)) problems.push("missing skills-lock.json");
  else if (!existsSync(expectedPath)) problems.push("missing fixtures/expected-skills-lock.json");
  else {
    const got = JSON.parse(readFileSync(lockPath, "utf8"));
    const exp = JSON.parse(readFileSync(expectedPath, "utf8"));
    if (JSON.stringify(got.skills) !== JSON.stringify(exp.skills)) problems.push("skills-lock.json drifted from fixtures/expected-skills-lock.json");
  }
  if (existsSync(join(ROOT, ".agents", "skills"))) problems.push(".agents/skills duplicate present (skills live only under .claude/skills)");
  steps.push({
    name: "install",
    pass: problems.length === 0,
    elapsed_ms: Math.round(performance.now() - t),
    detail: problems.length ? problems.join("; ") : `${installRan ? "install:skills ran; " : "verified existing install; "}${INSTALLED_SKILL_NAMES.length} skills present, skills-lock.json matches fixture (${UPSTREAM_SKILLS_CLI})`,
  });
}

// 2. frontmatter (local)
const localSkills = listSkillDirs(LOCAL_SKILLS);
const localFrontmatter = localSkills.map((s) => validateFrontmatter(LOCAL_SKILLS, s));
{
  const t = performance.now();
  const bad = localFrontmatter.filter((f) => !f.ok);
  const extra = localSkills.filter((s) => !(INSTALLED_SKILL_NAMES as readonly string[]).includes(s));
  steps.push({
    name: "frontmatter",
    pass: bad.length === 0 && extra.length === 0,
    elapsed_ms: Math.round(performance.now() - t),
    detail: bad.length || extra.length
      ? [...bad.map((f) => `${f.folder}: ${f.errors.join(", ")}`), ...extra.map((s) => `${s}: not in INSTALLED_SKILL_NAMES`)].join("; ")
      : `${localSkills.length}/${localSkills.length} local SKILL.md frontmatter ok (name = folder, description ≤ 1024)`,
  });
}

// 3. upstream validators at the pinned SHA (network)
const validators = run("bash", ["scripts/upstream-validators.sh"]);
{
  const out = validators.stdout + validators.stderr + validators.error;
  const network = /could not resolve|unable to access|failed to connect|connection|timed out|network/i.test(out) && validators.exitCode !== 0;
  steps.push({
    name: "validators",
    pass: validators.exitCode === 0,
    elapsed_ms: validators.elapsed_ms,
    detail: validators.exitCode === 0
      ? `validate-skills.sh + tests/run-regression.sh PASS @ ${UPSTREAM_PINNED_SHA.slice(0, 8)}`
      : `${network ? "NETWORK FAILURE: " : ""}exit ${validators.exitCode}: ${tail(validators.stderr || validators.stdout || validators.error)}`,
  });
}
const upstreamSkills = listSkillDirs(UPSTREAM_SKILLS);
const upstreamFrontmatter = upstreamSkills.map((s) => validateFrontmatter(UPSTREAM_SKILLS, s));
const upstreamCheckedOut = existsSync(join(UPSTREAM_DIR, ".git"));
const upstreamHead = upstreamCheckedOut ? run("git", ["-C", UPSTREAM_DIR, "rev-parse", "HEAD"]).stdout.trim() : null;

// 4. node smoke
const smoke = run("bun", ["run", "smoke:node"]);
steps.push({
  name: "smoke",
  pass: smoke.exitCode === 0 && /node-smoke-ok/.test(smoke.stdout),
  elapsed_ms: smoke.elapsed_ms,
  detail: smoke.exitCode === 0 ? `smoke:node ok (${run("node", ["--version"]).stdout.trim()})` : `exit ${smoke.exitCode}: ${tail(smoke.stderr || smoke.stdout || smoke.error)}`,
});

const elapsed_ms = Math.round(performance.now() - t0);
const allPass = steps.every((s) => s.pass);
const generated_at = new Date().toISOString();

const report = {
  lab: "minilab-marketing-skills-pack",
  generated_at,
  elapsed_ms,
  pass: allPass,
  upstream: {
    repo: UPSTREAM_REPO,
    pinned_commit: UPSTREAM_PINNED_SHA,
    pinned_commit_short: UPSTREAM_PINNED_SHA.slice(0, 8),
    checked_out: upstreamCheckedOut,
    checkout_head: upstreamHead,
    checkout_matches_pin: upstreamHead === UPSTREAM_PINNED_SHA,
    skill_count: upstreamSkills.length,
    frontmatter_pass: upstreamFrontmatter.every((f) => f.ok),
    frontmatter_failures: upstreamFrontmatter.filter((f) => !f.ok).map((f) => ({ folder: f.folder, errors: f.errors })),
    skills: upstreamSkills,
  },
  local: {
    skills_dir: ".claude/skills",
    skill_count: localSkills.length,
    skills: localSkills,
    installed_names: [...INSTALLED_SKILL_NAMES],
    skills_cli: UPSTREAM_SKILLS_CLI,
    frontmatter: localFrontmatter,
  },
  steps,
  headline: {
    upstream_skill_count: upstreamSkills.length,
    local_skill_count: localSkills.length,
    validators_pass: steps.find((s) => s.name === "validators")!.pass,
    frontmatter_pass: steps.find((s) => s.name === "frontmatter")!.pass,
    install_pass: steps.find((s) => s.name === "install")!.pass,
    smoke_pass: steps.find((s) => s.name === "smoke")!.pass,
    pinned_commit_short: UPSTREAM_PINNED_SHA.slice(0, 8),
    elapsed_ms,
  },
};

mkdirSync(REPORTS, { recursive: true });
const jsonPath = join(REPORTS, "skills.json");
writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const md = [
  "# minilab-marketing-skills-pack — skills report",
  "",
  `- generated_at: \`${generated_at}\``,
  `- elapsed: ${elapsed_ms} ms`,
  `- overall: **${allPass ? "PASS" : "FAIL"}**`,
  `- upstream: ${UPSTREAM_REPO} @ \`${UPSTREAM_PINNED_SHA}\` (checkout ${upstreamCheckedOut ? (upstreamHead === UPSTREAM_PINNED_SHA ? "matches pin" : `HEAD ${upstreamHead?.slice(0, 8)} ≠ pin`) : "absent"})`,
  "",
  "| Metric | Value |",
  "| --- | ---: |",
  `| Upstream skills at pin | ${upstreamSkills.length} |`,
  `| Local skills (.claude/skills) | ${localSkills.length} |`,
  `| Upstream frontmatter ok | ${report.upstream.frontmatter_pass ? "yes" : "no"} |`,
  `| Pinned commit | \`${UPSTREAM_PINNED_SHA.slice(0, 8)}\` |`,
  "",
  "| Step | Result | ms | Detail |",
  "| --- | --- | ---: | --- |",
  ...steps.map((s) => `| ${s.name} | ${s.pass ? "PASS" : "FAIL"} | ${s.elapsed_ms} | ${s.detail.replace(/\|/g, "\\|").replace(/\s+/g, " ")} |`),
  "",
  `Local skills: ${localSkills.join(", ")}`,
  "",
].join("\n");
const mdPath = join(REPORTS, "skills.md");
writeFileSync(mdPath, md, "utf8");

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
console.log(
  `upstream=${upstreamSkills.length} local=${localSkills.length} ` +
    steps.map((s) => `${s.name}=${s.pass ? "PASS" : "FAIL"}`).join(" ") +
    ` pin=${UPSTREAM_PINNED_SHA.slice(0, 8)} elapsed=${elapsed_ms}ms`,
);
if (!allPass) process.exit(1);
