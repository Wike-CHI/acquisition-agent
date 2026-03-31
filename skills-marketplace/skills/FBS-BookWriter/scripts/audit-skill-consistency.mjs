#!/usr/bin/env node
/**
 * FBS-BookWriter 技能包一致性审计（零依赖）
 * 用法：在技能包根目录执行  node scripts/audit-skill-consistency.mjs
 * 可选：node scripts/audit-skill-consistency.mjs --skip-packaging-pii-scan（跳过随包路径扫描，仅排障）
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SKIP_PII_SCAN = process.argv.includes("--skip-packaging-pii-scan");
const errors = [];
const warns = [];

function read(p) {
  return fs.readFileSync(p, "utf8");
}

// --- 1) search-policy.json ---
try {
  const policy = JSON.parse(read(path.join(ROOT, "references/05-ops/search-policy.json")));
  if (!Array.isArray(policy.mandatoryWebSearchStages) || !policy.mandatoryWebSearchStages.includes("S5")) {
    errors.push("search-policy.json: mandatoryWebSearchStages 须包含 S5");
  }
  if (!policy.topicLock || policy.topicLock.enabled !== true) {
    errors.push("search-policy.json: 须含 topicLock.enabled === true（主题锁定与 v1.18 对齐）");
  }
  const umi = policy.userMemoryIntegration;
  if (!umi || typeof umi !== "object") {
    errors.push("search-policy.json: 须含 userMemoryIntegration（WorkBuddy 记忆稳妥策略）");
  } else {
    if (umi.mode !== "opt_in") {
      errors.push("search-policy.json: userMemoryIntegration.mode 须为 opt_in");
    }
    if (typeof umi.injectIntoBookAs !== "string" || !umi.injectIntoBookAs.length) {
      errors.push("search-policy.json: userMemoryIntegration.injectIntoBookAs 须为非空字符串");
    }
  }
  const es = policy.environmentSnapshot;
  if (!es || typeof es !== "object") {
    errors.push("search-policy.json: 须含 environmentSnapshot（环境指纹 v1.18.5+）");
  } else {
    if (es.mode !== "opt_in") {
      errors.push("search-policy.json: environmentSnapshot.mode 须为 opt_in");
    }
    if (typeof es.relativeOutputFile !== "string" || !es.relativeOutputFile.length) {
      errors.push("search-policy.json: environmentSnapshot.relativeOutputFile 须为非空字符串");
    }
  }
} catch (e) {
  errors.push(`search-policy.json: 解析失败 ${e.message}`);
}

// --- 2) SKILL.md 关键句 ---
const skill = read(path.join(ROOT, "SKILL.md"));
if (!skill.includes("S5") || !/终审|复核/.test(skill)) {
  errors.push("SKILL.md: 应包含 S5 终审/复核检索相关表述");
}
if (!skill.includes("64")) {
  errors.push("SKILL.md: 应包含短指令条数 64 的表述");
}
if (!skill.includes("首次写书") || !skill.includes("冷启动")) {
  errors.push("SKILL.md: 应含「首次写书」与「冷启动」相关表述（宿主首启体验）");
}
if (!skill.includes("task-role-alias.md")) {
  errors.push("SKILL.md: 资源索引须含 task-role-alias.md 链接");
}
if (!skill.includes("audit-skill-consistency")) {
  errors.push("SKILL.md: 资源索引须含 audit-skill-consistency.mjs 说明");
}

// --- 3) 禁止误用「48条」（允许 section-4-commands 中历史说明）---
function walkMarkdownFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "website") continue;
      walkMarkdownFiles(p, out);
    } else if (name.name.endsWith(".md")) out.push(p);
  }
  return out;
}

for (const f of walkMarkdownFiles(ROOT)) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const text = read(f);
  if (/48条|48 条/.test(text)) {
    if (rel === "references/01-core/section-4-commands.md" && text.includes("历史文档")) continue;
    errors.push(`${rel}: 仍含「48条」计数，应改为 64 或删除误计`);
  }
}

// --- 4) 根级 stub：须含跳转标记；case-library 须为全文 ---
const ROOT_REFS = path.join(ROOT, "references");
const mustStub = [
  "quality-check.md",
  "metrics.md",
  "templates.md",
  "presets.md",
  "typography.md",
  "build.md",
  "delivery.md",
  "visual.md",
  "strategy.md",
  "points-system.md",
  "pricing.md",
  "product-framework.md",
  "risk.md",
  "team-protocol.md",
  "asset-matrix.md",
  "global.md",
  "competition.md",
  "S0-research-module.md",
  "ux-design.md",
  "persona.md",
  "keywords.md",
  "user_profile_template.md",
  "L3-semantic-interface.md",
  "quality-S.md",
  "quality-PLC.md",
];

for (const name of mustStub) {
  const p = path.join(ROOT_REFS, name);
  if (!fs.existsSync(p)) {
    errors.push(`references/${name}: 缺失`);
    continue;
  }
  const c = read(p);
  if (!/权威正文|权威版本|Canonical|兼容入口|根级兼容/.test(c)) {
    errors.push(`references/${name}: 应为 stub（含权威正文/兼容入口标记）`);
  }
}

const clPath = path.join(ROOT_REFS, "case-library.md");
const cl = read(clPath);
if (cl.length < 2000) errors.push("references/case-library.md: 过短，疑似误改为 stub");
if (!cl.includes("## 3.5")) warns.push("references/case-library.md: 建议保留 §3.5 示范案例");

// --- 5) canonical 文件须存在 ---
const mustCanonical = [
  "references/02-quality/quality-check.md",
  "references/02-quality/quality-S.md",
  "references/02-quality/quality-PLC.md",
  "references/04-business/competitors.md",
  "references/03-product/10-case-library.md",
];
for (const rel of mustCanonical) {
  if (!fs.existsSync(path.join(ROOT, rel))) errors.push(`缺失 canonical: ${rel}`);
}

const ten = read(path.join(ROOT, "references/03-product/10-case-library.md"));
if (!ten.includes("case-library.md")) {
  errors.push("03-product/10-case-library.md: 应指向根级 case-library.md");
}

// --- 6) section-4 统计表与 SKILL 条数一致 ---
const s4 = read(path.join(ROOT, "references/01-core/section-4-commands.md"));
if (!/\|\s*\*\*总计\*\*\s*\|\s*\*\*64\*\*/.test(s4)) {
  errors.push("section-4-commands.md: 统计表须含 | **总计** | **64** |");
}

