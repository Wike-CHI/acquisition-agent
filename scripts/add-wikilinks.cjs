// Add Skill Graph Wiki-links to all SKILL.md files
// For each skill: add domain MOC link after the frontmatter/heading
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const CATALOG_PATH = path.join(SKILLS_DIR, 'catalog.json');

// Domain display names
const DOMAIN_NAMES = {
  acquisition: '核心获客',
  discovery: '客户发现与调研',
  outreach: '多渠道触达',
  conversion: '报价与转化',
  intelligence: '情报与知识',
  operations: '运营自动化',
  meta: '系统元技能',
};

// Known upstream/downstream relationships for key skills
const KNOWN_LINKS = {
  'acquisition-coordinator': { up: '[[_index-acquisition|核心流程领域]]', down: '[[global-customer-acquisition|获客总入口]] → 各子技能' },
  'acquisition-workflow': { up: '[[_index-acquisition|核心流程领域]]', down: '[[acquisition-coordinator|任务编排器]]（引用本流程）' },
  'acquisition-init': { up: '[[_index-acquisition|核心流程领域]]', down: '[[acquisition-dependencies|依赖安装]]（环境就绪后）' },
  'acquisition-dependencies': { up: '[[_index-acquisition|核心流程领域]]', down: '[[acquisition-init|系统初始化]]（依赖安装后）' },
  'acquisition-evaluator': { up: '[[_index-acquisition|核心流程领域]]', down: '[[company-research|背调报告]]（验收）+ [[cold-email-generator|开发信]]（验收）' },
  'teyi-customs': { up: '[[_index-discovery|客户发现领域]]', down: '[[company-research|企业背调]]（发现采购商后）' },
  'exa-web-search-free': { up: '[[_index-discovery|客户发现领域]]', down: '[[company-research|企业背调]] + [[deep-research|深度调研]]' },
  'market-research': { up: '[[_index-discovery|客户发现领域]]', down: '[[market-development-report|市场开发报告]]' },
  'deep-research': { up: '[[_index-discovery|客户发现领域]]', down: '[[customer-intelligence|客户情报整合]]' },
  'customer-intelligence': { up: '[[_index-discovery|客户发现领域]]', down: '[[knowledge-base|团队知识库]]（存档） + [[smart-quote|智能报价]]（ICP评分→利润率）' },
  'market-development-report': { up: '[[_index-discovery|客户发现领域]]', down: '[[market-research|市场研究]] + [[teyi-customs|海关数据]]' },
  'five-step-bg-check': { up: '[[_index-discovery|客户发现领域]]', down: '[[company-research|深度背调]]（初筛通过后）' },
  'facebook-acquisition': { up: '[[_index-discovery|客户发现领域]]', down: '[[company-research|企业背调]]（找到公司后）' },
  'instagram-acquisition': { up: '[[_index-discovery|客户发现领域]]', down: '[[company-research|企业背调]]（找到公司后）' },
  'humanize-ai-text': { up: '[[company-research|企业背调]]（个性化素材） ← [[_index-outreach|触达领域]]', down: '[[email-sender|邮件发送]]' },
  'email-sender': { up: '[[cold-email-generator|开发信生成]] ← [[_index-outreach|触达领域]]', down: '[[follow-up-signal-monitor|跟进监控]]' },
  'email-inbox': { up: '[[_index-outreach|触达领域]]', down: '[[inquiry-response|询盘应答]]（客户回复）→ [[crm|CRM]]（更新）' },
  'whatsapp-outreach': { up: '[[company-research|企业背调]] ← [[_index-outreach|触达领域]]', down: '[[delivery-queue|发送队列]] → [[follow-up-signal-monitor|跟进监控]]' },
  'telegram-toolkit': { up: '[[_index-outreach|触达领域]]', down: '[[cold-email-generator|开发信生成]]（双通道）' },
  'delivery-queue': { up: '[[email-sender|邮件发送]] / [[whatsapp-outreach|WhatsApp]] ← [[_index-outreach|触达领域]]', down: '[[follow-up-signal-monitor|跟进监控]]' },
  'quotation-generator': { up: '[[smart-quote|智能报价]]（价格确认后）← [[_index-conversion|转化领域]]', down: '[[sales-pipeline-tracker|Pipeline更新]]' },
  'holo-proposal-generator': { up: '[[smart-quote|智能报价]] + [[company-research|企业背调]] ← [[_index-conversion|转化领域]]', down: '客户决策 → [[follow-up-signal-monitor|跟进监控]]' },
  'sales-pipeline-tracker': { up: '[[_index-conversion|转化领域]]', down: '[[holo-heartbeat-executor|心跳巡检]]（自动监控） + [[crm|CRM]]' },
  'crm': { up: '[[_index-conversion|转化领域]]', down: '[[fumamx-crm|孚盟CRM]]（外部系统）+ [[customer-deduplication|客户去重]]' },
  'fumamx-crm': { up: '[[crm|通用CRM]] ← [[_index-conversion|转化领域]]', down: '[[fumamx-update|CRM客户更新]]' },
  'fumamx-update': { up: '[[fumamx-crm|孚盟CRM]] ← [[_index-conversion|转化领域]]', down: '培育序列自动化' },
  'customer-deduplication': { up: '[[crm|CRM]] ← [[_index-conversion|转化领域]]', down: '[[knowledge-base|团队知识库]]（统一客户视图）' },
  'honglong-products': { up: '[[_index-intelligence|情报领域]]', down: '[[knowledge-base|团队知识库]] + [[smart-quote|智能报价]]（产品→报价）+ [[quotation-generator|报价单]]' },
  'humanoid-memory': { up: '[[_index-intelligence|情报领域]]', down: '对话记忆 → 客户交互历史' },
  'smart-memory': { up: '[[_index-intelligence|情报领域]]', down: '向量检索 → [[company-research|背调]] + [[knowledge-base|知识库]]' },
  'supermemory': { up: '[[_index-intelligence|情报领域]]', down: '大规模语义搜索 → [[deep-research|深度调研]]' },
  'knowledge-base': { up: '[[company-research|背调报告]] / [[cold-email-generator|开发信]] / [[smart-quote|报价]] ← [[_index-intelligence|情报领域]]', down: 'NAS持久化 → 全员复用' },
  'nas-file-reader': { up: '[[_index-intelligence|情报领域]]', down: '[[honglong-products|产品知识库]]（兜底数据源）' },
  'holo-heartbeat-executor': { up: '[[_index-operations|运营领域]]', down: '[[sales-pipeline-tracker|Pipeline]] + [[follow-up-signal-monitor|跟进]] + [[email-inbox|邮件]] 自动巡检' },
  'proactive-agent': { up: '[[_index-operations|运营领域]]', down: '[[holo-heartbeat-executor|心跳]] + [[calendar-skill|日程]] 自主调度' },
  'proactive-agent-lite': { up: '[[_index-operations|运营领域]]', down: '[[holo-heartbeat-executor|心跳]]（轻量版）' },
  'calendar-skill': { up: '[[_index-operations|运营领域]]', down: '[[holo-heartbeat-executor|心跳]]（日程触发）' },
  'holo-activity-log': { up: '[[_index-operations|运营领域]]', down: '[[daily-report-writer|日报生成]]（数据源）' },
  'daily-report-writer': { up: '[[_index-operations|运营领域]]', down: '日报写入 reports/ → Boss监控' },
};

