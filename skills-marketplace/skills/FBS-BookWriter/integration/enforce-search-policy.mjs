#!/usr/bin/env node
/**
 * S3 检索门禁校验：对照技能包 search-policy.json 的 chapterWriting.minQueriesPerChapter，
 * 校验本书 .fbs/search-ledger.jsonl 中该章记录，或章节 MD 内的显式检索摘要。
 *
 * 用法（技能根目录为含 references/05-ops/search-policy.json 的目录）：
 *   node integration/enforce-search-policy.mjs --skill-root . --book-root <本书根> --chapter-id ch01
 *   node integration/enforce-search-policy.mjs --skill-root . --chapter-file <path/to/chapter.md>
 *
 * 退出码：0 达标；1 未达标；2 参数/文件错误
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function parseArgs(argv) {
  const o = { skillRoot: null, bookRoot: null, chapterId: null, chapterFile: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--skill-root") o.skillRoot = argv[++i];
    else if (a === "--book-root") o.bookRoot = argv[++i];
    else if (a === "--chapter-id") o.chapterId = argv[++i];
    else if (a === "--chapter-file") o.chapterFile = argv[++i];
  }
  return o;
}

function loadPolicy(skillRoot) {
  const p = path.join(skillRoot, "references/05-ops/search-policy.json");
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const min = j.chapterWriting?.minQueriesPerChapter ?? 2;
  return { min, version: j.version };
}

function countLedger(bookRoot, chapterId) {
  const ledgerPath = path.join(bookRoot, ".fbs", "search-ledger.jsonl");
  if (!fs.existsSync(ledgerPath)) return { count: 0, source: ledgerPath, exists: false };
  const lines = fs.readFileSync(ledgerPath, "utf8").split("\n").filter((l) => l.trim());
  let count = 0;
  for (const line of lines) {
    try {
      const e = JSON.parse(line);
      if (e.chapterId !== chapterId) continue;
      if (e.kind === "search") count++;
      else if (e.query && e.kind !== "quality") count++;
    } catch {
      /* skip */
    }
  }
  return { count, source: ledgerPath, exists: true };
}

function countFootnoteDefinitionUrls(text) {
  let n = 0;
  for (const line of text.split(/\r?\n/)) {
    if (/^\[\^\d+\]:/.test(line) && /https?:\/\//i.test(line)) n++;
    if (/^\[\d+\]:\s*/.test(line) && /https?:\/\//i.test(line)) n++;
  }
  return n;
}

function markdownEvidence(text, minRequired) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (fm) {
    const m = fm[1].match(/fbs_search_queries:\s*(\d+)/);
    if (m) return { count: parseInt(m[1], 10), mode: "frontmatter:fbs_search_queries" };
  }
  const cm = /<!--\s*fbs-search-queries:\s*(\d+)\s*-->/.exec(text);
  if (cm) return { count: parseInt(cm[1], 10), mode: "html-comment" };

  const re =
    /\n##\s+(检索记录|检索与来源|检索摘要|联网检索摘要|检索(?:执行情况)?|检索执行记录|本章数据来源索引|关键数据来源(?:索引)?|数据来源索引)\s*\r?\n([\s\S]*?)(?=\r?\n##\s|$)/g;
  let maxUrls = 0;
  let maxBullets = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const block = m[2];
    const urls = (block.match(/https?:\/\/[^\s|)'"`>\]]+/gi) || []).length;
    const bullets = (block.match(/^\s*[-*]\s+\S/gm) || []).length;
    maxUrls = Math.max(maxUrls, urls);
    maxBullets = Math.max(maxBullets, bullets);
  }
  let count = 0;
  if (maxUrls >= minRequired) count = maxUrls;
  else if (maxBullets >= minRequired && maxUrls >= 1) count = minRequired;
  else count = maxUrls;

  const fn = countFootnoteDefinitionUrls(text);
  if (fn > count) count = fn;

  // 引用块 / 行内 URL 簇（兼容「> 检索记录」类块）
  const quoteUrls = (text.match(/^>\s+.*https?:\/\//gim) || []).length;
  if (quoteUrls > count) count = quoteUrls;

  return {
    count,
    mode: "markdown-section(检索*|索引)|footnote-urls|quote-urls",
    detail: { maxUrls, maxBullets, footnoteUrls: fn, quoteUrls },
  };
}

function main() {
  const args = parseArgs(process.argv);
  const skillRoot = path.resolve(args.skillRoot || process.cwd());

  let policy;
  try {
    policy = loadPolicy(skillRoot);
  } catch (e) {
    console.error("enforce-search-policy: 无法读取 search-policy.json:", e.message);
    process.exit(2);
  }

  if (args.chapterFile) {
    const chPath = path.resolve(args.chapterFile);
    if (!fs.existsSync(chPath)) {
      console.error("enforce-search-policy: 章节文件不存在:", chPath);
      process.exit(2);
    }
    const text = fs.readFileSync(chPath, "utf8");
    const ev = markdownEvidence(text, policy.min);
    if (ev.count >= policy.min) {
      console.log(
        `enforce-search-policy: 通过（${ev.mode}，等价 ${ev.count} ≥ ${policy.min}） policy v${policy.version}`
      );
      process.exit(0);
    }
    console.error(
      `enforce-search-policy: 未达标：${chPath}\n` +
        `  当前等价检索证据 ${ev.count}，需要 ≥ ${policy.min}（policy v${policy.version}）。\n` +
        `  请增加「## 检索与来源」/「## 检索执行记录」/「## 本章数据来源索引」等并列出 ≥${policy.min} 条 URL，或脚注定义行含 URL，或 YAML fbs_search_queries: N，或维护 .fbs/search-ledger.jsonl。`
    );
    process.exit(1);
  }

  if (!args.bookRoot || !args.chapterId) {
    console.error(
      "用法:\n" +
        "  node integration/enforce-search-policy.mjs --skill-root <技能根> --book-root <本书根> --chapter-id <id>\n" +
        "  node integration/enforce-search-policy.mjs --skill-root <技能根> --chapter-file <章节.md>"
    );
    process.exit(2);
  }

  const bookRoot = path.resolve(args.bookRoot);
  const { count, source, exists } = countLedger(bookRoot, args.chapterId);
  if (count >= policy.min) {
    console.log(`enforce-search-policy: 通过（账本 ${count} ≥ ${policy.min}） ${source}`);
    process.exit(0);
  }
  console.error(
    `enforce-search-policy: 未达标：章节 ${args.chapterId} 账本检索条数 ${count}，需要 ≥ ${policy.min}。\n` +
      `  账本: ${source}（存在: ${exists}） policy v${policy.version}`
  );
  process.exit(1);
}

main();
