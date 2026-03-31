#!/usr/bin/env node
/**
 * 术语门禁（启发式）：读取 abbreviation-audit-lexicon.json + 可选 .fbs/GLOSSARY.md，
 * 统计易多义缩写在章节中的出现，供提交前人工阻断（测试报告 02 对齐）。
 *
 * 用法：
 *   node integration/terminology-gate.mjs --skill-root . --chapter-file <章.md>
 *   node integration/terminology-gate.mjs --skill-root . --book-root <本书根> --chapter-file <章.md> [--strict]
 *
 * --strict：若词库中 abbrev 在正文出现且 GLOSSARY 未包含该缩写定义行 → 退出 1
 */
import fs from "fs";
import path from "path";

function parseArgs(argv) {
  const o = { skillRoot: null, bookRoot: null, inputs: [], strict: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--skill-root") o.skillRoot = argv[++i];
    else if (a === "--book-root") o.bookRoot = argv[++i];
    else if (a === "--chapter-file") o.inputs.push(argv[++i]);
    else if (a === "--strict") o.strict = true;
  }
  return o;
}

function loadLexicon(skillRoot) {
  const p = path.join(skillRoot, "references/02-quality/abbreviation-audit-lexicon.json");
  if (!fs.existsSync(p)) return { entries: [], path: p };
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  return { entries: Array.isArray(j.entries) ? j.entries : [], path: p };
}

function loadGlossary(bookRoot) {
  if (!bookRoot) return "";
  const p = path.join(bookRoot, ".fbs", "GLOSSARY.md");
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripFences(s) {
  return s.replace(/```[\s\S]*?```/g, " ");
}

function main() {
  const args = parseArgs(process.argv);
  const skillRoot = path.resolve(args.skillRoot || process.cwd());
  if (args.inputs.length !== 1) {
    console.error("用法: node integration/terminology-gate.mjs --skill-root . [--book-root <本书根>] --chapter-file <.md> [--strict]");
    process.exit(2);
  }
  const chPath = path.resolve(args.inputs[0]);
  const text = stripFences(fs.readFileSync(chPath, "utf8"));
  const lex = loadLexicon(skillRoot);
  const gloss = loadGlossary(args.bookRoot ? path.resolve(args.bookRoot) : null);

  console.log("terminology-gate:", chPath);
  console.log("  词库:", lex.path, "条目", lex.entries.length);

  let block = false;
  for (const e of lex.entries) {
    const a = (e && e.abbrev) || "";
    if (!a || a.length > 32) continue;
    const re = new RegExp(`\\b${escapeRegExp(a)}\\b`, "g");
    const m = text.match(re);
    const count = m ? m.length : 0;
    if (count === 0) continue;
    const meanings = Array.isArray(e.ambiguousMeanings) ? e.ambiguousMeanings : [];
    console.log(`  ⚠ 多义缩写 **${a}** 出现 ${count} 次 — 候选含义：${meanings.join("；") || "（见词库）"}`);
    if (args.strict && gloss && !new RegExp(`\\|\\s*${escapeRegExp(a)}\\s*\\|`, "m").test(gloss)) {
      console.log(`    strict: .fbs/GLOSSARY.md 未出现表格行定义「| ${a} |」— 阻断`);
      block = true;
    }
  }

  process.exit(block ? 1 : 0);
}

main();
