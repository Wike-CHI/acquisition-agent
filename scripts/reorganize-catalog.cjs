// Reorganize catalog.json: 14 categories → 7 domains (Skill Graph structure)
const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'skills', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

// Domain mapping: old category id → new domain id
const DOMAIN_MAP = {
  'automation': null,        // distributed
  'crm': 'conversion',
  'custom': 'acquisition',
  'document': null,          // distributed to tools
  'email': 'outreach',
  'knowledge': 'intelligence',
  'messaging': 'outreach',
  'other': null,             // distributed
  'output': 'conversion',
  'research': 'discovery',
  'sales': 'conversion',
  'social': 'outreach',
  'system': 'meta',
  'workflow': 'operations',
};

// Domain definitions
const DOMAINS = {
  acquisition: {
    id: 'acquisition',
    name: 'Core Acquisition',
    nameZh: '核心获客',
    icon: 'Target',
    description: '任务编排、初始化、工作流定义——所有获客任务的编排层',
    skills: []
  },
  discovery: {
    id: 'discovery',
    name: 'Discovery & Research',
    nameZh: '客户发现与调研',
    icon: 'Search',
    description: '搜索潜在客户、企业背调、市场研究、海关数据——找到客户并判断价值',
    skills: []
  },
  outreach: {
    id: 'outreach',
    name: 'Multi-Channel Outreach',
    nameZh: '多渠道触达',
    icon: 'Send',
    description: '开发信生成、邮件发送、WhatsApp/Telegram/LinkedIn触达——通过最佳渠道联系客户',
    skills: []
  },
  conversion: {
    id: 'conversion',
    name: 'Quote & Conversion',
    nameZh: '报价与转化',
    icon: 'TrendingUp',
    description: '智能报价、提案生成、Pipeline管理、CRM操作——把兴趣变成订单',
    skills: []
  },
  intelligence: {
    id: 'intelligence',
    name: 'Intelligence & Knowledge',
    nameZh: '情报与知识',
    icon: 'Brain',
    description: '产品知识库、记忆系统、知识图谱——Agent的长期记忆和企业知识',
    skills: []
  },
  operations: {
    id: 'operations',
    name: 'Operations & Automation',
    nameZh: '运营自动化',
    icon: 'Zap',
    description: '心跳巡检、主动Agent、日程调度、报告生成——让系统自己运行',
    skills: []
  },
  meta: {
    id: 'meta',
    name: 'System Meta',
    nameZh: '系统元技能',
    icon: 'Settings',
    description: '技能创建、审计、发现、发布管理——技能系统的自我维护',
    skills: []
  }
};

// Skill-to-domain mapping for distributed categories
const SKILL_DOMAIN_OVERRIDE = {
  // automation → distributed
  'browser-automation': 'meta',
  'composio': 'operations',
  'exa-web-search-free': 'discovery',
  'graphify': 'intelligence',
  'playwright': 'meta',
  'web-access': 'discovery',
  'web-content-fetcher': 'discovery',
  // document → distributed
  'document-pro': 'meta',
  'excel-desktop': 'meta',
  'excel-xlsx': 'meta',
  'nano-pdf': 'meta',
  'office': 'meta',
  'pdf-extract': 'meta',
  'pdf-smart-tool-cn': 'meta',
  // other → distributed
  'chrome-desktop': 'meta',
  'data-automation-service': 'operations',
  'five-step-bg-check': 'discovery',
  'hot-monitor': 'operations',
  'humanize-ai-text': 'outreach',
  'inquiry-response': 'outreach',
  'nas-file-reader': 'intelligence',
  'word-docx': 'meta',
};

// Process all skills
for (const oldCat of catalog.categories) {
  const targetDomain = DOMAIN_MAP[oldCat.id];

  for (const skill of oldCat.skills) {
    let domainId;
    if (SKILL_DOMAIN_OVERRIDE[skill.id]) {
      domainId = SKILL_DOMAIN_OVERRIDE[skill.id];
    } else {
      domainId = targetDomain;
    }

    if (domainId && DOMAINS[domainId]) {
      DOMAINS[domainId].skills.push(skill);
    }
  }
}

// Build new catalog
const newCatalog = {
  version: '2.0.0',
  updatedAt: new Date().toISOString().split('T')[0],
  architecture: 'skill-graph',
  graph_entry: '_index.md',
  domains: Object.values(DOMAINS).map(d => ({
    id: d.id,
    name: d.name,
    nameZh: d.nameZh,
    icon: d.icon,
    description: d.description,
    moc: `_index-${d.id}.md`,
    skills: d.skills
  }))
};

// Stats
const totalSkills = Object.values(DOMAINS).reduce((s, d) => s + d.skills.length, 0);
console.log('=== Catalog Reorganization ===');
for (const d of Object.values(DOMAINS)) {
  console.log(`  ${d.nameZh} (${d.id}): ${d.skills.length} skills`);
}
console.log(`  Total: ${totalSkills}`);
console.log(`  Domains: 7 (was 14 categories)`);

fs.writeFileSync(CATALOG_PATH, JSON.stringify(newCatalog, null, 2) + '\n');
console.log('\nWritten to skills/catalog.json');
