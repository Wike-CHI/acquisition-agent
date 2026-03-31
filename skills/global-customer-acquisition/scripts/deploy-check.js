#!/usr/bin/env node

/**
 * 部署验证脚本
 * 检查所有依赖和配置是否正确
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('========================================');
console.log('🚀 获客技能集群部署验证');
console.log('========================================\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    checks.passed++;
    return true;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    checks.failed++;
    return false;
  }
}

function warn(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    checks.passed++;
  } else {
    console.log(`⚠️  ${name}`);
    if (details) console.log(`   ${details}`);
    checks.warnings++;
  }
}

// ========== 1. 环境检查 ==========
console.log('📋 1. 环境检查');
console.log('----------------------------------------');

// Node.js 版本
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  check('Node.js 版本', majorVersion >= 24, `当前版本: ${nodeVersion}`);
} catch (error) {
  check('Node.js 版本', false, '无法获取 Node.js 版本');
}

// Python 版本
try {
  const pythonVersion = execSync('python --version 2>&1', { encoding: 'utf-8' }).trim();
  check('Python 版本', pythonVersion.includes('Python 3'), `当前版本: ${pythonVersion}`);
} catch (error) {
  check('Python 版本', false, 'Python 未安装或不在 PATH 中');
}

console.log('');

// ========== 2. Python 依赖检查 ==========
console.log('📦 2. Python 依赖检查');
console.log('----------------------------------------');

const pythonPackages = ['python-docx', 'openpyxl', 'pypdf', 'python-pptx'];

pythonPackages.forEach(pkg => {
  try {
    execSync(`python -c "import ${pkg.replace('python-', '')}" 2>&1`, { encoding: 'utf-8' });
    check(`Python 包: ${pkg}`, true);
  } catch (error) {
    check(`Python 包: ${pkg}`, false, '未安装');
  }
});

console.log('');

// ========== 3. 核心文件检查 ==========
console.log('📄 3. 核心文件检查');
console.log('----------------------------------------');

const coreFiles = [
  { path: 'lib/quotation-generator.js', name: '报价单生成器' },
  { path: 'lib/customer-manager.js', name: '客户管理器' },
  { path: 'lib/email-polisher.js', name: '开发信润色器' },
  { path: 'config/products.json', name: '产品配置' },
  { path: 'config/customer-status.json', name: '客户状态配置' },
  { path: 'tests/test-integration.js', name: '集成测试' },
  { path: 'tests/generate-real-files.py', name: '文件生成测试' },
  { path: 'SKILL.md', name: '主技能文档' },
  { path: 'QUICK-START.md', name: '快速指南' },
  { path: 'DEPLOYMENT.md', name: '部署文档' }
];

coreFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file.path);
  const exists = fs.existsSync(fullPath);
  if (exists) {
    const stats = fs.statSync(fullPath);
    check(file.name, true, `${file.path} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    check(file.name, false, `${file.path} 不存在`);
  }
});

console.log('');

// ========== 4. 配置文件验证 ==========
console.log('⚙️  4. 配置文件验证');
console.log('----------------------------------------');

// 验证 products.json
try {
  const productsPath = path.join(__dirname, '..', 'config/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  check('产品配置 JSON 格式', true);
  check('产品系列数量', Object.keys(products.products).length >= 6, `当前: ${Object.keys(products.products).length} 个`);
  check('公司信息完整性', products.company && products.company.name, products.company?.name);
} catch (error) {
  check('产品配置 JSON 格式', false, error.message);
}

// 验证 customer-status.json
try {
  const statusPath = path.join(__dirname, '..', 'config/customer-status.json');
  const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
  check('客户状态配置 JSON 格式', true);
  check('状态数量', status.statuses && status.statuses.length >= 9, `当前: ${status.statuses?.length} 个`);
  check('等级阈值', status.gradeThresholds && Object.keys(status.gradeThresholds).length >= 4);
} catch (error) {
  check('客户状态配置 JSON 格式', false, error.message);
}

console.log('');

// ========== 5. 测试执行 ==========
console.log('🧪 5. 测试执行');
console.log('----------------------------------------');

// JavaScript 测试
try {
  console.log('运行 JavaScript 单元测试...');
  const testOutput = execSync('node tests/test-integration.js', {
    encoding: 'utf-8',
    cwd: path.join(__dirname, '..')
  });
  const passMatch = testOutput.match(/通过: (\d+)\/(\d+)/);
  if (passMatch) {
    const passed = parseInt(passMatch[1]);
    const total = parseInt(passMatch[2]);
    check('JavaScript 单元测试', passed === total, `${passed}/${total} 通过`);
  } else {
    check('JavaScript 单元测试', false, '无法解析测试结果');
  }
} catch (error) {
  check('JavaScript 单元测试', false, error.message);
}

// Python 测试
try {
  console.log('运行 Python 文件生成测试...');
  const testOutput = execSync('python tests/generate-real-files.py', {
    encoding: 'utf-8',
    cwd: path.join(__dirname, '..')
  });
  check('Python 文件生成测试', testOutput.includes('✅'), '文件生成成功');
} catch (error) {
  check('Python 文件生成测试', false, error.message);
}

console.log('');

// ========== 6. 输出文件检查 ==========
console.log('📁 6. 输出文件检查');
console.log('----------------------------------------');

const outputFiles = [
  { path: 'test-output/quotation-ace-belting.docx', name: '报价单示例', minSize: 30000 },
  { path: 'test-output/customer-list-2026-03-28.xlsx', name: '客户列表示例', minSize: 5000 }
];

outputFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file.path);
  const exists = fs.existsSync(fullPath);
  if (exists) {
    const stats = fs.statSync(fullPath);
    const sizeOK = stats.size >= file.minSize;
    check(file.name, sizeOK, `${file.path} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    warn(file.name, false, `${file.path} 不存在（需要运行测试）`);
  }
});

console.log('');

// ========== 7. 技能依赖检查 ==========
console.log('🔗 7. 技能依赖检查');
console.log('----------------------------------------');

const requiredSkills = [
  'company-background-check',
  'market-research',
  'cold-email-generator',
  'exa-search',
  'tavily-search',
  'brave-web-search',
  'search-first',
  'deep-research',
  'scrapling',
  'agent-browser',
  'data-scraper-agent',
  'article-writing',
  'content-engine',
  'email-skill',
  'daily-report',
  'docx',
  'pdf',
  'xlsx',
  'pptx',
  'continuous-learning',
  'autonomous-loops',
  'calendar-skill'
];

const agentsSkillsPath = path.join(process.env.USERPROFILE || process.env.HOME, '.agents/skills');
const openclawSkillsPath = path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw/skills');

let installedSkills = 0;
requiredSkills.forEach(skill => {
  const agentsPath = path.join(agentsSkillsPath, skill);
  const openclawPath = path.join(openclawSkillsPath, skill);
  const exists = fs.existsSync(agentsPath) || fs.existsSync(openclawPath);
  if (exists) {
    installedSkills++;
  }
});

check('技能依赖', installedSkills === requiredSkills.length, `${installedSkills}/${requiredSkills.length} 已安装`);

console.log('');

// ========== 8. Git 状态检查 ==========
console.log('📊 8. Git 状态检查');
console.log('----------------------------------------');

try {
  const gitStatus = execSync('git status --short', {
    encoding: 'utf-8',
    cwd: path.join(__dirname, '..')
  }).trim();
  warn('Git 工作区', gitStatus === '', gitStatus === '' ? '工作区干净' : '有未提交的更改');

  const lastCommit = execSync('git log -1 --oneline', {
    encoding: 'utf-8',
    cwd: path.join(__dirname, '..')
  }).trim();
  check('Git 提交', true, lastCommit);
} catch (error) {
  warn('Git 状态', false, '无法获取 Git 状态');
}

console.log('');

// ========== 汇总 ==========
console.log('========================================');
console.log('📊 部署验证汇总');
console.log('========================================');
console.log(`✅ 通过: ${checks.passed}`);
console.log(`❌ 失败: ${checks.failed}`);
console.log(`⚠️  警告: ${checks.warnings}`);
console.log('');

const total = checks.passed + checks.failed;
const successRate = ((checks.passed / total) * 100).toFixed(1);

if (checks.failed === 0) {
  console.log(`🎉 部署验证成功！成功率: ${successRate}%`);
  console.log('');
  console.log('✅ 所有检查通过，可以部署到生产环境。');
  process.exit(0);
} else {
  console.log(`❌ 部署验证失败！成功率: ${successRate}%`);
  console.log('');
  console.log('⚠️  请修复失败的检查项后再部署。');
  process.exit(1);
}
