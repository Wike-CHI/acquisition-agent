#!/usr/bin/env node
/**
 * 将 CodeBuddy 本书记忆模板写入 --book 目录（替换 __FBS_SKILL_ROOT__）。
 * 用法：node scripts/apply-book-memory-template.mjs --book <本书根> --skill <技能包根> [--dry-run]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const o = { book: null, skill: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--book") o.book = path.resolve(argv[++i]);
    else if (a === "--skill") o.skill = path.resolve(argv[++i]);
    else if (a === "--dry-run") o.dryRun = true;
  }
  return o;
}

function displaySkillRoot(p) {
  return path.normalize(p).replace(/\\/g, "/");
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.book || !args.skill) {
    console.error(
      "用法: node scripts/apply-book-memory-template.mjs --book <本书根> --skill <技能包根> [--dry-run]"
    );
    process.exit(2);
  }
  const bookRoot = args.book;
  const skillRoot = args.skill;
  const tmplDir = path.join(skillRoot, "references/05-ops/templates/codebuddy-book-project");
  if (!fs.existsSync(tmplDir)) {
    console.error("apply-book-memory-template: 未找到模板目录:", tmplDir);
    process.exit(1);
  }
  const ref = displaySkillRoot(skillRoot);
  const subst = (s) => s.replace(/__FBS_SKILL_ROOT__/g, ref);

  const ruleSrc = path.join(tmplDir, "rules", "fbs-bookwriter-on-demand.md.template");
  if (!fs.existsSync(ruleSrc)) {
    console.error("apply-book-memory-template: 缺失", ruleSrc);
    process.exit(1);
  }
  const ruleBody = subst(fs.readFileSync(ruleSrc, "utf8"));
  const rulesDir = path.join(bookRoot, ".codebuddy", "rules");
  const ruleDest = path.join(rulesDir, "fbs-bookwriter-on-demand.md");

  const snippetSrc = path.join(tmplDir, "CODEBUDDY.snippet.md");
  if (!fs.existsSync(snippetSrc)) {
    console.error("apply-book-memory-template: 缺失", snippetSrc);
    process.exit(1);
  }
  const buddyBody = subst(fs.readFileSync(snippetSrc, "utf8"));
  const buddyDest = path.join(bookRoot, "CODEBUDDY.md");

  if (args.dryRun) {
    console.log("[dry-run] 将写入:", ruleDest);
    console.log("[dry-run] 规则文件前 400 字:\n", ruleBody.slice(0, 400), "\n...");
    console.log("[dry-run] CODEBUDDY.md:", fs.existsSync(buddyDest) ? "已存在（将跳过创建）" : "将新建");
    return;
  }

  fs.mkdirSync(rulesDir, { recursive: true });
  fs.writeFileSync(ruleDest, ruleBody, "utf8");
  console.log("apply-book-memory-template: 已写入", ruleDest);

  if (fs.existsSync(buddyDest)) {
    console.log(
      "apply-book-memory-template: 已存在 CODEBUDDY.md，请手动合并片段：",
      snippetSrc
    );
  } else {
    fs.writeFileSync(buddyDest, buddyBody, "utf8");
    console.log("apply-book-memory-template: 已创建", buddyDest);
  }
}

main();
