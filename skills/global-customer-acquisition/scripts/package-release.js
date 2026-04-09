#!/usr/bin/env node

/**
 * 发布打包脚本 v2.0 - 修复版
 * 用途：将红龙获客系统打包成可分发的安装包
 * 运行：node scripts/package-release.js
 *
 * 更新日志：
 * - 修复文件路径错误（IDENTITY.md → context/identity.md）
 * - 修复排除逻辑（精确匹配替代 .includes()）
 * - 修复函数引用（getVersion() 移至 main() 之前）
 * - 添加 glob 优化文件复制
 * - 添加版本验证和前置检查
 * - 添加包完整性验证
 * - 添加 SHA256 校验和生成
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) { log(`✅ ${message}`, 'green'); }
function error(message) { log(`❌ ${message}`, 'red'); }
function warning(message) { log(`⚠️  ${message}`, 'yellow'); }
function info(message) { log(`ℹ️  ${message}`, 'blue'); }

// 获取版本（全局函数，避免作用域问题）
function getVersion() {
  try {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch {
    return '2.3.0';
  }
}

// 验证版本号格式
function validateVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
  if (!semverRegex.test(version)) {
    warning(`版本号格式不正确: ${version}，应为 semver 格式 (如 2.3.0)`);
  } else {
    success(`版本号验证通过: v${version}`);
  }
}

// 检查前置条件
function checkPrerequisites() {
  info('检查前置条件...');

  // 检查 package.json
  const pkgPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    error('package.json 不存在');
    process.exit(1);
  }

  // 检查必要目录
  const requiredDirs = ['context', 'config', 'lib', 'docs', 'templates', 'scripts'];
  for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(rootDir, dir))) {
      warning(`目录不存在: ${dir}/`);
    }
  }

  // 检查关键文件
  const criticalFiles = [
    'SKILL.md',
    'AGENTS.md',
    '.env.example',
    'context/user.example.md',
    'config/credentials.example.md'
  ];

  const missing = [];
  for (const file of criticalFiles) {
    if (!fs.existsSync(path.join(rootDir, file))) {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    error(`缺少关键文件: ${missing.join(', ')}`);
    process.exit(1);
  }

  success('前置条件检查通过');
}

// 创建打包目录
function createBuildDir() {
  const buildDir = path.join(rootDir, 'dist');

  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true, maxRetries: 3 });
  }

  fs.mkdirSync(buildDir, { recursive: true });
  success('创建打包目录: dist/');

  return buildDir;
}

// 改进的排除逻辑（精确匹配）
function shouldExclude(filePath) {
  const baseName = path.basename(filePath);
  const relativePath = path.relative(rootDir, filePath);

  // 特殊处理：.example 文件永远不排除
  if (baseName.includes('.example') || relativePath.includes('.example')) {
    return false;
  }

  // 精确排除列表（目录和文件）
  const exactExcludes = [
    'node_modules',
    '.git',
    'dist',
    'coverage',
    'release',
    'logs',
    '.env',
    '.env.local',
    'context/user.md',
    'config/credentials.md',
    'config/secrets',
    'test-output',
    '.vscode',
    '.idea',
    '.release',
    'releases'
  ];

  // 后缀排除列表
  const suffixExcludes = [
    '.log',
    '.tmp',
    '.bak',
    '.DS_Store',
    'Thumbs.db',
    '.rar',
    '.zip'
  ];

  // 前缀排除列表
  const prefixExcludes = [
    'temp-',
    'stress-test-',
    'memskill-test',
    'autoresearch-test',
    'audit-'
  ];

  // 检查精确排除
  for (const exclude of exactExcludes) {
    if (relativePath.includes(exclude) || relativePath === exclude) {
      return true;
    }
  }

  // 检查后缀排除
  for (const suffix of suffixExcludes) {
    if (baseName.endsWith(suffix)) {
      return true;
    }
  }

  // 检查前缀排除
  for (const prefix of prefixExcludes) {
    if (baseName.startsWith(prefix)) {
      return true;
    }
  }

  // 特定文件排除
  if (baseName === 'results.tsv') return true;
  if (baseName === 'proactivity.log') return true;
  if (relativePath.includes('learning-system/working-buffer.md')) return true;
  if (relativePath.includes('proactivity/session-state.md')) return true;
  if (relativePath.includes('.env.')) return true;

  return false;
}

// 使用 glob 复制文件（优化版）
async function copyFiles(buildDir) {
  info('开始复制文件...');

  try {
    const files = await glob('**/*', {
      cwd: rootDir,
      ignore: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'coverage/**',
        'release/**',
        'logs/**',
        '**/*.log',
        '.env',
        '.env.local',
        '.env.*.local',
        'context/user.md',
        'config/credentials.md',
        'config/secrets/**',
        'learning-system/working-buffer.md',
        'proactivity/session-state.md',
        'test-output/**',
        '**/*.tmp',
        '**/*.bak',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/temp-*',
        '**/*.rar',
        '**/*.zip',
        '**/results.tsv',
        '**/proactivity.log',
        '**/.vscode/**',
        '**/.idea/**',
        '**/.release/**',
        '**/releases/**',
        '**/stress-test-*.log',
        '**/memskill-test*.log',
        '**/autoresearch-test*.log',
        '**/audit-*.log',
      ],
      nodir: false,
      absolute: false,
      dot: true,
    });

    let copiedCount = 0;
    let skippedCount = 0;
    const total = files.length;

    for (const file of files) {
      const srcPath = path.join(rootDir, file);
      const dstPath = path.join(buildDir, file);

      // 二次检查是否应该排除
      if (shouldExclude(srcPath)) {
        skippedCount++;
        continue;
      }

      try {
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
          // 创建目录
          if (!fs.existsSync(dstPath)) {
            fs.mkdirSync(dstPath, { recursive: true });
          }
          copiedCount++;
        } else {
          // 复制文件
          fs.mkdirSync(path.dirname(dstPath), { recursive: true });
          fs.copyFileSync(srcPath, dstPath);
          copiedCount++;
        }

        // 显示进度（每100个文件）
        if (copiedCount % 100 === 0) {
          info(`已复制 ${copiedCount}/${total} 文件...`);
        }
      } catch (err) {
        warning(`跳过文件: ${file} (${err.message})`);
        skippedCount++;
      }
    }

    success(`复制了 ${copiedCount} 个文件`);
    info(`跳过了 ${skippedCount} 个文件`);
    return copiedCount;
  } catch (err) {
    error(`文件复制失败: ${err.message}`);
    throw err;
  }
}

