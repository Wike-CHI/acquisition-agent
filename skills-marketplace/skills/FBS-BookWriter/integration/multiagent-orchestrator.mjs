#!/usr/bin/env node
/**
 * 多智能体编排模板（占位输出）：按阶段给出可复制 Task 话术，不调用宿主 API。
 * 权威话术见 references/01-core/workbuddy-agent-briefings.md
 *
 * 用法：
 *   node integration/multiagent-orchestrator.mjs --stage S0
 *   node integration/multiagent-orchestrator.mjs --stage S3 --topic "某主题"
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const o = { stage: "S0", topic: "" };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--stage") o.stage = argv[++i];
    else if (argv[i] === "--topic") o.topic = argv[++i];
  }
  return o;
}

const BRIEF = path.join(SKILL_ROOT, "references/01-core/workbuddy-agent-briefings.md");

function main() {
  const { stage, topic } = parseArgs(process.argv);
  const lines = [];
  lines.push("# 多智能体编排模板（技能包输出）");
  lines.push("");
  lines.push(`- 阶段: **${stage}**`);
  if (topic) lines.push(`- 主题: ${topic}`);
  lines.push(`- 详细角色话术: \`${path.relative(process.cwd(), BRIEF)}\``);
  lines.push("");
  lines.push("## 建议在宿主内执行");
  lines.push("- 使用并行 **Task** / Agent Teams，为 G 层 / P 层 / C 层 / 审计层分别创建子任务。");
  lines.push("- 下列为最小可复制指令骨架（按 briefing 展开）：");
  lines.push("");
  if (stage === "S0" || stage === "S1" || stage === "S2") {
    lines.push("1. **检索/研究子任务**：按 `search-policy.json` 的 s0ParallelQueries（语义见 `s0ParallelQueriesSemantics`）与 `section-3-workflow` S0「主体内涵锚定」拆分查询包。");
    lines.push("2. **内容竞品子任务**：同类书/白皮书/长文等可替代读物，国内/海外并行摘要（非默认行业产品矩阵）。");
    lines.push("3. **读者 / 本书变现子任务**：读者画像与**本稿**变现与分发路径草稿并行（行业融资/规模仅作背景）。");
  } else if (stage === "S3") {
    lines.push("1. **成稿子任务**：结构编辑（大纲对齐）。");
    lines.push("2. **事实核查子任务**：对统计句、政策句逐条 WebSearch/WebFetch。");
    lines.push("3. **去 AI 味子任务**：对照 `quality-S.md` 扫描套话。");
  } else if (stage === "S5") {
    lines.push("1. **S 层朗读审计**。");
    lines.push("2. **P/C/B 分层勾项**（见 `quality-check.md`）。");
    lines.push("3. **C0 全书**：`BookLevelConsistency` / `book-level-consistency.md`。");
  } else {
    lines.push("- 参见 `section-3-workflow.md` 对应阶段；在宿主创建与子任务数匹配的并行 Task。");
  }
  lines.push("");
  if (fs.existsSync(BRIEF)) {
    lines.push("## briefing 文件已就绪");
    lines.push("请打开上述 `workbuddy-agent-briefings.md` 复制完整自然语言指令。");
  } else {
    lines.push("## 警告");
    lines.push("未找到 workbuddy-agent-briefings.md，请检查技能包完整性。");
  }
  console.log(lines.join("\n"));
}

main();
