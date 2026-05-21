// Targeted split for remaining large files with manual split points
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');

// Manually defined split points for stubborn files
const SPLIT_POINTS = {
  'acquisition-init': {
    splitAt: '### Step 1: 配置凭据',
    refFile: 'detailed-setup.md',
    pointerDesc: '详细的初始化步骤（凭据配置、NAS挂载、邮箱测试、依赖安装等）'
  },
  'acquisition-dependencies': {
    splitAt: '### Windows: install-deps.ps1',
    refFile: 'windows-install.md',
    pointerDesc: 'Windows PowerShell 安装脚本、集成说明和版本历史'
  },
  'quotation-generator': {
    splitAt: '## 实施方式',
    refFile: 'implementation-guide.md',
    pointerDesc: 'Python/WeasyPrint 实施细节、CRM更新、回写钩子和版本变更'
  },
  'company-research': {
    splitAt: '## 搜索步骤',
    refFile: 'search-procedures.md',
    pointerDesc: '详细搜索步骤、命令模板、知识库脚本、信息质量规则'
  },
  'smart-quote': {
    splitAt: '## 🔴 价格数据来源（必须读NAS！）',
    refFile: 'nas-pricing-guide.md',
    pointerDesc: 'NAS价格数据读取方法、报价记录回写脚本、汇率查询、实用技巧'
  },
  'honglong-assistant': {
    splitAt: '## 开发信跟进节奏（Drip Campaign）',
    refFile: 'operational-details.md',
    pointerDesc: '开发信跟进节奏、反Verbosity规则、对话式配置账号流程、示例对话、集成说明'
  },
  'skill-system-audit': {
    splitAt: '## 审计维度详解',
    refFile: 'audit-dimensions.md',
    pointerDesc: '各审计维度详细评分标准、检查项和修复建议'
  },
};

for (const [skillName, config] of Object.entries(SPLIT_POINTS)) {
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

  // Don't split if the remaining core is already too small
  if (splitLine < 50) {
    console.log(`  SKIP ${skillName}: split point too early (line ${splitLine})`);
    continue;
  }

  // Extract reference content
  const refContent = lines.slice(splitLine).join('\n');
  const coreContent = lines.slice(0, splitLine).join('\n');

  // Create references/ directory
  const refDir = path.join(SKILLS_DIR, skillName, 'references');
  if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
  }

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
    ? refSections.slice(0, 8).map(s => `> - ${s}`).join('\n') + (refSections.length > 8 ? `\n> - ... 及其他 ${refSections.length - 8} 个章节` : '')
    : '';

  // Add reference pointer
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

console.log(`\n=== Targeted Split Complete ===`);