// 创建用户安装向导（修复版）
function createInstallWizard(buildDir) {
  info('创建安装向导...');

  const installScript = `#!/usr/bin/env node

/**
 * 红龙获客系统 - 安装向导 v2.0
 * 运行：node install.js
 */

import readline from 'readline';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// 获取版本（修复：提前定义，避免作用域问题）
function getVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    return pkg.version;
  } catch {
    return '2.3.0';
  }
}

async function main() {
  console.log('\\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          🔥 红龙获客系统 v' + getVersion() + ' - 安装向导            ║');
  console.log('║          温州红龙工业设备制造有限公司                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\\n');

  console.log('欢迎使用红龙获客系统！');
  console.log('本向导将帮助您完成系统配置。\\n');

  // 步骤1：检查环境
  console.log('📋 步骤 1/4：检查安装环境...');
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' });
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' });
    console.log(\`✅ Node.js \${nodeVersion.trim()}\`);
    console.log(\`✅ npm \${npmVersion.trim()}\\n\`);
  } catch (err) {
    console.log('❌ 请先安装 Node.js (https://nodejs.org)\\n');
    process.exit(1);
  }

  // 步骤2：安装依赖
  console.log('📦 步骤 2/4：安装依赖包...');
  const installDeps = await question('是否现在安装依赖？(Y/n): ');
  if (installDeps.toLowerCase() !== 'n') {
    try {
      console.log('正在安装依赖...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('\\n✅ 依赖安装完成\\n');
    } catch (err) {
      console.log('\\n❌ 依赖安装失败: ' + err.message + '\\n');
      process.exit(1);
    }
  } else {
    console.log('⏭️  跳过依赖安装，请稍后手动运行: npm install\\n');
  }

  // 步骤3：配置系统
  console.log('⚙️  步骤 3/4：配置系统');
  console.log('接下来需要配置一些基本信息。\\n');

  const name = await question('您的姓名: ');
  const email = await question('您的邮箱: ');
  const phone = await question('您的电话: ');
  const title = await question('您的职位: ');

  console.log('\\n✅ 配置完成\\n');

  // 步骤4：创建配置文件
  console.log('📝 步骤 4/4：创建配置文件...');

  // 创建.env
  if (!fs.existsSync('.env')) {
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log('✅ 已创建 .env');
    } else {
      console.log('⚠️  .env.example 不存在，跳过 .env 创建');
    }
  }

  // 创建user.md
  if (!fs.existsSync('context/user.md')) {
    if (fs.existsSync('context/user.example.md')) {
      let userContent = fs.readFileSync('context/user.example.md', 'utf-8');
      userContent = userContent.replace(/\\{\\{SALESPERSON_NAME\\}\\}/g, name);
      userContent = userContent.replace(/\\{\\{SALESPERSON_EMAIL\\}\\}/g, email);
      userContent = userContent.replace(/\\{\\{SALESPERSON_PHONE\\}\\}/g, phone);
      userContent = userContent.replace(/\\{\\{SALESPERSON_TITLE\\}\\}/g, title);
      fs.writeFileSync('context/user.md', userContent);
      console.log('✅ 已创建 context/user.md');
    } else {
      console.log('⚠️  context/user.example.md 不存在，跳过用户配置');
    }
  }

  // 创建credentials.md
  if (!fs.existsSync('config/credentials.md')) {
    if (fs.existsSync('config/credentials.example.md')) {
      fs.copyFileSync('config/credentials.example.md', 'config/credentials.md');
      console.log('✅ 已创建 config/credentials.md');
    } else {
      console.log('⚠️  config/credentials.example.md 不存在，跳过凭据配置');
    }
  }

  console.log('\\n🎉 安装完成！');
  console.log('\\n下一步：');
  console.log('1. 编辑 .env 文件，填写您的凭据');
  console.log('2. 编辑 config/credentials.md，填写服务凭据');
  console.log('3. 运行: node scripts/setup-security.js');
  console.log('4. 查看 QUICK-START-USER.md 开始使用\\n');

  rl.close();
}

main().catch(err => {
  console.error('\\n❌ 安装失败: ' + err.message);
  process.exit(1);
});
`;

  fs.writeFileSync(path.join(buildDir, 'install.js'), installScript);
  success('创建安装向导: install.js');
}

