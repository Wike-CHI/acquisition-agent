// Phase 1 cleanup: catalog.json + skill.yaml removal
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const CATALOG_PATH = path.join(SKILLS_DIR, 'catalog.json');

// Fix broken descriptions
const FIXED_DESCRIPTIONS = {
  'holo-heartbeat-executor': 'HOLO心跳执行器 — 执行14项Pipeline自动巡检任务，每15分钟检查客户跟进状态、邮件回复、WhatsApp消息、CRM同步等。触发：心跳巡检、自动检查、定时任务。',
  'smart-quote': '智能报价技能 — 先背调后报价，锁对话审批流程，ICP评分驱动利润率区间。当客户问价时自动触发。触发：报价、询价、价格、多少钱。',
  'holo-social-image': '社媒图片处理技能 — 使用 GIMP CLI + PIL 进行产品图片裁剪、抠图、调色、品牌一致性处理。触发：产品图片、社媒配图、图片处理、修图。',
  'follow-up-signal-monitor': '跟进信号监控系统 — 提案/邮件发出后自动感知客户动静：沉默检测（3/7/14/30天分级）+ 价值型跟进 + IMAP邮件监控。触发：检查跟进信号、客户没回复、沉默检测。',
  'sdr-training-ground': 'SDR培训场 — AI模拟真实客户对话 + 话术评估，降低业务员成长曲线。触发：销售培训、模拟对话、话术练习。',
  'inquiry-response': '询盘应答系统 — 客户询价后的智能应答，54条多语种话术（6语种×9场景），覆盖异议处理+技术问题+竞品对比。触发：询盘、客户询价、技术问题、客户回复。',
  'hot-monitor': '热点话题监控 — 监控行业热点话题和技术趋势，发现获客新机会。触发：热点监控、行业趋势、市场动态。',
  'release-manager': '发布管理器 — 管理 acquisition-agent 的版本发布流程，生成 CHANGELOG，标记版本号。触发：发布、发版、release、版本更新。',
  'skill-onboarding-checklist': '技能入职检查清单 — 新技能的标准化检查流程：格式合规、描述完整、触发词准确、依赖声明。触发：检查新技能、技能审核、onboarding。',
  'skill-system-audit': '技能系统审计 — 全面审查技能库健康度：冗余检测、触发冲突、描述质量、使用频率统计。触发：审计技能、技能健康度、系统检查。',
  'routing-table-audit': '路由表审计 — 检查 ROUTING-TABLE.yaml 路由规则完整性，发现未归档技能和路由冲突。触发：审计路由、路由检查、路由冲突。',
  'web-access': '网页访问技能 — 通过多种后端（Jina AI / 直接fetch / Playwright）获取网页内容，处理反爬和动态页面。触发：打开网页、访问网站、抓取页面、获取网页内容。',
  'social-publish': '社媒自动发布技能 — 通过浏览器自动化将内容发布到 LinkedIn、Facebook 等平台。触发：发布到LinkedIn、发社媒、自动发布。',
  'geo-content-gen': '多语言 SEO/GEO 内容生成器 — 生成 AI 搜索引擎友好的产品内容，覆盖 LinkedIn、Facebook、Alibaba 等平台，5 种目标市场语言。触发：生成SEO内容、GEO内容、多语言产品内容。',
};

// 1. Clean catalog.json
console.log('=== Cleaning catalog.json ===');
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

let removedCount = 0;
let fixedCount = 0;

for (const category of catalog.categories) {
  const before = category.skills.length;
  category.skills = category.skills.filter(s => {
    if (s.id.startsWith('test-skill-') || s.id.startsWith('test-detail-skill-')) {
      removedCount++;
      console.log(`  REMOVE: ${s.id}`);
      return false;
    }
    // Fix broken descriptions
    if (FIXED_DESCRIPTIONS[s.id]) {
      s.description = FIXED_DESCRIPTIONS[s.id];
      console.log(`  FIX: ${s.id}`);
      fixedCount++;
    }
    // Hash placeholder for fixed skills
    if (s.hash === '0000000000000000000000000000000000000000000000000000000000000000') {
      s.hash = '__AWAITING_RECOMPUTE__';
      console.log(`  HASH_FLAG: ${s.id}`);
    }
    return true;
  });
  if (before !== category.skills.length) {
    console.log(`  Category "${category.id}": ${before} → ${category.skills.length}`);
  }
}

// Remove empty categories
catalog.categories = catalog.categories.filter(c => c.skills.length > 0);

catalog.updatedAt = new Date().toISOString().split('T')[0];
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n');
console.log(`\nRemoved: ${removedCount} | Fixed: ${fixedCount}`);
console.log(`Categories: ${catalog.categories.length} | Total skills: ${catalog.categories.reduce((s,c) => s + c.skills.length, 0)}`);

// 2. Remove skill.yaml files
console.log('\n=== Removing skill.yaml files ===');
function findYamlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'config') {
      results.push(...findYamlFiles(fullPath));
    } else if (entry.name === 'skill.yaml') {
      results.push(fullPath);
    }
  }
  return results;
}

const yamlFiles = findYamlFiles(SKILLS_DIR);
for (const yf of yamlFiles) {
  // Read skill.yaml and merge into SKILL.md frontmatter
  const skillDir = path.dirname(yf);
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  console.log(`  Processing: ${path.basename(skillDir)}`);

  // Delete skill.yaml (metadata already duplicated in SKILL.md frontmatter)
  fs.unlinkSync(yf);
  console.log(`    REMOVED: ${yf}`);
}
console.log(`\nRemoved ${yamlFiles.length} skill.yaml files`);

// 3. Report
console.log('\n=== Phase 1 Wave 1-2 Complete ===');
console.log('Next: skill merges (Wave 3)');
