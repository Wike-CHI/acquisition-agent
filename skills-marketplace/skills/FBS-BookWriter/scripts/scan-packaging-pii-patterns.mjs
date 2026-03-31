#!/usr/bin/env node
/**
 * 发版前扫描：疑似「真实用户主目录路径」写入随包文件（防 B-UserAgnostic 失效）。
 * 用法（技能根）：
 *   node scripts/scan-packaging-pii-patterns.mjs           # 仅打印命中，退出 0
 *   node scripts/scan-packaging-pii-patterns.mjs --fail    # 有命中则退出 1
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FAIL = process.argv.includes("--fail");

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "release",
  ".tmp-book-test",
]);

const ALLOWLIST_FILES = new Set([
  "references/05-ops/multi-agent-audit-privacy-competitiveness.md",
  "scripts/scan-packaging-pii-patterns.mjs",
  "integration/lib/PathRedaction.js",
]);

const PATTERNS = [
  { name: "win_users_path", re: /[A-Za-z]:\\Users\\[A-Za-z0-9][A-Za-z0-9._-]*\\/g },
  { name: "mac_users_path", re: /\/Users\/[A-Za-z0-9][A-Za-z0-9._-]*\//g },
  { name: "linux_home_path", re: /\/home\/[A-Za-z0-9][A-Za-z0-9._-]*\//g },
];

function lineAllowed(line) {
  const hints = [
    "未发现",
    "示例",
    "反例",
    "勿将",
    "禁止写入",
    "regex",
    "占位",
    "yourname",
    "通配",
    "脱敏",
    "redact",
    "扫描脚本",
    "关键词",
    "用户主目录",
    "说明性",
    "表格中为",
  ];
  if (hints.some((h) => line.includes(h))) return true;
  if (line.toLowerCase().includes("%userprofile%")) return true;
  return false;
}

function walk(dir, base, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (SKIP_DIRS.has(name.name)) continue;
      walk(p, base, out);
    } else {
      const rel = path.relative(base, p).replace(/\\/g, "/");
      if (!/\.(md|mjs|js|json|yaml|yml)$/i.test(rel)) continue;
      out.push(rel);
    }
  }
  return out;
}

function scanFile(relPath) {
  const full = path.join(ROOT, relPath);
  let text;
  try {
    text = fs.readFileSync(full, "utf8");
  } catch {
    return [];
  }
  const hits = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (lineAllowed(line)) return;
    for (const { name, re } of PATTERNS) {
      re.lastIndex = 0;
      if (re.test(line)) {
        hits.push({ relPath, line: idx + 1, rule: name, sample: line.trim().slice(0, 120) });
        break;
      }
    }
  });
  return hits;
}

function main() {
  const roots = [
    path.join(ROOT, "references"),
    path.join(ROOT, "integration"),
    path.join(ROOT, "scripts"),
    path.join(ROOT, "scenarios"),
    path.join(ROOT, "SKILL.md"),
    path.join(ROOT, "assets"),
  ];
  const files = new Set();
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    const st = fs.statSync(r);
    if (st.isFile()) {
      files.add(path.relative(ROOT, r).replace(/\\/g, "/"));
    } else {
      for (const f of walk(r, ROOT)) files.add(f);
    }
  }

  const allHits = [];
  for (const rel of [...files].sort()) {
    if (ALLOWLIST_FILES.has(rel)) continue;
    allHits.push(...scanFile(rel));
  }

  if (allHits.length) {
    console.error("scan-packaging-pii-patterns: 发现疑似用户主目录硬编码路径 ——");
    for (const h of allHits) {
      console.error(`  ${h.relPath}:${h.line} [${h.rule}] ${h.sample}`);
    }
    if (FAIL) process.exit(1);
  } else {
    console.log("scan-packaging-pii-patterns: 未命中受限模式（" + ROOT + "）");
  }
}

main();