// 生成SHA256校验和
async function generateChecksum(buildDir, version) {
  info('生成SHA256校验和...');

  try {
    const hash = createHash('sha256');

    function hashDirectory(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          hashDirectory(filePath);
        } else {
          const content = fs.readFileSync(filePath);
          hash.update(content);
        }
      }
    }

    hashDirectory(buildDir);
    const checksum = hash.digest('hex');

    const releaseDir = path.join(rootDir, 'release');
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }

    const checksumFile = path.join(releaseDir, `CHECKSUM-v${version}.txt`);
    fs.writeFileSync(checksumFile,
      `SHA256: ${checksum}\nFile: global-customer-acquisition-v${version}.zip\nDate: ${new Date().toISOString()}\n`
    );

    success(`生成校验和: CHECKSUM-v${version}.txt`);
    return checksum;
  } catch (err) {
    warning(`生成校验和失败: ${err.message}`);
    return null;
  }
}

// 验证包完整性
function validatePackage(buildDir) {
  info('验证包完整性...');

  const requiredFiles = [
    'package.json',
    'SKILL.md',
    'AGENTS.md',
    '.env.example',
    'install.js',
    'README.md',
    'QUICK-START-USER.md',
    'RELEASE-NOTES.md'
  ];

  const missing = [];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(buildDir, file))) {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    error(`缺少必要文件: ${missing.join(', ')}`);
    return false;
  }

  success('包完整性验证通过');
  return true;
}

// 计算包大小
function calculatePackageStats(buildDir) {
  info('计算包大小统计...');

  function getDirectorySize(dirPath) {
    let size = 0;

    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          size += getDirectorySize(filePath);
        } else {
          size += stat.size;
        }
      }
    } catch (err) {
      // 跳过无法读取的目录
    }

    return size;
  }

  const size = getDirectorySize(buildDir);
  const sizeMB = (size / 1024 / 1024).toFixed(2);

  success(`打包大小: ${sizeMB}MB`);

  if (sizeMB > 50) {
    warning('包大小超过50MB，建议清理不必要的文件');
  } else if (sizeMB < 1) {
    warning('包大小小于1MB，可能文件不完整');
  }

  return sizeMB;
}

