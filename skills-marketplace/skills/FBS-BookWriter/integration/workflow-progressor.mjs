#!/usr/bin/env node
/**
 * 工作流阶段清单（只读提示）：与 section-3-workflow.md S0–S6 对齐，无自动推进引擎。
 *
 * 用法：node integration/workflow-progressor.mjs [--current S3]
 */
function parseArgs(argv) {
  let current = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--current") current = argv[++i];
  }
  return { current };
}

const STAGES = [
  { id: "S0", name: "前置调研", note: "竞品/读者/市场；可用户声明跳过" },
  { id: "S1", name: "书籍定位", note: "主题/读者/风格/篇幅" },
  { id: "S2", name: "目录结构", note: "结构化检索同类书目" },
  { id: "S2.5", name: "脉络确认", note: "章间逻辑" },
  { id: "S3", name: "章节写作", note: "每章检索门禁见 search-policy + enforce-search-policy.mjs" },
  {
    id: "S4",
    name: "排版构建",
    note: "typography + assets/build.mjs（PDF 可能长静默；终端见 [S4/build] 进度）",
  },
  { id: "S5", name: "终审", note: "五层 + C0；quality-auditor.mjs 辅助" },
  { id: "S6", name: "发布", note: "交付物与预览" },
];

function main() {
  const { current } = parseArgs(process.argv);
  const lines = [];
  lines.push("# FBS 工作流阶段清单（提示用）");
  lines.push("");
  lines.push("权威条文：`references/01-core/section-3-workflow.md`");
  lines.push("");
  let found = false;
  for (const s of STAGES) {
    const mark = current && s.id === current ? " ← 当前" : "";
    if (current && s.id === current) found = true;
    lines.push(`- **${s.id}** ${s.name} — ${s.note}${mark}`);
  }
  lines.push("");
  if (current && !found) lines.push(`（未识别阶段「${current}」，仍列出全集）`);
  lines.push("## 相关脚本");
  lines.push("- `integration/enforce-search-policy.mjs`（S3）");
  lines.push("- `integration/quality-auditor.mjs`（S5）");
  lines.push("- `assets/build.mjs`（S4）");
  lines.push("- `integration/workbuddy-memory-digest.mjs` / `scripts/init-project-memory.mjs --with-workbuddy-hint`（可选：进入前记忆摘要）");
  lines.push("- `integration/workbuddy-environment-snapshot.mjs`（可选：环境路径/策略版本指纹，感知宿主或布局变化）");
  lines.push("");
  lines.push("## 首次写书（冷启动提示）");
  lines.push(
    "- 若本书根下尚无 `[S0]*.md` 且 `.fbs` 无 `topic-lock.json` / `workbuddy-memory-digest.json`，digest JSON 会带 `bookContextHeuristics.firstRunBookProject: true`（启发用，非门禁）。"
  );
  lines.push("- 建议：完成 S0 主题锁定后，再主编审阅 digest 再注入会话；详见 `SKILL.md` 与 `references/05-ops/workbuddy-first-use-environment-tiered-strategy.md`。");
  console.log(lines.join("\n"));
}

main();
