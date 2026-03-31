#!/usr/bin/env node
/**
 * S5 质量审计（启发式）：对 Markdown 做 S/P/C/B 向量化扫描，输出 Markdown 报告骨架。
 * 非 CY/T 国标全文引擎；不替代人工终审与 quality-check.md。
 *
 * 用法：
 *   node integration/quality-auditor.mjs --skill-root . --inputs a.md b.md
 *   node integration/quality-auditor.mjs --skill-root . --glob "chapters/*.md"
 *   node integration/quality-auditor.mjs --skill-root . --stdin < manuscript.md
 *
 * 可选：--out report.md
 */
import fs from "fs";
import path from "path";

function parseArgs(argv) {
  const o = {
    skillRoot: null,
    inputs: [],
    globPat: null,
    stdin: false,
    out: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--skill-root") o.skillRoot = argv[++i];
    else if (a === "--inputs") {
      while (argv[i + 1] && !argv[i + 1].startsWith("--")) o.inputs.push(argv[++i]);
    } else if (a === "--glob") o.globPat = argv[++i];
    else if (a === "--stdin") o.stdin = true;
    else if (a === "--out") o.out = argv[++i];
  }
  return o;
}

function loadQualityGate(skillRoot) {
  try {
    const p = path.join(skillRoot, "references/05-ops/search-policy.json");
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return j.qualityGate || {};
  } catch {
    return {};
  }
}