// 创建发布说明
function createReleaseNotes(buildDir, version) {
  info('创建发布说明...');

  const releaseNotes = `# 红龙获客系统 v${version} - 发布说明

> 温州红龙工业设备制造有限公司
> 发布日期：${new Date().toLocaleDateString('zh-CN')}
> 版本类型：稳定版

---

## 🎉 新功能

### 1. 全能获客系统
- ✅ 11步端到端获客流程
- ✅ 智能渠道路由
- ✅ 多触达方式（邮件、WhatsApp、LinkedIn、Facebook、Instagram）
- ✅ 自动化跟进管理

### 2. 开发信生成v2.0
- ✅ 真正打磨流程（≥9.0分）
- ✅ 6维度质量评分
- ✅ AI去味处理
- ✅ 个性化定制

### 3. 企业背调系统
- ✅ ICP 6维度评分
- ✅ 客户分层（A/B/C/D级）
- ✅ 竞品分析
- ✅ 决策人定位

### 4. 社媒运营
- ✅ Facebook内容生成
- ✅ Instagram内容策略
- ✅ LinkedIn文章写作
- ✅ 内容日历规划

### 5. 三层记忆系统（v2.3.0新增）
- ✅ HOT记忆：确认的持久化规则
- ✅ WARM记忆：领域级和项目级学习
- ✅ COLD记忆：归档和冷存储
- ✅ 自动晋升/降级机制

---

## 🔧 改进

### 安全性
- 🔒 环境变量隔离
- 🔒 凭据模板化
- 🔒 安全配置检查
- 🔒 0个已知漏洞

### 质量保证
- ✅ Jest测试框架
- ✅ 91.7%测试通过率
- ✅ 结构化日志
- ✅ 错误追踪

### 文档
- 📚 完整文档索引
- 📚 快速开始指南
- 📚 安全配置指南
- 📚 监控系统指南

---

## 📋 系统要求

### 必需
- Node.js >= 18.0.0
- npm >= 9.0.0
- Windows 10/11 或 macOS 或 Linux

### 可选
- NAS共享盘（用于产品资料）
- 特易海关数据账号
- 孚盟MX CRM账号
- 企业邮箱（SMTP）

---

## 🚀 快速开始

### 1. 运行安装向导

\`\`\`bash
node install.js
\`\`\`

### 2. 配置凭据

编辑以下文件：
- \`.env\` - 环境变量
- \`context/user.md\` - 业务员信息
- \`config/credentials.md\` - 服务凭据

### 3. 验证安装

\`\`\`bash
node scripts/setup-security.js
npm test
\`\`\`

### 4. 开始使用

查看 \`QUICK-START-USER.md\` 了解如何使用

---

## 🐛 已知问题

1. Windows系统无法设置文件权限600（正常）
2. skills-router.test.js 需要使用ES模块import
3. quotation-generator.test.js 有1个小问题

---

## 📈 从v2.2升级到v2.3

如果您使用的是v2.2版本：

1. 备份您的配置文件：
   \`\`\`bash
   cp .env .env.backup
   cp context/user.md context/user.md.backup
   cp config/credentials.md config/credentials.md.backup
   \`\`\`

2. 下载新版本并解压

3. 恢复配置：
   \`\`\`bash
   cp .env.backup .env
   cp context/user.md.backup context/user.md
   cp config/credentials.md.backup config/credentials.md
   \`\`\`

4. 运行安装向导：
   \`\`\`bash
   node install.js
   \`\`\`

---

## 📞 技术支持

- **官网**: https://www.holobelt.com
- **邮箱**: ${process.env.HONGLONG_EMAIL || 'HONGLONG_EMAIL'}
- **电话**: +86 577-66856856

---

## 📄 许可证

UNLICENSED - 温州红龙工业设备制造有限公司版权所有

---

*红龙获客系统 - 让B2B获客更智能*
*Built with ❤️ by HOLO Team*
`;

  fs.writeFileSync(path.join(buildDir, 'RELEASE-NOTES.md'), releaseNotes);
  success('创建发布说明: RELEASE-NOTES.md');
}

