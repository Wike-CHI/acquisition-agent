/**
 * skills-router.js 测试
 * 覆盖 CHANNEL-ROUTER.md 中的所有典型场景
 * 运行: node tests/test-skills-router.js
 */

'use strict';

const { SkillsRouter, route } = require('../lib/skills-router');

// ── 简单断言工具 ───────────────────────────────────────────
let passed = 0, failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

function describe(title, fn) {
  console.log(`\n📦 ${title}`);
  fn();
}

// ──────────────────────────────────────────────────────────

describe('意图识别', () => {
  const router = new SkillsRouter({ verbose: false });

  assert(router.detectIntent('批量获客：美国输送带制造商') === 'full_pipeline',
    '批量获客 → full_pipeline');

  assert(router.detectIntent('搜索美国传送带制造商') === 'customer_discovery',
    '搜索客户 → customer_discovery');

  assert(router.detectIntent('帮我背调 Ace Belting Company') === 'company_research',
    '背调 → company_research');

  assert(router.detectIntent('LinkedIn搜索决策人') === 'decision_maker_search',
    'LinkedIn决策人 → decision_maker_search');

  assert(router.detectIntent('给客户发开发信') === 'email_outreach',
    '发开发信 → email_outreach');
});

// ──────────────────────────────────────────────────────────

describe('市场类型判断', () => {
  const router = new SkillsRouter({ verbose: false });

  assert(router.detectMarket('搜索国内输送带客户') === 'domestic',
    '国内 → domestic');

  assert(router.detectMarket('搜索美国 conveyor belt manufacturer') === 'overseas',
    '美国英文 → overseas');

  assert(router.detectMarket('找潜在客户') === 'overseas',
    '无明确市场 → 默认 overseas（红龙以出口为主）');
});

// ──────────────────────────────────────────────────────────

describe('场景1: 简单搜索 - 海外客户发现', () => {
  const result = route('搜索美国传送带制造商', { verbose: false });

  assert(result.success === true, '路由成功');
  assert(result.intent === 'customer_discovery', '意图正确');
  assert(result.market === 'overseas', '市场正确');
  assert(result.skills.length > 0, '有可用技能');
  assert(result.skills.some(s => s.skill === 'exa' || s.skill === 'teyi'),
    '包含 Exa 或 特易（海外主力渠道）');
});

// ──────────────────────────────────────────────────────────

describe('场景2: 决策人搜索 → Exa 直接选用（LinkedIn 已废弃）', () => {
  const router = new SkillsRouter({ verbose: false });
  const result = router.route('LinkedIn搜索采购负责人');

  assert(result.intent === 'decision_maker_search', '意图正确');
  // LinkedIn 已从路由表移除，Exa 是主渠道，直接在 skills 列表里
  assert(result.skills.some(s => s.skill === 'exa'), 'Exa 直接作为决策人搜索主渠道');
  assert(!result.skills.some(s => s.skill === 'linkedin'), 'LinkedIn 不再出现在路由结果中');
  console.log('  路由摘要:\n' + result.summary.split('\n').map(l => '    ' + l).join('\n'));
});

// ──────────────────────────────────────────────────────────

describe('场景3: 完整流程 → acquisition-coordinator', () => {
  const result = route('端到端获客：德国工业设备进口商 10家');

  assert(result.intent === 'full_pipeline', '意图是完整流程');
  assert(result.skills.some(s => s.skill === 'acquisition-coordinator'),
    '路由到 acquisition-coordinator');
});

// ──────────────────────────────────────────────────────────

describe('场景4: 国内市场 → 微博/微信渠道', () => {
  const result = route('搜索国内橡胶输送带采购商');

  assert(result.market === 'domestic', '市场是国内');
  assert(result.skills.some(s => s.skill === 'weibo' || s.skill === 'wechat'),
    '包含国内渠道（微博/微信）');
});

// ──────────────────────────────────────────────────────────

describe('场景5: 动态更新技能状态（LinkedIn 已废弃，标记可用不影响路由）', () => {
  const router = new SkillsRouter({ verbose: false });

  // LinkedIn 已从路由表移除，即使标记可用也不会出现在路由结果里
  router.markAvailable('linkedin');
  const result = router.route('LinkedIn搜索采购负责人');

  // 路由结果里仍然是 Exa（路由表决定，不是状态决定）
  assert(result.skills.some(s => s.skill === 'exa'), 'Exa 仍是决策人搜索主渠道');
  assert(!result.skills.some(s => s.skill === 'linkedin'), 'LinkedIn 不出现（路由表已移除）');
  assert(!result.unavailable.some(u => u.skill === 'linkedin'),
    'LinkedIn 不再在不可用列表');
});

// ──────────────────────────────────────────────────────────

describe('场景6: getStatus() 状态查询', () => {
  // 使用独立实例，避免被场景5的 markAvailable 污染
  const router = new SkillsRouter({ verbose: false });
  const status = router.getStatus();

  assert(Array.isArray(status.available), '可用列表是数组');
  assert(Array.isArray(status.unavailable), '不可用列表是数组');
  assert(status.available.includes('exa'), 'Exa 默认可用');
  assert(status.available.includes('linkedin'), 'LinkedIn 私信可用（agent-browser驱动）');
  assert(status.unavailable.includes('facebook'), 'Facebook 默认不可用');

  console.log(`  可用 (${status.available.length}): ${status.available.join(', ')}`);
  console.log(`  不可用 (${status.unavailable.length}): ${status.unavailable.join(', ')}`);
});

// ──────────────────────────────────────────────────────────

describe('场景7: 背调场景', () => {
  const result = route('帮我深度背调 Habasit AG 这家公司');

  assert(result.intent === 'company_research', '意图是企业背调');
  assert(result.skills.some(s => s.skill === 'jina-reader' || s.skill === 'exa'),
    '包含背调渠道（Jina Reader / Exa）');
});

// ──────────────────────────────────────────────────────────

// 最终统计
console.log(`\n${'─'.repeat(50)}`);
console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
if (failed === 0) {
  console.log('🎉 所有测试通过！skills-router.js 已正常落地');
} else {
  console.log(`⚠️ ${failed} 个测试失败，请检查`);
  process.exit(1);
}
