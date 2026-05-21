// Fix remaining 3 files with corrected split points
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');

const FIXES = {
  'smart-quote': {
    splitAt: '## 常用话术',
    refFile: 'scripts-and-tactics.md',
    pointerDesc: '常用话术模板、实用技巧和报价策略速查'
  },
  'honglong-assistant': {
    splitAt: '## 沟通风格',
    refFile: 'operational-details.md',
    pointerDesc: '沟通风格指南、核心能力详情、开发信跟进节奏、反Verbosity规则、配置流程、示例对话和集成说明'
  },
  'skill-system-audit': {
    splitAt: '## 完整审计报告模板',
    refFile: 'audit-templates.md',
    pointerDesc: '完整审计报告模板、路由表重建流程、web-access指南、双轨索引系统、Frontmatter验证和硬编码凭证扫描'
  },
};

for (const [skillName, config] of Object.entries(FIXES)) {
  const skillMdPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    console.log(`  SKIP ${skillName}: file not found`);
    continue;
  }

  const content = fs.readFileSync(skillMdPath, 'utf8');
  const lines = content.split('\n');

  // Find the split point
  let splitLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === config.splitAt) {
      splitLine = i;
      break;
    }
  }

  if (splitLine < 0) {
    console.log(`  SKIP ${skillName}: split point "${config.splitAt}" not found`);
    continue;
  }

  if (splitLine < 80) {
    console.log(`  SKIP ${skillName}: split point too early (line ${splitLine})`);
    continue;
  }

  // Extract reference content
  const refContent = lines.slice(splitLine).join('\n');
  const coreContent = lines.slice(0, splitLine).join('\n');

  // Create references/ directory
  const refDir = path.join(SKILLS_DIR, skillName, 'references');
  if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true });

  // Write reference file
  const refFilePath = path.join(refDir, config.refFile);
  fs.writeFileSync(refFilePath, refContent.trim() + '\n');

  // Build section summary
  const refSections = [];
  for (const line of refContent.split('\n')) {
    const m = line.match(/^## (.+)/);
    if (m) refSections.push(m[1]);
  }

  const sectionList = refSections.length > 0
    ? refSections.slice(0, 6).map(s => `> - ${s}`).join('\n') + (refSections.length > 6 ? `\n> - ... 及其他 ${refSections.length - 6} 个章节` : '')
    : '';

  // Build pointer
  const pointer = `
---

## 详细参考

> 以下内容已拆分到 [[references/${config.refFile}]]，仅在需要时读取：
${sectionList || `> - ${config.pointerDesc}`}
>
> ${config.pointerDesc}。`;

  const finalCore = coreContent.trimEnd() + '\n' + pointer + '\n';
  fs.writeFileSync(skillMdPath, finalCore);

  const newLines = finalCore.split('\n').length;
  console.log(`  SPLIT ${skillName}: ${lines.length}L → ${newLines}L (${lines.length - newLines}L → references/${config.refFile})`);
}

console.log(`\n=== Fix Split Complete ===`);