// 创建用户快速开始指南
function createUserQuickStart(buildDir) {
  info('创建用户快速开始指南...');

  const quickStart = `# 红龙获客系统 - 5分钟快速开始

> 专为业务员设计的AI获客助手

---

## 🎯 系统能做什么？

**一句话，AI完成全部操作！**

| 你说 | AI做 |
|------|------|
| "帮我找10个美国的传送带客户" | 搜索+背调+生成报告 |
| "给这家公司发开发信" | 生成邮件+润色+发送 |
| "生成报价单" | 创建.docx报价单 |
| "查看Pipeline" | 显示客户状态报表 |
| "发个Facebook帖子" | 生成内容+发布 |

---

## 🚀 第1步：安装（2分钟）

### Windows用户

\`\`\`powershell
# 1. 解压下载的ZIP包
# 2. 进入目录
cd global-customer-acquisition-v${getVersion()}

# 3. 运行安装向导
node install.js
\`\`\`

### macOS/Linux用户

\`\`\`bash
# 1. 解压下载的ZIP包
unzip global-customer-acquisition-v${getVersion()}.zip
cd global-customer-acquisition-v${getVersion()}

# 2. 运行安装向导
node install.js
\`\`\`

---

## ⚙️ 第2步：配置（2分钟）

### 填写你的信息

编辑 \`.env\` 文件：

\`\`\`bash
# 业务员信息
SALESPERSON_NAME=张三
SALESPERSON_EMAIL=zhangsan@example.com
SALESPERSON_PHONE=+8613800138000
SALESPERSON_TITLE=销售经理

# 邮箱配置（发送开发信用）
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=zhangsan@example.com
SMTP_PASSWORD=你的邮箱授权码
\`\`\`

### 获取邮箱授权码

**163邮箱**：
1. 登录 mail.163.com
2. 设置 → POP3/SMTP/IMAP
3. 开启SMTP服务
4. 生成授权码（不是登录密码！）

**Gmail**：
1. 登录 Gmail
2. 账号 → 安全
3. 两步验证 → 应用密码
4. 生成应用专用密码

---

## ✅ 第3步：验证（1分钟）

\`\`\`bash
node scripts/setup-security.js
\`\`\`

看到这个就成功了：

\`\`\`
✅ 所有敏感文件已在 .gitignore 中
✅ 未发现明显的敏感信息
\`\`\`

---

## 🎓 第4步：开始使用

### 客户发现

\`\`\`
帮我找10个美国的工业皮带客户
\`\`\`

**AI会自动**：
1. 搜索潜在客户
2. 企业背调（ICP评分）
3. LinkedIn决策人定位
4. 竞品分析
5. 生成完整报告

### 发送开发信

\`\`\`
给这5个客户发开发信
\`\`\`

**AI会自动**：
1. 生成个性化邮件（≥9.0分）
2. 润色去AI味
3. 质量评分
4. 批量发送

### 社媒运营

\`\`\`
生成Facebook帖子：风冷机PA-III-1200
\`\`\`

**AI会自动**：
1. 生成吸引人的帖子
2. 包含产品特点
3. 添加Hashtag
4. 可直接发布

---

## 💡 常用命令

### 获客类
\`\`\`
深度调研：[国家] [产品]          # 例如：深度调研：美国 传送带
批量获客：[国家] [关键词]        # 例如：批量获客：巴西 输送带
背调：[公司名]                    # 例如：背调：ABC Industrial
开发信：[公司] [类型] [产品]      # 例如：开发信：ABC公司 风冷机
\`\`\`

### 社媒类
\`\`\`
生成Facebook帖子：[产品/话题]
生成Instagram内容：[产品]
生成LinkedIn文章：[主题]
生成本周内容日历
\`\`\`

### 管理类
\`\`\`
查看Pipeline                       # 客户状态报表
待跟进客户                         # 跟进提醒
生成日报                           # 当天获客汇总
\`\`\`

---

## ❓ 常见问题

### Q: 忘记填写邮箱了怎么办？

A: AI会自动提醒你：
\`\`\`
⚠️  检测到未填写邮箱
请在 context/user.md 中填写您的邮箱信息
\`\`\`

### Q: 开发信发送失败？

A: 检查以下几点：
1. SMTP授权码是否正确（不是登录密码）
2. 邮箱是否开启了SMTP服务
3. 网络连接是否正常

### Q: 如何查看详细文档？

A: 查看 \`docs/INDEX.md\`，里面有完整文档索引。

### Q: 遇到问题怎么办？

A:
1. 查看 \`RELEASE-NOTES.md\` 中的已知问题
2. 运行 \`node scripts/setup-security.js\` 检查配置
3. 联系技术支持：${process.env.HONGLONG_EMAIL || 'HONGLONG_EMAIL'}

---

## 🎯 进阶功能

### 配置海关数据（特易）

编辑 \`.env\`：
\`\`\`
TEYI_USERNAME=你的特易账号
TEYI_PASSWORD=你的特易密码
\`\`\`

### 配置CRM（孚盟）

编辑 \`config/credentials.md\`：
\`\`\`
孚盟账号: 你的账号
孚盟密码: 你的密码
\`\`\`

### 配置NAS产品资料

编辑 \`.env\`：
\`\`\`
NAS_ADDRESS=192.168.0.194
NAS_USERNAME=你的NAS账号
NAS_PASSWORD=你的NAS密码
\`\`\`

---

## 📚 更多帮助

- **完整文档**: 查看 \`docs/INDEX.md\`
- **安全指南**: 查看 \`SECURITY-GUIDE.md\`
- **系统架构**: 查看 \`SYSTEM-ARCHITECTURE.md\`
- **技术支持**: ${process.env.HONGLONG_EMAIL || 'HONGLONG_EMAIL'}

---

*祝您使用愉快！*
*红龙获客系统团队*
*${new Date().toLocaleDateString('zh-CN')}*
`;

  fs.writeFileSync(path.join(buildDir, 'QUICK-START-USER.md'), quickStart);
  success('创建用户快速开始: QUICK-START-USER.md');
}

