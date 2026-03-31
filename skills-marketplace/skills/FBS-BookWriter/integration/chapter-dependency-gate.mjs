#!/usr/bin/env node
/**
 * 派发前依赖门禁（测试报告 01·TC-04）：根据磁盘上是否已有依赖章 MD，判定是否允许启动某章。
 * 不替代宿主调度；供 team-lead / CI 在「开写」前调用。
 *
 * 逻辑与 sync-book-chapter-index 一致：按 chapter-dependencies.json 的 fileNameContains 在本书根 *.md 中匹配。
 *
 * 用法：
 *   node integration/chapter-dependency-gate.mjs --book-root <本书根> --chapter ch06
 *   node integration/chapter-dependency-gate.mjs --book-root <本书根> --chapter ch06 --json
 *
 * 退出码：0 依赖已满足；1 未满足或缺 chapter-dependencies；2 参数错误 / 未知章节 id
 */
import fs from "fs";
import path from "path";

function parseArgs(argv) {
  const o = { bookRoot: null, chapter: null, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--book-root") o.bookRoot = argv[++i];
    else if (a === "--chapter") o.chapter = argv[++i];
    else if (a === "--json") o.json = true;
  }
  return o;
}

function listDraftMd(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(root, f));
}

function matchContains(files, hint) {
  if (!hint) return [];
  const h = String(hint);
  return files.filter((p) => path.basename(p).includes(h));
}

function loadDeps(fbs) {
  const p = path.join(fbs, "chapter-dependencies.json");
  if (!fs.existsSync(p)) return { chapters: [], path: p, missing: true };
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return { chapters: Array.isArray(j.chapters) ? j.chapters : [], path: p, missing: false };
  } catch {
    return { chapters: [], path: p, corrupt: true };
  }
}

function buildFacts(root, fbs) {
  const files = listDraftMd(root);
  const deps = loadDeps(fbs);
  const byId = new Map();
  for (const ch of deps.chapters) {
    const id = ch.id || "";
    const hint = ch.fileNameContains || ch.title || id || "";
    const matched = matchContains(files, hint);
    byId.set(id, {
      id,
      title: ch.title || null,
      fileFound: matched.length > 0,
      matchedFiles: matched.map((p) => path.basename(p)),
      dependsOn: Array.isArray(ch.dependsOn) ? ch.dependsOn : [],
    });
  }
  return { byId, depsPath: deps.path, depsMissing: deps.missing, depsCorrupt: deps.corrupt };
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.bookRoot || !args.chapter) {
    console.error(
      "用法: node integration/chapter-dependency-gate.mjs --book-root <本书根> --chapter <章节id> [--json]"
    );
    process.exit(2);
  }
  const root = path.resolve(args.bookRoot);
  const fbs = path.join(root, ".fbs");
  const { byId, depsPath, depsMissing, depsCorrupt } = buildFacts(root, fbs);

  if (depsMissing || depsCorrupt) {
    const err = {
      ok: false,
      reason: depsMissing ? "missing_chapter_dependencies" : "corrupt_chapter_dependencies",
      depsPath,
      hint: "请先运行: node scripts/init-fbs-multiagent-artifacts.mjs --book-root <本书根>",
    };
    if (args.json) console.log(JSON.stringify(err, null, 2));
    else console.error("chapter-dependency-gate:", err.reason, depsPath);
    process.exit(2);
  }

  const target = byId.get(args.chapter);
  if (!target) {
    const err = { ok: false, reason: "unknown_chapter_id", chapter: args.chapter };
    if (args.json) console.log(JSON.stringify(err, null, 2));
    else console.error("chapter-dependency-gate: 未知章节 id:", args.chapter);
    process.exit(2);
  }

  const blocking = [];
  for (const depId of target.dependsOn) {
    const d = byId.get(depId);
    if (!d) {
      blocking.push({ depId, ok: false, reason: "unknown_dependency_id" });
      continue;
    }
    if (!d.fileFound) blocking.push({ depId, ok: false, reason: "dependency_draft_missing", files: d.matchedFiles });
    else blocking.push({ depId, ok: true, files: d.matchedFiles });
  }

  const ok = blocking.every((b) => b.ok);
  const out = {
    ok,
    chapter: args.chapter,
    dependsOn: target.dependsOn,
    blocking: blocking.filter((b) => !b.ok),
    checkedAt: new Date().toISOString(),
    bookRoot: root,
  };

  if (args.json) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`chapter-dependency-gate: ${args.chapter}`);
    if (ok) console.log("  结果: 依赖章在磁盘上均已匹配到 MD，可派发（仍须 team-lead 核对「已完成」语义）。");
    else {
      console.log("  结果: **不可派发** — 下列依赖未找到对应稿件文件：");
      for (const b of out.blocking) {
        console.log(`    - ${b.depId}: ${b.reason}`);
      }
    }
  }
  process.exit(ok ? 0 : 1);
}

main();
