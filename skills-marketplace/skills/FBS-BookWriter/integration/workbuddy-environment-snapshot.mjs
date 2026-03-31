#!/usr/bin/env node
/**
 * 本书环境快照：仅路径存在性 + search-policy 版本；用于感知 WorkBuddy / 工作区布局变化。
 *
 * 用法：
 *   node integration/workbuddy-environment-snapshot.mjs --skill-root . --book-root <本书根>
 *   node integration/workbuddy-environment-snapshot.mjs ... --write   写入 .fbs/workbuddy-environment.json 并保留上一版摘要
 *   node integration/workbuddy-environment-snapshot.mjs ... --no-user-probes   不探测 %USERPROFILE%/.workbuddy
 */
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  mergeEnvironmentSnapshot,
  loadSearchPolicy,
  collectProbes,
  diffProbes,
  writeSnapshot,
  readSnapshotIfExists,
} = require('./lib/WorkbuddyEnvironmentSnapshot.js');
const { redactJsonObject } = require('./lib/PathRedaction.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const o = {
    skillRoot: path.resolve(__dirname, '..'),
    bookRoot: null,
    write: false,
    userProbes: true,
    userHome: os.homedir(),
    redactPaths: false,
    noRedact: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill-root') o.skillRoot = path.resolve(argv[++i]);
    else if (a === '--book-root') o.bookRoot = path.resolve(argv[++i]);
    else if (a === '--write') o.write = true;
    else if (a === '--no-user-probes') o.userProbes = false;
    else if (a === '--user-home') o.userHome = path.resolve(argv[++i]);
    else if (a === '--redact-paths') o.redactPaths = true;
    else if (a === '--no-redact') o.noRedact = true;
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`用法:
  node integration/workbuddy-environment-snapshot.mjs --skill-root <技能根> --book-root <本书根>
  --write              写入快照（上一版记入 previous）
  --no-user-probes     不探测用户目录 .workbuddy 下文件
  --redact-paths       强制脱敏 bookRoot 等字符串
  --no-redact          与 --write 同用时保留明文（仅调试）
说明: --write 时默认脱敏，除非 --no-redact。
策略: references/05-ops/search-policy.json → environmentSnapshot
`);
    process.exit(0);
  }
  if (!args.bookRoot) {
    console.error('workbuddy-environment-snapshot: 须指定 --book-root <本书根>');
    process.exit(2);
  }

  const policy = loadSearchPolicy(args.skillRoot);
  const snapCfg = mergeEnvironmentSnapshot(policy);
  const userHome = args.userProbes ? args.userHome : null;
  const current = collectProbes(args.bookRoot, userHome, policy);

  const oldFull = readSnapshotIfExists(args.bookRoot, snapCfg.relativeOutputFile);
  const diff = diffProbes(oldFull, current);

  const redactPaths = args.redactPaths || (args.write && !args.noRedact);
  const currentOut = redactPaths ? redactJsonObject(current) : current;
  const out = {
    current: currentOut,
    diff,
    redactionApplied: redactPaths,
  };

  if (args.write) {
    const outPath = writeSnapshot(args.bookRoot, currentOut, oldFull, snapCfg.relativeOutputFile);
    console.error('workbuddy-environment-snapshot: 已写入', outPath);
  }

  for (const h of diff.hints) {
    console.error('workbuddy-environment-snapshot:', h);
  }

  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

main();
