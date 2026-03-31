#!/usr/bin/env node
/**
 * 引用格式启发式检查（对齐 citation-format.md §禁止格式；测试报告 04）
 * 不替代人工；可挂 S3 提交前 / CI。
 *
 * 用法：
 *   node integration/citation-format-check.mjs --skill-root . --chapter-file <章.md>
 *   node integration/citation-format-check.mjs --skill-root . --glob "drafts/*.md"
 *
 * 退出码：0 无 P0；1 发现 P0 模式；2 参数错误
 */
import fs from "fs";
import path from "path";

function parseArgs(argv) {
  const o = { skillRoot: null, inputs: [], globPat: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--skill-root") o.skillRoot = argv[++i];
    else if (a === "--chapter-file") o.inputs.push(argv[++i]);
    else if (a === "--glob") o.globPat = argv[++i];
  }
  return o;
}

function expandGlobPattern(pattern) {
  const abs = path.resolve(process.cwd(), pattern);
  const dir = path.dirname(abs);
  const fn = path.basename(abs);
  if (!fn.includes("*")) return fs.existsSync(abs) ? [abs] : [];
  const re = new RegExp("^" + fn.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => re.test(f))
    .map((f) => path.join(dir, f))
    .filter((p) => fs.statSync(p).isFile());
}

/** @returns {{ p0: string[], p1: string[] }} */
function checkText(text, fileLabel) {
  const p0 = [];
  const p1 = [];
  if (/【来源[：:]/.test(text)) p0.push(`${fileLabel}: 含「【来源：」类禁止格式（改 A 级行内括注）`);
  if (/\[\^\d+\]/.test(text)) p1.push(`${fileLabel}: 含 [^n] Markdown 脚注（规范建议改为 A 级；若项目特许可忽略本行）`);
  const refDefLines = text.split(/\r?\n/).filter((l) => /^\[\d+\]:\s*\S/.test(l));
  if (refDefLines.length) p0.push(`${fileLabel}: 含 [n]: 参考文献定义（非标准；建议改为 A 级 + 本章数据来源索引）`);
  const orphanBracketNum = text.match(/\[\d{1,2}\](?!:)/g) || [];
  if (orphanBracketNum.length >= 3) p1.push(`${fileLabel}: 较多 [n] 内联编号（${orphanBracketNum.length} 处）— 核对是否有定义或改行内括注`);
  if (!/##\s*本章数据来源索引/.test(text) && (text.match(/\d+(?:\.\d+)?%/) || []).length >= 3) {
    p1.push(`${fileLabel}: 多处百分比但未见「## 本章数据来源索引」— 建议补 C 级表`);
  }
  return { p0, p1 };
}

function main() {
  const args = parseArgs(process.argv);
  const skillRoot = path.resolve(args.skillRoot || process.cwd());
  let files = [...args.inputs.map((f) => path.resolve(f))];
  if (args.globPat) files.push(...expandGlobPattern(args.globPat));
  files = [...new Set(files)].filter((f) => fs.existsSync(f));

  if (files.length === 0) {
    console.error(
      "用法: node integration/citation-format-check.mjs --skill-root . --chapter-file <.md>\n" +
        "      node integration/citation-format-check.mjs --skill-root . --glob \"*.md\""
    );
    process.exit(2);
  }

  let allP0 = [];
  let allP1 = [];
  for (const f of files) {
    const text = fs.readFileSync(f, "utf8");
    const rel = path.relative(skillRoot, f) || f;
    const { p0, p1 } = checkText(text, rel);
    allP0.push(...p0);
    allP1.push(...p1);
  }

  console.log("citation-format-check: 技能根", skillRoot);
  console.log("  文件数:", files.length);
  if (allP1.length) {
    console.log("\nP1 提示:");
    for (const x of allP1) console.log(" -", x);
  }
  if (allP0.length) {
    console.log("\nP0 禁止/高风险:");
    for (const x of allP0) console.log(" -", x);
    process.exit(1);
  }
  console.log("\n结果: 未命中 P0 禁止项（仍须人工核对 G4）");
  process.exit(0);
}

main();
