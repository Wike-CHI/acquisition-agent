// Split large SKILL.md files: move reference/detail sections to references/
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const MAX_LINES = 400;

// Headers that indicate reference-worthy content (can be moved to references/)
const REF_HEADERS = [
  '## 参考', '## 附录', '## 踩坑', '## 模板', '## 示例',
  '## 案例', '## 配置', '## 安装', '## 故障', '## FAQ',
  '## 常见问题', '## 详细', '## 扩展', '## 补充', '## 进阶',
  '## 交互式', '## A2UI', '## 集成', '## 部署', '## 调试',
  '## 命令', '## API', '## 字段', '## 参数', '## 附',
  '## 话术', '## 脚本', '## 代码示例', '## 使用技巧',
  '## 注意事项', '## 安全', '## 降级', '## 错误处理',
  '### ', // Sub-headers deep in the file are usually details
];

// Files to skip (already have good reference splits or are structured differently)
const SKIP_FILES = new Set([
  // Already have references/ content
]);

function findSplitPoint(lines) {
  // Strategy 1: Find the last major "##" header that looks like reference material
  let bestSplit = -1;
  let bestHeader = '';

  for (let i = Math.floor(lines.length * 0.4); i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('## ')) continue;

    for (const header of REF_HEADERS) {
      if (line.startsWith(header)) {
        // Prefer earlier split points (move more to references)
        if (bestSplit === -1 || i < bestSplit) {
          bestSplit = i;
          bestHeader = line;
        }
      }
    }
  }

  // Strategy 2: If no reference header found, look for a natural split around 250-350 lines
  if (bestSplit === -1) {
    const targetZone = Math.floor(MAX_LINES * 0.65); // ~260 lines
    // Find the nearest ## header in the target zone
    let nearestDist = Infinity;
    for (let i = targetZone - 60; i < Math.min(targetZone + 100, lines.length); i++) {
      if (i < 0) continue;
      const line = lines[i].trim();
      if (line.startsWith('## ')) {
        const dist = Math.abs(i - targetZone);
        if (dist < nearestDist) {
          nearestDist = dist;
          bestSplit = i;
          bestHeader = line;
        }
      }
    }
  }

  return { splitLine: bestSplit, header: bestHeader };
}

function determineRefFilename(firstHeader) {
  // Map common headers to reference filenames
  const h = firstHeader.toLowerCase();
  if (h.includes('模板') || h.includes('示例') || h.includes('案例')) return 'templates-and-examples.md';
  if (h.includes('配置') || h.includes('安装') || h.includes('部署') || h.includes('设置')) return 'setup-and-config.md';
  if (h.includes('踩坑') || h.includes('故障') || h.includes('faq') || h.includes('常见问题')) return 'troubleshooting.md';
  if (h.includes('话术') || h.includes('脚本')) return 'scripts-and-scripts.md';
  if (h.includes('api') || h.includes('参数') || h.includes('字段')) return 'api-reference.md';
  if (h.includes('a2ui') || h.includes('交互式')) return 'a2ui-output-guide.md';
  if (h.includes('集成') || h.includes('扩展')) return 'integrations.md';
  if (h.includes('步骤') || h.includes('流程') || h.includes('详细')) return 'detailed-steps.md';
  return 'extended-guide.md';
}

// Process all skill directories
const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
let splitCount = 0, okCount = 0, manualCount = 0;

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name === 'config') continue;
  if (SKIP_FILES.has(entry.name)) continue;

  const skillMdPath = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) continue;

  const content = fs.readFileSync(skillMdPath, 'utf8');
  const lines = content.split('\n');

  if (lines.length <= MAX_LINES) {
    okCount++;
    continue;
  }

  const { splitLine, header } = findSplitPoint(lines);

  if (splitLine < 0) {
    console.log(`  LARGE (${lines.length}L) no_split_point: ${entry.name} — needs manual review`);
    manualCount++;
    continue;
  }

  // Extract reference content
  const refContent = lines.slice(splitLine).join('\n');
  const coreContent = lines.slice(0, splitLine).join('\n');

  // Create references/ directory
  const refDir = path.join(SKILLS_DIR, entry.name, 'references');
  if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
  }

  // Determine reference filename
  const refFilename = determineRefFilename(header);

  // Write reference file
  const refFilePath = path.join(refDir, refFilename);
  fs.writeFileSync(refFilePath, refContent.trim() + '\n');

  // Build section summary for the pointer
  const refSections = [];
  for (const line of refContent.split('\n')) {
    const m = line.match(/^## (.+)/);
    if (m) refSections.push(m[1]);
  }

  const sectionList = refSections.length > 0
    ? refSections.map(s => `> - ${s}`).join('\n')
    : `> - ${header.replace('## ', '')}`;

  // Add reference pointer to SKILL.md
  const pointer = `
---

## 详细参考

> 以下内容已拆分到 [[references/${refFilename}]]，仅在需要时读取：
${sectionList}
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。`;

  const finalCore = coreContent.trimEnd() + '\n' + pointer + '\n';
  fs.writeFileSync(skillMdPath, finalCore);

  const newLines = finalCore.split('\n').length;
  console.log(`  SPLIT ${entry.name}: ${lines.length}L → ${newLines}L (${lines.length - newLines}L → references/${refFilename}) @ "${header}"`);
  splitCount++;
}

console.log(`\n=== Split Complete ===`);
console.log(`Split: ${splitCount} | OK (≤${MAX_LINES}): ${okCount} | Needs manual: ${manualCount}`);
