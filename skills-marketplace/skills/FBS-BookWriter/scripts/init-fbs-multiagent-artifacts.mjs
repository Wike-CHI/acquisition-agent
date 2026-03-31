#!/usr/bin/env node
/**
 * 多路并行写书：在本书根下初始化 .fbs 共享工件（测试报告 01·02·07·08 对齐）
 *
 * 用法（技能包根目录）：
 *   node scripts/init-fbs-multiagent-artifacts.mjs --book-root <本书工作区根路径> [--force]
 *
 * 创建/更新（不覆盖已有非空文件，除非 --force）：
 *   .fbs/chapter-status.md
 *   chapter-status.md（本书根，与 .fbs 同模板，测试报告 01 扫描友好）
 *   .fbs/chapter-dependencies.json
 *   .fbs/book-context-brief.md
 *   .fbs/GLOSSARY.md
 *   .fbs/project-config.json
 *   .fbs/search-ledger.jsonl
 *   .fbs/member-heartbeats.json
 *   .fbs/task-queue.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const o = { bookRoot: null, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--book-root") o.bookRoot = argv[++i];
    else if (a === "--force") o.force = true;
  }
  return o;
}

function writeIfAbsent(filePath, content, force) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(filePath)) {
    const cur = fs.readFileSync(filePath, "utf8").trim();
    if (cur.length > 0 && !force) {
      console.log("skip (exists):", filePath);
      return;
    }
  }
  fs.writeFileSync(filePath, content, "utf8");
  console.log("write:", filePath);
}

const CHAPTER_STATUS = `# 章节完成状态台账（多路并行 S3）

> **单一真相来源**（测试报告 01）：team-lead 与各 Writer 同步更新；**勿**仅依赖宿主 MEMORY 口头「全完成」而跳过磁盘核对。  
> **双路径**：\`.fbs/chapter-status.md\` 与本书根 \`chapter-status.md\` 由 init 写入相同模板；日常请只维护一侧或保持两处一致。  
> 建议每次合并前运行：\`node scripts/sync-book-chapter-index.mjs --book-root <本书根> --json-out .fbs/chapter-scan-result.json\`

最后更新：（ISO 时间）

| 章节ID | 文件名 | 状态 | 完成时间 | 字数 | 依赖章节 | 质量自检(折算/10) | 易多义缩写已核对 |
|--------|--------|------|----------|------|----------|-------------------|------------------|
| ch01 | [S3-Ch01] 第一章.md | 未开始 | — | — | — |  |  |

状态建议：\`未开始\` / \`进行中\` / \`待审\` / \`已完成\`。
`;

const CHAPTER_DEPS = {
  version: 1,
  description:
    "章节依赖图：team-lead 按 S2 实际改 id / fileNameContains / dependsOn / batch；配合 sync-book-chapter-index 与 chapter-scheduler-hint",
  chapters: [
    {
      id: "ch06",
      title: "第六章 双线对决",
      fileNameContains: "第六章",
      dependsOn: ["ch04", "ch05"],
      batch: 2,
    },
    {
      id: "ch04",
      title: "第四章（示例）",
      fileNameContains: "第四章",
      dependsOn: [],
      batch: 1,
    },
    {
      id: "ch05",
      title: "第五章（示例）",
      fileNameContains: "第五章",
      dependsOn: [],
      batch: 1,
    },
    {
      id: "ch07",
      title: "第七章（示例：易漏章）",
      fileNameContains: "第七章",
      dependsOn: [],
      batch: 1,
    },
  ],
};

const GLOSSARY = `# 本书术语表（.fbs/GLOSSARY.md）

> **并行写作 P0**（测试报告 02）：多义缩写必须在本表锁定**本书唯一含义**；Writer 任务须附带本路径。

## 缩写与专名

| 缩写/专名 | 本书唯一含义 | 禁止混用的其他含义 |
|-----------|-------------|-------------------|
| OPC | （主编填写，如 One-Person Company） | 须与 abbreviation-audit-lexicon.json 对照 |
| MCP | Model Context Protocol（首次可写全称） | — |

（可增删行；**terminology-gate.mjs --strict** 将检查多义词条是否在本表出现。）
`;

const BOOK_CONTEXT = `# 全书上下文摘要（并行写作共享）

> 各 Writer 写作前读一遍；更新后通过 broadcast 或 team-lead 通知刷新。

## 已锁定数据点（跨章须一致）

| 数据点 | 数值/表述 | 来源 | 锁定章节 |
|--------|-----------|------|----------|
| （示例） |  |  |  |

## 术语与缩写（本书唯一含义）

见 \`.fbs/GLOSSARY.md\` 或 S1/S2 术语表；勿在正文自创第二含义。

## 各章核心结论与末段钩子（防重复与断档）

| 章 | 一句结论 | 末段是否指向下章 |
|----|----------|------------------|
|  |  |  |
`;

const PROJECT_CONFIG = {
  description: "FBS-BookWriter 本书项目配置（多智能体对齐）",
  skillPolicyVersionNote: "与 references/05-ops/search-policy.json version 对齐维护",
  multiAgentMode: "parallel_writing",
  multiAgentModeNote:
    "parallel_writing = 多 Writer 并行；single_writer = 单会话逐章。见 references/05-ops/architecture-modes.md",
  parallelWriting: {
    enabled: true,
    defaultEnableG4ForCitation: true,
    requireChapterStatusUpdates: true,
    fileNamingConvention: "[S3-ChNN] 第N章-标题.md",
  },
};

const HEARTBEATS = {
  version: 1,
  members: {},
  note: "成员每 ≤60s 由宿主或人工更新 lastHeartbeat（ISO）；team-lead 运行 integration/heartbeat-watchdog.mjs 巡检",
};

const TASK_QUEUE = {
  version: 1,
  tasks: [],
  note: "integration/task-queue-helper.mjs 维护；失败后 retry 计数见各 task",
};

function main() {
  const { bookRoot, force } = parseArgs(process.argv);
  if (!bookRoot) {
    console.error(
      "用法: node scripts/init-fbs-multiagent-artifacts.mjs --book-root <本书根> [--force]"
    );
    process.exit(2);
  }
  const root = path.resolve(bookRoot);
  const fbs = path.join(root, ".fbs");

  writeIfAbsent(path.join(fbs, "chapter-status.md"), CHAPTER_STATUS, force);
  writeIfAbsent(path.join(root, "chapter-status.md"), CHAPTER_STATUS, force);
  writeIfAbsent(path.join(fbs, "chapter-dependencies.json"), JSON.stringify(CHAPTER_DEPS, null, 2) + "\n", force);
  writeIfAbsent(path.join(fbs, "book-context-brief.md"), BOOK_CONTEXT, force);
  writeIfAbsent(path.join(fbs, "GLOSSARY.md"), GLOSSARY, force);
  writeIfAbsent(path.join(fbs, "project-config.json"), JSON.stringify(PROJECT_CONFIG, null, 2) + "\n", force);
  writeIfAbsent(path.join(fbs, "member-heartbeats.json"), JSON.stringify(HEARTBEATS, null, 2) + "\n", force);
  writeIfAbsent(path.join(fbs, "task-queue.json"), JSON.stringify(TASK_QUEUE, null, 2) + "\n", force);

  const ledger = path.join(fbs, "search-ledger.jsonl");
  if (!fs.existsSync(ledger) || force) {
    fs.mkdirSync(fbs, { recursive: true });
    fs.writeFileSync(ledger, "", "utf8");
    console.log("write:", ledger);
  } else {
    console.log("skip (exists):", ledger);
  }

  console.log(
    "done. 下一步: shared-knowledge-base · sync-book-chapter-index · chapter-scheduler-hint · chapter-dependency-gate · citation-format-check · terminology-gate · heartbeat-monitor"
  );
}

main();