// --- 7) section-3 §3.0.5 强制联网表须含 S5（与 search-policy 对齐）---
const s3wf = read(path.join(ROOT, "references/01-core/section-3-workflow.md"));
const i305 = s3wf.indexOf("## §3.0.5");
const i3055 = s3wf.indexOf("## §3.0.55");
if (i305 === -1 || i3055 === -1 || i3055 <= i305) {
  errors.push("section-3-workflow.md: 缺少 §3.0.5 / §3.0.55 锚点");
} else {
  const block305 = s3wf.slice(i305, i3055);
  if (!/\|\s*\*\*S5\*\*\s*\|/.test(block305)) {
    errors.push("section-3-workflow.md: §3.0.5 表须含 S5 行");
  }
}

// --- 8) Frontmatter 触发词片段须在正文出现（防 YAML / §0 漂移）---
const fmExec = /^---\r?\n([\s\S]*?)\r?\n---/.exec(skill);
if (fmExec) {
  const fm = fmExec[1];
  const trigM = fm.match(/触发词（精选）[:：]([^\r\n]+)/);
  if (trigM) {
    const body = skill.slice(fmExec[0].length);
    const items = trigM[1]
      .split(/[、，,]/)
      .map((s) => s.trim().replace(/[。.]+$/g, ""))
      .filter((s) => s.length >= 2);
    for (const it of items) {
      if (!body.includes(it)) {
        errors.push(`SKILL.md: Frontmatter 触发词「${it}」须在正文出现`);
      }
    }
  }
}

