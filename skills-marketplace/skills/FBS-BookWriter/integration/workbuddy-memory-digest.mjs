#!/usr/bin/env node
/**
 * 生成 WorkBuddy / 工作区记忆的**有界只读摘要**（JSON），供主编审核后再注入会话。
 * 默认 opt-in；不修改用户目录下源文件。
 *
 * 用法（技能包根目录）：
 *   node integration/workbuddy-memory-digest.mjs --skill-root . --workspace <本书或工作区根> [--workspace <另一工作区>]
 *   node integration/workbuddy-memory-digest.mjs --skill-root . --book-root <本书根> --write
 *   node integration/workbuddy-memory-digest.mjs ... --no-user-profile
 *   node integration/workbuddy-memory-digest.mjs ... --locked-topic "某书主题"
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { buildDigest, writeDigestToBook } = require('./lib/WorkbuddyMemoryDigest.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const o = {
    skillRoot: path.resolve(__dirname, '..'),
    workspace: [],
    bookRoot: null,
    write: false,
    userProfile: true,
    userHome: os.homedir(),
    lockedTopic: null,
    redactPaths: false,
    noRedact: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill-root') o.skillRoot = path.resolve(argv[++i]);
    else if (a === '--workspace') o.workspace.push(path.resolve(argv[++i]));
    else if (a === '--book-root') o.bookRoot = path.resolve(argv[++i]);
    else if (a === '--write') o.write = true;
    else if (a === '--no-user-profile') o.userProfile = false;
    else if (a === '--user-home') o.userHome = path.resolve(argv[++i]);
    else if (a === '--locked-topic') o.lockedTopic = argv[++i];
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
  node integration/workbuddy-memory-digest.mjs --skill-root <技能根> [--workspace <根目录>] ...
  --book-root <本书根> --write   写入 <本书根>/.fbs/workbuddy-memory-digest.json
  --no-user-profile             不读取 %USERPROFILE%/.workbuddy 下 USER 等文件
  --locked-topic <文本>         仅作 JSON 元数据，便于宿主与本书主题对齐
  --redact-paths                对 JSON 内字符串做绝对路径脱敏（外传/入库推荐）
  --no-redact                   与 --write 同用时保留明文路径（仅调试）
说明: --write 时默认开启脱敏，除非 --no-redact；stdout 与落盘一致。
`);
    process.exit(0);
  }

  let workspaceRoots = args.workspace;
  if (args.bookRoot && workspaceRoots.length === 0) {
    workspaceRoots = [args.bookRoot];
  }
  if (workspaceRoots.length === 0) {
    console.error('workbuddy-memory-digest: 请至少指定 --workspace <路径> 或 --book-root <本书根>');
    process.exit(2);
  }

  const bookRootForHeuristic = args.bookRoot || workspaceRoots[0] || null;
  const redactPaths = args.redactPaths || (args.write && !args.noRedact);
  const { digest, cfg } = buildDigest({
    skillRoot: args.skillRoot,
    workspaceRoots,
    userHome: args.userProfile ? args.userHome : null,
    lockedTopic: args.lockedTopic,
    bookRoot: bookRootForHeuristic,
    redactPaths,
  });

  if (args.write) {
    if (!args.bookRoot) {
      console.error('workbuddy-memory-digest: --write 需要同时指定 --book-root');
      process.exit(2);
    }
    const outPath = writeDigestToBook(args.bookRoot, digest, cfg.injectIntoBookAs);
    console.error('workbuddy-memory-digest: 已写入', outPath);
  }

  process.stdout.write(JSON.stringify(digest, null, 2) + '\n');
}

main();