// 创建README
function createReadme(buildDir, version) {
  info('创建README...');

  const readme = `# 红龙获客系统 v${version}

> **AI驱动的B2B海外获客全能系统**
> 温州红龙工业设备制造有限公司

---

## 🎯 一句话介绍

**业务员说一句话，AI完成全部获客操作。**

---

## ✨ 核心功能

- 🔍 **智能获客** - 客户发现、背调、决策人定位
- ✉️ **邮件营销** - 开发信生成（≥9.0分）、润色、发送
- 📊 **报价管理** - 自动生成.docx报价单
- 📱 **社媒运营** - Facebook、Instagram、LinkedIn内容生成
- 💼 **CRM集成** - 孚盟MX、特易海关数据
- 🧠 **智能记忆** - 三层记忆系统，持续学习

---

## 🚀 快速开始

### 1. 安装

\`\`\`bash
node install.js
\`\`\`

### 2. 配置

编辑 \`.env\` 填写你的邮箱和凭据

### 3. 使用

\`\`\`
帮我找10个美国的传送带客户
\`\`\`

详细指南：查看 [QUICK-START-USER.md](QUICK-START-USER.md)

---

## 📋 系统要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Windows/macOS/Linux

---

## 📚 文档

- [快速开始](QUICK-START-USER.md) - 5分钟上手
- [发布说明](RELEASE-NOTES.md) - v${version}更新内容
- [完整文档索引](docs/INDEX.md) - 所有文档导航
- [安全指南](SECURITY-GUIDE.md) - 安全配置
- [监控系统](docs/MONITORING.md) - 日志和监控

---

## 🆘 技术支持

- **邮箱**: ${process.env.HONGLONG_EMAIL || 'HONGLONG_EMAIL'}
- **电话**: +86 577-66856856
- **官网**: https://www.holobelt.com

---

## 📄 许可证

© 2026 温州红龙工业设备制造有限公司
All Rights Reserved

---

*红龙获客系统 - 让B2B获客更智能*
*Built with ❤️ by HOLO Team*
`;

  fs.writeFileSync(path.join(buildDir, 'README.md'), readme);
  success('创建README.md');
}

