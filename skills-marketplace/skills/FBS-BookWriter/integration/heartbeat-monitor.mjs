#!/usr/bin/env node
/**
 * 测试报告 03 所称「heartbeat-monitor」入口：与 heartbeat-watchdog.mjs 完全等价（别名）。
 * @see heartbeat-watchdog.mjs
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, "heartbeat-watchdog.mjs");
const r = spawnSync(process.execPath, [target, ...process.argv.slice(2)], {
  stdio: "inherit",
});
process.exit(r.status === null ? 1 : r.status);
