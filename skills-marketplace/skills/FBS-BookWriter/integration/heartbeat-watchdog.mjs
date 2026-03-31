#!/usr/bin/env node
/**
 * 心跳超时巡检（CLI）：读取 .fbs/member-heartbeats.json，对照 120s / 300s 阈值输出告警。
 *
 * 用法：
 *   node integration/heartbeat-watchdog.mjs --book-root <本书根>
 *   node integration/heartbeat-watchdog.mjs --book-root <本书根> --fail-on-warn   # 退出码 1 若有 warn/critical
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { HeartbeatService } = require("./lib/HeartbeatService.js");

function parseArgs(argv) {
  const o = { bookRoot: null, failOnWarn: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--book-root") o.bookRoot = argv[++i];
    else if (a === "--fail-on-warn") o.failOnWarn = true;
  }
  return o;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.bookRoot) {
    console.error("用法: node integration/heartbeat-watchdog.mjs --book-root <本书根> [--fail-on-warn]");
    process.exit(2);
  }
  const root = path.resolve(args.bookRoot);
  const svc = new HeartbeatService({ bookRoot: root });
  const r = svc.evaluate();
  console.log(`heartbeat-watchdog: ${r.now}`);
  console.log(`  状态文件: ${r.statePath}`);
  if (r.stale.length === 0) {
    console.log("  结果: 无超时成员");
    process.exit(0);
  }
  for (const s of r.stale) {
    const sec = (s.elapsedMs / 1000).toFixed(0);
    console.log(`  [${s.level}] ${s.id} — 距上次心跳 ${sec}s`);
  }
  if (args.failOnWarn) process.exit(1);
  process.exit(0);
}

main();