// Load catalog to get domain mapping
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
const skillDomains = {};
for (const domain of catalog.domains) {
  for (const skill of domain.skills) {
    skillDomains[skill.id] = domain.id;
  }
}

// Process all skill directories
const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
let processed = 0, skipped = 0, alreadyHad = 0;

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name === 'config') continue;

  const skillMdPath = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    console.log(`  SKIP (no SKILL.md): ${entry.name}`);
    skipped++;
    continue;
  }

  let content = fs.readFileSync(skillMdPath, 'utf8');

  // Skip if already has Wiki-link navigation
  if (content.includes('Skill Graph') || content.includes('[[_index-') || content.includes('导航链')) {
    alreadyHad++;
    continue;
  }

  const skillId = entry.name;
  const domain = skillDomains[skillId] || 'meta';
  const domainName = DOMAIN_NAMES[domain] || '系统元技能';
  const links = KNOWN_LINKS[skillId];

  // Build navigation line
  let navLine;
  if (links) {
    navLine = `> **Skill Graph：** 领域 → [[_index-${domain}|${domainName}领域]] | 上游 ← ${links.up} | 下游 → ${links.down}`;
  } else {
    navLine = `> **Skill Graph：** 领域 → [[_index-${domain}|${domainName}领域]]`;
  }

  // Find insertion point: after the first `# ` heading line
  const lines = content.split('\n');
  let insertIdx = -1;
  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (!inFrontmatter && lines[i].startsWith('# ')) {
      insertIdx = i + 1; // After the heading
      break;
    }
  }

  if (insertIdx > 0) {
    // Insert a blank line, then nav line, then blank line
    lines.splice(insertIdx, 0, '', navLine, '');
    content = lines.join('\n');
    fs.writeFileSync(skillMdPath, content);
    processed++;
  }
}

console.log(`\n=== Wiki-link Addition Complete ===`);
console.log(`Processed: ${processed}`);
console.log(`Already had links: ${alreadyHad}`);
console.log(`Skipped: ${skipped}`);
console.log(`Total skill dirs: ${entries.filter(e => e.isDirectory() && !e.name.startsWith('_') && e.name !== 'config').length}`);