// --- 8b) integration 门禁/审计 CLI（与 consistency-insights 整改一致）---
for (const rel of [
  "integration/enforce-search-policy.mjs",
  "integration/quality-auditor.mjs",
  "integration/multiagent-orchestrator.mjs",
  "integration/workflow-progressor.mjs",
  "integration/workbuddy-memory-digest.mjs",
  "integration/workbuddy-environment-snapshot.mjs",
  "integration/lib/WorkbuddyMemoryDigest.js",
  "integration/lib/WorkbuddyEnvironmentSnapshot.js",
  "integration/lib/PathRedaction.js",
  "scripts/scan-packaging-pii-patterns.mjs",
  "scripts/init-project-memory.mjs",
  "references/05-ops/consistency-insights.md",
  "references/05-ops/topic-consistency-gate.md",
  "references/05-ops/workbuddy-user-memory-strategy.md",
  "references/05-ops/workbuddy-first-use-environment-tiered-strategy.md",
  "references/05-ops/multi-agent-audit-privacy-competitiveness.md",
  "references/02-quality/abbreviation-audit-lexicon.json",
  "references/05-ops/workbuddy-skill-foundation.md",
  "references/05-ops/promise-code-user-alignment.md",
  "references/05-ops/user-vs-maintainer-scope.md",
]) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) errors.push(`缺失 ${rel}`);
}

// --- 9) integration 与 C0 编排对齐（与 doc-code-consistency / search-policy 一致）---
const blc = path.join(ROOT, "integration/lib/BookLevelConsistency.js");
const bwo = path.join(ROOT, "integration/lib/BookWorkflowOrchestrator.js");
if (fs.existsSync(bwo) && !fs.existsSync(blc)) {
  errors.push("integration/lib/BookLevelConsistency.js: 缺失（S5/C0-1 编排依赖）");
}
if (fs.existsSync(bwo)) {
  const orch = read(bwo);
  if (!orch.includes("bookLevelC0") || !orch.includes("evaluateEmDashBookLevel")) {
    errors.push("BookWorkflowOrchestrator.js: 须含 S5 bookLevelC0 与 evaluateEmDashBookLevel");
  }
}
try {
  const pol = JSON.parse(read(path.join(ROOT, "references/05-ops/search-policy.json")));
  const qg = pol.qualityGate || {};
  if (!("emDashPerThousandWarnAbove" in qg) || !("emDashPerThousandBlockAbove" in qg)) {
    warns.push(
      "search-policy.json: qualityGate 须含 emDashPerThousandWarnAbove / emDashPerThousandBlockAbove（C0-1）"
    );
  }
  if (!("requireBookLevelC0" in qg)) {
    warns.push("search-policy.json: qualityGate 建议显式包含 requireBookLevelC0（默认 false）");
  }
} catch {
  /* search-policy 已有独立校验 */
}

// --- 10) 国标编校清单与 typography §十 互链 ---
const nsPath = path.join(ROOT, "references/05-ops/national-standards-editorial-checklist.md");
if (!fs.existsSync(nsPath)) {
  errors.push("缺失 references/05-ops/national-standards-editorial-checklist.md");
} else {
  const typo = read(path.join(ROOT, "references/03-product/06-typography.md"));
  if (!typo.includes("national-standards-editorial-checklist.md")) {
    errors.push("06-typography.md: §十须链接 national-standards-editorial-checklist.md");
  }
}

// --- 输出 ---
if (warns.length) {
  console.warn("—— 警告 ——");
  warns.forEach((w) => console.warn("  ⚠ " + w));
}
if (errors.length) {
  console.error("—— 失败 ——");
  errors.forEach((e) => console.error("  ✖ " + e));
  process.exit(1);
}

if (!SKIP_PII_SCAN) {
  const scan = spawnSync(process.execPath, ["scripts/scan-packaging-pii-patterns.mjs", "--fail"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (scan.status !== 0) {
    console.error(scan.stdout || scan.stderr);
    console.error("—— 失败 ——");
    console.error("  ✖ scan-packaging-pii-patterns.mjs --fail（可加 --skip-packaging-pii-scan 仅排障，勿用于发版）");
    process.exit(1);
  }
  if ((scan.stdout || "").trim()) console.log((scan.stdout || "").trim());
}

console.log("audit-skill-consistency: 通过（" + ROOT + "）");