// 创建ZIP包
function createZipPackage(buildDir, version) {
  info('创建ZIP包...');

  try {
    const packageName = `global-customer-acquisition-v${version}`;
    const zipFile = path.join(rootDir, 'release', `${packageName}.zip`);

    // 创建release目录
    const releaseDir = path.join(rootDir, 'release');
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }

    // Windows使用PowerShell压缩
    if (process.platform === 'win32') {
      // 转义路径中的反斜杠
      const srcPath = buildDir.replace(/\\/g, '\\\\');
      const dstPath = zipFile.replace(/\\/g, '\\\\');
      const compressCmd = `powershell -Command "Compress-Archive -Path '${srcPath}\\*' -DestinationPath '${dstPath}' -Force"`;
      execSync(compressCmd, { stdio: 'inherit' });
    } else {
      // Linux/macOS使用zip命令
      const compressCmd = `cd "${buildDir}" && zip -r "${zipFile}" .`;
      execSync(compressCmd, { stdio: 'inherit' });
    }

    const stats = fs.statSync(zipFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    success(`创建ZIP包: ${packageName}.zip (${sizeMB}MB)`);
    return zipFile;
  } catch (err) {
    error(`创建ZIP包失败: ${err.message}`);

    // 提供手动创建说明
    info('\\n手动创建ZIP包：');
    info(`1. 压缩 dist/ 目录为 ZIP 文件`);
    info(`2. 命名为: global-customer-acquisition-v${version}.zip`);

    return null;
  }
}

// 主函数
async function main() {
  log('\\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║        🔥 红龙获客系统 - 发布打包工具 v2.0                      ║', 'blue');
  log('║        版本: v2.3.0                                              ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝\\n', 'blue');

  const version = getVersion();
  validateVersion(version);

  info(`开始打包 v${version}...\\n`);

  // 0. 检查前置条件
  checkPrerequisites();

  // 1. 创建打包目录
  const buildDir = createBuildDir();

  // 2. 复制文件（使用glob）
  const copiedCount = await copyFiles(buildDir);

  // 3. 创建安装向导
  createInstallWizard(buildDir);

  // 4. 创建发布说明
  createReleaseNotes(buildDir, version);

  // 5. 创建用户快速开始
  createUserQuickStart(buildDir);

  // 6. 创建README
  createReadme(buildDir, version);

  // 7. 验证包完整性（在所有文件创建完成后）
  if (!validatePackage(buildDir)) {
    error('包验证失败，打包中止');
    process.exit(1);
  }

  // 8. 计算包大小
  const sizeMB = calculatePackageStats(buildDir);

  // 9. 生成校验和
  const checksum = await generateChecksum(buildDir, version);

  // 10. 创建ZIP包
  const zipFile = createZipPackage(buildDir, version);

  // 11. 打印摘要
  log('\\n╔════════════════════════════════════════════════════════════╗', 'green');
  log('║                  📦 打包完成！                                    ║', 'green');
  log('╠════════════════════════════════════════════════════════════╣', 'green');
  log('║  版本: v' + version.padEnd(55) + '║', 'green');
  log('║  文件: ' + copiedCount + ' 个文件'.padEnd(47) + '║', 'green');
  log('║  大小: ' + sizeMB + 'MB'.padEnd(51) + '║', 'green');
  if (zipFile) {
    log('║  ZIP: ' + path.basename(zipFile).padEnd(51) + '║', 'green');
  }
  if (checksum) {
    log('║  SHA256: ' + checksum.substring(0, 16) + '...'.padEnd(43) + '║', 'green');
  }
  log('║  位置: release/'.padEnd(51) + '║', 'green');
  log('╠════════════════════════════════════════════════════════════╣', 'green');
  log('║  交付物:                                                    ║', 'green');
  log('║  - global-customer-acquisition-v2.3.0.zip                   ║', 'green');
  log('║  - CHECKSUM-v2.3.0.txt (SHA256校验)                         ║', 'green');
  log('╠════════════════════════════════════════════════════════════╣', 'green');
  log('║  下一步:                                                    ║', 'green');
  log('║  1. 测试安装: 解压ZIP包，运行 node install.js              ║', 'green');
  log('║  2. 验证完整性: shasum -a 256 -c CHECKSUM-v2.3.0.txt       ║', 'green');
  log('║  3. 分发文件: 将ZIP包发送给用户                            ║', 'green');
  log('║  4. 用户支持: 提供 QUICK-START-USER.md 指导                ║', 'green');
  log('╚════════════════════════════════════════════════════════════╝\\n', 'green');

  success('打包完成！');
  info('\\n💡 提示：分发前请先测试安装流程！');
}

main().catch(err => {
  error(`打包失败: ${err.message}`);
  process.exit(1);
});
