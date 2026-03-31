#!/usr/bin/env node
/**
 * 在本书根生成 FBS_CONTEXT_INDEX.md：按阶段列出建议 @ 引用的单文件（降 token）。
 * 用法：node scripts/generate-book-context-index.mjs --book <本书根> --skill <技能包根>
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const o = { book: null, skill: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--book") o.book = path.resolve(argv[++i]);
    else if (a === "--skill") o.skill = path.resolve(argv[++i]);
  }
  return o;
}

function displaySkillRoot(p) {
  return path.normalize(p).replace(/\\/g, "/");
}

const SECTIONS = [
  {
    title: "工作流与强制联网（S0–S6）",
    files: [
      "references/01-core/section-3-workflow.md",
      "references/05-ops/search-policy.json",
      "references/01-core/skill-index.md",
    ],
  },
  {
    title: "NLU / 短指令",
    files: ["references/01-core/section-nlu.md", "references/01-core/section-4-commands.md"],
  },
  {
    title: "质量与去 AI 味（按需加载）",
    files: [
      "references/02-quality/quality-check.md",
      "references/02-quality/quality-S.md",
      "references/02-quality/quality-PLC.md",
    ],
  },
  {
    title: "排版与构建（S4）",
    files: [
      "references/03-product/06-typography.md",
      "references/05-ops/build.md",
      "SKILL.md",
    ],
  },
  {
    title: "运维与记忆集成",
    files: [
      "references/05-ops/heartbeat-protocol.md",
      "references/05-ops/codebuddy-memory-workbuddy-integration.md",
      "references/05-ops/efficiency-implementation.md",
    ],
  },
];

function main() {
  const args = parseArgs(process.argv);
  if (!args.book || !args.skill) {
    console.error(
      "用法: node scripts/generate-book-context-index.mjs --book <本书根> --skill <技能包根>"
    );
    process.exit(2);
  }
  const skillRef = displaySkillRoot(args.skill);
  const outPath = path.join(args.book, "FBS_CONTEXT_INDEX.md");
  const lines = [];
  lines.push("# FBS 上下文按需 @ 索引");
  lines.push("");
  lines.push(
    "> 由 `scripts/generate-book-context-index.mjs` 生成；**请勿**一次性 `@` 整个 `references/`。"
  );
  lines.push("");
  lines.push(`- **技能包根**：\`${skillRef}\``);
  lines.push(`- **本书根**：\`${displaySkillRoot(args.book)}\``);
  lines.push("");

  for (const sec of SECTIONS) {
    lines.push(`## ${sec.title}`);
    lines.push("");
    for (const rel of sec.files) {
      const atPath = rel === "SKILL.md" ? `${skillRef}/SKILL.md` : `${skillRef}/${rel}`;
      lines.push(`- \`@${atPath}\``);
    }
    lines.push("");
  }

  lines.push("## 说明");
  lines.push("");
  lines.push("- 宿主 `@` 深度与递归限制以 CodeBuddy / WorkBuddy 当前版本为准。");
  lines.push("- 更新技能包路径后请重跑本脚本或手动替换上文中的技能根。");
  lines.push("");

  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log("generate-book-context-index: 已写入", outPath);
}

main();
