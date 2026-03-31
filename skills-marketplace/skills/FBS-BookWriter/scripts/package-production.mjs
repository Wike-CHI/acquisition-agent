#!/usr/bin/env node
/**
 * 生产环境技能包打包：复制必选文件 → 生成清单 → 打 zip（解压后根目录为 FBS-BookWriter/）
 *
 * 用法（在技能包根目录，即与 SKILL.md 同级）：
 *   node scripts/package-production.mjs
 *   node scripts/package-production.mjs --out ../release-custom
 *
 * 预检：`audit-skill-consistency.mjs`（内嵌 `scan-packaging-pii-patterns.mjs --fail`）。
 * Windows 使用 PowerShell Compress-Archive；macOS/Linux 优先 zip 命令。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync, spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
let outBase = path.join(ROOT, "release");
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out" && args[i + 1]) {
    outBase = path.resolve(args[++i]);
  }
}

const STAGING_PARENT = path.join(outBase, "staging");
const STAGING_SKILL = path.join(STAGING_PARENT, "FBS-BookWriter");

function die(msg) {
  console.error(msg);
  process.exit(1);
}

// 1) 文档一致性预检
const audit = spawnSync(process.execPath, ["scripts/audit-skill-consistency.mjs"], {
  cwd: ROOT,
  encoding: "utf8",
});
if (audit.status !== 0) {
  console.error(audit.stdout || audit.stderr);
  die("预检失败：请先修复 audit-skill-consistency 再打包");
}
console.log(audit.stdout?.trim() || "audit: OK");
// 隐私扫描已在 audit-skill-consistency 内默认执行（`--skip-packaging-pii-scan` 可跳过，不推荐用于发版）

// 2) 版本号（来自 search-policy.json）
let pkgVersion = "1.0.0";
try {
  const pol = JSON.parse(fs.readFileSync(path.join(ROOT, "references/05-ops/search-policy.json"), "utf8"));
  if (pol.version) pkgVersion = String(pol.version);
} catch {
  /* keep default */
}

const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const zipName = `FBS-BookWriter-${pkgVersion}-production-${stamp}.zip`;
const zipPath = path.join(outBase, zipName);

// 3) 清空 staging
fs.rmSync(STAGING_PARENT, { recursive: true, force: true });
fs.mkdirSync(STAGING_SKILL, { recursive: true });

function mustExist(p, label) {
  if (!fs.existsSync(p)) die(`缺失 ${label}: ${p}`);
}

mustExist(path.join(ROOT, "SKILL.md"), "SKILL.md");
mustExist(path.join(ROOT, "references"), "references/");
mustExist(path.join(ROOT, "LICENSE"), "LICENSE");

// 4) 复制生产纳入项（与 codebuddy-skill-delivery 最小上架包 + 维护脚本）
const copyRoots = [
  ["SKILL.md", "SKILL.md"],
  ["LICENSE", "LICENSE"],
  ["references", "references"],
  ["assets", "assets"],
  ["scripts", "scripts"],
  ["integration", "integration"],
  ["scenarios", "scenarios"],
];

for (const [srcRel, destRel] of copyRoots) {
  const from = path.join(ROOT, srcRel);
  const to = path.join(STAGING_SKILL, destRel);
  if (!fs.existsSync(from)) {
    if (srcRel === "assets" || srcRel === "integration" || srcRel === "scenarios") continue;
    die(`缺失: ${from}`);
  }
  fs.cpSync(from, to, { recursive: true });
}

// 5) 安装说明（生产解压用）
const installMd = `# FBS-BookWriter 生产环境安装

## 包内容

- \`SKILL.md\`：技能入口（含 YAML Frontmatter）
- \`references/\`：规范全文
- \`LICENSE\`：许可证
- \`assets/\`：可选本地构建（MD→HTML/PDF/DOCX，需 Node）
- \`integration/\`、\`scenarios/\`：可选编排与场景参考实现（与 \`doc-code-consistency.md\`、\`efficiency-implementation.md\` 一致）
- \`scripts/audit-skill-consistency.mjs\`：解压后可执行一致性自检
- \`scripts/scan-packaging-pii-patterns.mjs\`：维护者可单独跑随包路径模式扫描（发版脚本已默认执行）

## CodeBuddy Code

将本目录**整体**放到：

- 项目级：\`<项目根>/.codebuddy/skills/FBS-BookWriter/\`
- 用户级：\`~/.codebuddy/skills/FBS-BookWriter/\`

文件夹名建议与 Frontmatter \`name: FBS-BookWriter\` 一致。

## WorkBuddy

将同上结构的 \`FBS-BookWriter\` 文件夹放入 WorkBuddy 技能目录（与当前产品配置一致即可，常见为 \`.workbuddy/skills/FBS-BookWriter/\`）。

## 解压后自检（维护者 / CI，可选）

\`\`\`bash
cd FBS-BookWriter
node scripts/audit-skill-consistency.mjs
\`\`\`

写作者可跳过；详见包内 \`references/05-ops/user-vs-maintainer-scope.md\`。

## 官方参考

- [Skills 功能](https://www.codebuddy.cn/docs/cli/skills)

---
生成时间：${new Date().toISOString()}
包版本：${pkgVersion}
`;

fs.writeFileSync(path.join(STAGING_SKILL, "INSTALL.md"), installMd, "utf8");

// 6) 文件清单 MANIFEST.json
function walkFiles(dir, base = dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walkFiles(p, base, out);
    else out.push(path.relative(base, p).replace(/\\/g, "/"));
  }
  return out;
}

const files = walkFiles(STAGING_SKILL).sort();
const manifest = {
  name: "FBS-BookWriter",
  version: pkgVersion,
  packagedAt: new Date().toISOString(),
  fileCount: files.length,
  files,
};
fs.writeFileSync(path.join(STAGING_SKILL, "MANIFEST.json"), JSON.stringify(manifest, null, 2), "utf8");

// 7) 打 zip
fs.mkdirSync(outBase, { recursive: true });
if (fs.existsSync(zipPath)) fs.rmSync(zipPath);

if (process.platform === "win32") {
  const ps = `Compress-Archive -LiteralPath '${STAGING_SKILL.replace(/'/g, "''")}' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`;
  execSync(`powershell -NoProfile -Command "${ps}"`, { stdio: "inherit" });
} else {
  try {
    execSync(`zip -r -q "${zipPath}" FBS-BookWriter`, {
      cwd: STAGING_PARENT,
      stdio: "inherit",
    });
  } catch {
    die("未找到 zip 命令；请安装 zip 或使用 Windows 环境执行本脚本");
  }
}

// 8) 可选：删除 staging 节省空间（保留便于排查时可注释掉）
fs.rmSync(STAGING_PARENT, { recursive: true, force: true });

console.log("");
console.log("生产包已生成:", zipPath);
console.log("解压后顶层目录名: FBS-BookWriter/");
console.log("文件数:", files.length);