/** C0-2：从词库读取易多义缩写，不在此文件写死具体 abbrev */
function loadAbbrevLexicon(skillRoot) {
  const p = path.join(skillRoot, "references/02-quality/abbreviation-audit-lexicon.json");
  if (!fs.existsSync(p)) return { entries: [], path: p };
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return { entries: Array.isArray(j.entries) ? j.entries : [], path: p };
  } catch {
    return { entries: [], path: p };
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 测试报告 09：疑似「伪精确」商业/货币表述（启发式，须人工核对来源） */
function scanPseudoPrecision(body) {
  const hits = [];
  const reUsd = /\$\s*\d+(?:,\d{3})*(?:\.\d+)?(?:\s*\/\s*(?:月|年|用户|次))?/g;
  let m;
  const s = body;
  while ((m = reUsd.exec(s)) !== null) {
    const ctx = s.slice(Math.max(0, m.index - 80), Math.min(s.length, m.index + 80));
    if (/来源|待核实|估算|假设|案例|示例/.test(ctx)) continue;
    hits.push({ kind: "usd-like", match: m[0], offset: m.index });
  }
  const reRev = /\b(?:收入|营收|ARR|MRR)\s*(?:占|为|达)?\s*\d{1,3}%/g;
  while ((m = reRev.exec(s)) !== null) {
    hits.push({ kind: "revenue-pct", match: m[0], offset: m.index });
  }
  return hits.slice(0, 40);
}

/** @returns {Array<{ abbrev: string, count: number, meanings: string[] }>} */
function countLexiconHits(text, entries) {
  const body = stripCodeFences(text);
  const out = [];
  for (const e of entries) {
    const a = (e && e.abbrev) || "";
    if (!a || a.length > 32) continue;
    const re = new RegExp(`\\b${escapeRegExp(a)}\\b`, "g");
    const m = body.match(re);
    const count = m ? m.length : 0;
    if (count > 0)
      out.push({
        abbrev: a,
        count,
        meanings: Array.isArray(e.ambiguousMeanings) ? e.ambiguousMeanings : [],
      });
  }
  return out;
}

function stripCodeFences(s) {
  return s.replace(/```[\s\S]*?```/g, " ");
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}

function cv(arr) {
  const m = mean(arr);
  if (m < 1e-6) return 0;
  return stdev(arr) / m;
}

/** 按 Markdown `## ` 切章（不含代码块预处理，与正文扫描一致） */
function splitChapters(md) {
  const lines = md.split(/\r?\n/);
  const chunks = [];
  let cur = [];
  for (const line of lines) {
    if (/^## /.test(line) && cur.length > 0) {
      chunks.push(cur.join("\n"));
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) chunks.push(cur.join("\n"));
  return chunks.filter((c) => /^## /.test(c.trim()) && c.trim().length > 60);
}

/** 表格/规范型 Markdown 占比高时跳过部分章级启发式，降低对 SKILL/说明文档的误报 */
function tableHeavyRatio(text) {
  const L = text.split(/\n/);
  if (!L.length) return 0;
  return L.filter((l) => /\|/.test(l)).length / L.length;
}

/**
 * S/P/C/B 启发式对齐 quality-S（S）、quality-PLC（P/C/B）与 search-policy qualityGate 数值门槛。
 */
function analyze(text, gate) {
  const body = stripCodeFences(text);
  const zhChars = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const emDash = (body.match(/——/g) || []).length;
  const perThousandZh = zhChars > 0 ? (emDash / zhChars) * 1000 : 0;

  const aiContrastMax = gate.aiContrastMax ?? 8;
  const aiAdverbMax = gate.aiAdverbMax ?? 12;
  const minRhythmCv = gate.minRhythmCv ?? 0.2;
  const warnEm = gate.emDashPerThousandWarnAbove ?? 1;
  const blockEm = gate.emDashPerThousandBlockAbove ?? 3;

  const notXButY = (body.match(/不是[^，。\n]{1,48}而是/g) || []).length;
  const rhetorical =
    (body.match(/这意味着|不难看出|毋庸置疑|值得注意的是|从某种意义上/g) || []).length;
  const aiShell = (body.match(/作为一个人工智能|作为 AI|综上所述，我们可以/g) || []).length;

  const sPass = notXButY <= aiContrastMax && rhetorical <= 5 && aiShell === 0;

  const very = (body.match(/非常|十分|极其/g) || []).length;
  const symmetricPat =
    (body.match(/首先[，,、]?[^。\n]{0,200}其次/g) || []).length +
    (body.match(/首先[，,、]?[^。\n]{0,200}最后/g) || []).length +
    (body.match(/不仅[^。\n]{0,120}而且[^。\n]{0,120}更/g) || []).length;
  const waterPat = (
    body.match(/换言之|也就是说|接下来我们来看|下面将详细介绍|以及其他方面/g) || []
  ).length;
  const waterBudget = Math.max(3, Math.floor(zhChars / 4000));

  const paras = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  let conceptOpen = 0;
  for (const p of paras) {
    const first = (p.split(/[。\n]/)[0] || "").trim();
    if (first.length > 0 && first.length < 100 && /是一种|的定义是|所谓.+是指/.test(first)) {
      conceptOpen++;
    }
  }
  const conceptRatio = paras.length ? conceptOpen / paras.length : 0;

  const quoteHits =
    (body.match(/「[^」]{2,200}」/g) || []).length +
    (body.match(/"[^"]{4,120}"/g) || []).length +
    (body.match(/'[^']{4,120}'/g) || []).length;
  const blocks2000 = Math.max(1, Math.floor(zhChars / 2000));
  const p2Pass = zhChars < 800 || quoteHits >= Math.min(blocks2000, 12);

  const pPass =
    very <= aiAdverbMax &&
    symmetricPat === 0 &&
    waterPat <= waterBudget &&
    conceptRatio <= 0.5 &&
    p2Pass;

  const chapters = splitChapters(body);
  let c1Hits = 0;
  let c2Hits = 0;
  let c3Fails = 0;
  for (const ch of chapters) {
    if (/一方面/.test(ch) && /另一方面/.test(ch)) {
      if (!/(所以|因此|建议|结论|坏消息|好消息|明确)/.test(ch)) c1Hits++;
    }
    const lines = ch
      .trim()
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const last = lines[lines.length - 1] || "";
    if (/^(综上所述|总之[,，]|本章介绍了|可根据实际情况)/.test(last)) c2Hits++;

    const subs = ch.split(/^### /m).filter((s) => s.length > 30);
    if (subs.length >= 3 && tableHeavyRatio(ch) < 0.18) {
      const lens = subs.map((s) => (s.match(/[\u4e00-\u9fff]/g) || []).length);
      if (mean(lens) >= 40 && cv(lens) < 0.3) c3Fails++;
    }
  }

  const roundPct = body.match(/(?:^|[\s，。])([1-9]0|100)%/g) || [];
  const anyPct = body.match(/\d+(?:\.\d+)?%/g) || [];
  const c4RoundPct = roundPct.length;
  const c4Ratio = anyPct.length ? c4RoundPct / anyPct.length : 0;
  const specHeavy = tableHeavyRatio(body) > 0.1;
  const c4Pass =
    specHeavy ||
    zhChars < 500 ||
    c4RoundPct <= 6 ||
    (c4Ratio <= 0.22 && c4RoundPct <= 12);

  const cPass = c1Hits === 0 && c2Hits === 0 && c3Fails === 0 && c4Pass;

  const h2 = body.match(/^## (.+)$/gm) || [];
  let b1Hits = 0;
  for (const h of h2) {
    if (/的重要性|浅谈|的现状与未来|如何利用|基于.+的.+研究/.test(h)) b1Hits++;
  }

  const paraLens = paras.map((p) => (p.match(/[\u4e00-\u9fff]/g) || []).length).filter((n) => n > 0);
  const paraCv = paraLens.length >= 5 ? cv(paraLens) : 1;
  const b2aPass = zhChars < 400 || paraCv >= minRhythmCv;

  const punctSet = new Set(body.match(/[。，、；：「」《》！？……]/g) || []);
  const punctTypes = punctSet.size;
  const b2bPass = zhChars < 200 || punctTypes >= 4;

  const bPass = perThousandZh < blockEm && b1Hits === 0 && b2aPass && b2bPass;

  return {
    zhChars,
    emDash,
    perThousandZh,
    notXButY,
    rhetorical,
    aiShell,
    very,
    symmetricPat,
    waterPat,
    conceptOpen,
    conceptRatio,
    quoteHits,
    c1Hits,
    c2Hits,
    c3Fails,
    c4RoundPct,
    c4Ratio,
    b1Hits,
    paraCv,
    punctTypes,
    chaptersScanned: chapters.length,
    thresholds: { warnEm, blockEm, aiContrastMax, aiAdverbMax, minRhythmCv },
    layers: {
      S: {
        pass: sPass,
        hints: [
          `不是…而是 ${notXButY}/${aiContrastMax}；套话 ${rhetorical}/5；AI自述 ${aiShell}`,
        ],
      },
      P: {
        pass: pPass,
        hints: [
          `程度副词 ${very}/${aiAdverbMax}；对称排比 ${symmetricPat}（§P3 须 0）；注水短语 ${waterPat}/${waterBudget}；概念起段占比 ${(conceptRatio * 100).toFixed(0)}%；直接引语迹象 ${quoteHits}`,
        ],
      },
      C: {
        pass: cPass,
        hints: [
          `章切片 ${chapters.length}：无立场对冲 ${c1Hits}；抽象章尾 ${c2Hits}；节长均匀度未过 ${c3Fails}；整十占比 ${(c4Ratio * 100).toFixed(0)}%（启发式 §C1–C4）`,
        ],
      },
      B: {
        pass: bPass,
        hints: [
          `破折号 ${perThousandZh.toFixed(2)}/千字（block<${blockEm}）；公式化 H2 ${b1Hits}；段长 CV ${paraCv.toFixed(2)}（≥${minRhythmCv}）；标点类 ${punctTypes}`,
        ],
      },
    },
  };
}

/** 单段通配，如 chapters/*.md（零依赖，兼容 Node 18+） */
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

function collectFiles(args) {
  if (args.stdin) return [{ label: "(stdin)", read: () => fs.readFileSync(0, "utf8") }];
  const files = [];
  if (args.globPat) files.push(...expandGlobPattern(args.globPat));
  for (const f of args.inputs) files.push(path.resolve(f));
  return files.map((f) => ({ label: f, read: () => fs.readFileSync(f, "utf8") }));
}

function main() {
  const args = parseArgs(process.argv);
  const skillRoot = path.resolve(args.skillRoot || process.cwd());
  const gate = loadQualityGate(skillRoot);
  const lex = loadAbbrevLexicon(skillRoot);

  let sources = collectFiles(args);
  if (!args.stdin && args.inputs.length === 0 && !args.globPat) {
    console.error(
      "用法: node integration/quality-auditor.mjs --skill-root . --inputs <a.md> [b.md...]\n" +
        "      node integration/quality-auditor.mjs --skill-root . --glob \"chapters/*.md\"\n" +
        "      node integration/quality-auditor.mjs --skill-root . --stdin"
    );
    process.exit(2);
  }
  if (sources.length === 0) {
    console.error("quality-auditor: 未找到任何输入文件（检查 --inputs / --glob）");
    process.exit(2);
  }

  const sections = [];
  let combined = "";
  for (const src of sources) {
    const text = src.read();
    combined += "\n\n" + text;
    const r = analyze(text, gate);
    sections.push({ label: src.label, r });
  }
  const overall = analyze(combined, gate);
  const lexHits = countLexiconHits(combined, lex.entries);
  const pseudoHits = scanPseudoPrecision(stripCodeFences(combined));

  const lines = [];
  lines.push("# FBS 质量审计报告（脚本启发式）");
  lines.push("");
  lines.push(`- 技能根: \`${skillRoot}\``);
  lines.push(`- 输入源数: ${sections.length}`);
  lines.push(`- 合并样本：汉字约 ${overall.zhChars}，破折号「——」${overall.emDash}，约 ${overall.perThousandZh.toFixed(2)} /千字`);
  lines.push("");
  lines.push("## 合并摘要（S / P / C / B）");
  for (const L of ["S", "P", "C", "B"]) {
    const x = overall.layers[L];
    lines.push(`- **${L} 层**: ${x.pass ? "通过（启发式）" : "待复核"} — ${x.hints.join("；")}`);
  }
  lines.push("");
  lines.push("## 分文件");
  for (const { label, r } of sections) {
    lines.push(`### ${label}`);
    lines.push(
      `- S: 不是…而是 ${r.notXButY}；套话 ${r.rhetorical}；AI自述 ${r.aiShell} | P: 对称排比 ${r.symmetricPat}；注水 ${r.waterPat}；引语迹象 ${r.quoteHits}`
    );
    lines.push(
      `- C: 章 ${r.chaptersScanned}；无立场 ${r.c1Hits}；抽象尾 ${r.c2Hits}；节均匀未过 ${r.c3Fails} | B: 破折号/千字 ${r.perThousandZh.toFixed(2)}；公式 H2 ${r.b1Hits}`
    );
    lines.push("");
  }
  lines.push("## 伪精确数据（启发式，测试报告 09）");
  if (pseudoHits.length === 0) {
    lines.push("- 未命中常见 `$…/月` / 营收占比类模式（仍须按 G4/C4 人工核对）。");
  } else {
    lines.push(`- 共 ${pseudoHits.length} 处待核对（示例最多列 12 条）：`);
    for (const h of pseudoHits.slice(0, 12)) {
      lines.push(`  - \`${h.match}\`（${h.kind}）`);
    }
  }
  lines.push("");
  lines.push("## C0-2 词库提示（易多义缩写出现次数）");
  lines.push(
    `- 词库: \`${path.relative(process.cwd(), lex.path)}\`（条目数 ${lex.entries.length}；ASCII 缩写按单词边界 \\b 计次）`
  );
  if (lexHits.length === 0) {
    lines.push("- 未命中词库中的缩写（或词库为空/缺失）。");
  } else {
    for (const h of lexHits) {
      const m = h.meanings.length ? ` — 已知多义候选：${h.meanings.join("；")}` : "";
      lines.push(`- **${h.abbrev}**：出现 ${h.count} 次${m}；须对照全书术语表核对是否单一释义。`);
    }
  }
  lines.push("");
  lines.push("## 说明");
  lines.push("- 完整五层 + C0 全书仍以 `references/02-quality/quality-check.md` 与 `book-level-consistency.md` 为准。");
  lines.push("- 本脚本可嵌入 CI 或宿主 S5 钩子，仅作门禁辅助。");

  const outText = lines.join("\n");
  if (args.out) {
    fs.writeFileSync(path.resolve(args.out), outText, "utf8");
    console.log("quality-auditor: 已写入", path.resolve(args.out));
  } else {
    console.log(outText);
  }
}

main();
