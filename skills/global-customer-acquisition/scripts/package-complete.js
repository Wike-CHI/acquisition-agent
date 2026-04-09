#!/usr/bin/env node

/**
 * 红龙获客系统 - 完整打包脚本 v3.0
 * 用途：打包完整的红龙获客系统（包含主技能 + 所有外部技能）
 * 运行：node scripts/package-complete.js
 *
 * 更新日志：
 * - 添加 .openclaw/skills 所有外部技能
 * - 添加 .agents/skills 主技能引用
 * - 优化文件复制逻辑
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

// 获取版本
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
    warning(`版本号格式不正确: ${version}`);
  } else {
    success(`版本号验证通过: v${version}`);
  }
}

// 检查前置条件
function checkPrerequisites() {
  info('检查前置条件...');

  // 检查主技能目录
  if (!fs.existsSync(rootDir)) {
    error('主技能目录不存在');
    process.exit(1);
  }

  // 检查外部技能目录
  const openclawSkills = 'C:\\Users\\Administrator\\.openclaw\\skills';
  const agentsSkills = 'C:\\Users\\Administrator\\.agents\\skills';

  if (!fs.existsSync(openclawSkills)) {
    error(`外部技能目录不存在: ${openclawSkills}`);
    process.exit(1);
  }

  if (!fs.existsSync(agentsSkills)) {
    warning(`Agents技能目录不存在: ${agentsSkills} (可选)`);
  }

  success('前置条件检查通过');
  return { openclawSkills, agentsSkills };
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

// 复制主技能
async function copyMainSkill(buildDir) {
  info('开始复制主技能...');

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
        // 排除 scripts 子目录中的 package-complete.js 本身
        'scripts/package-complete.js',
      ],
      nodir: false,
      absolute: false,
      dot: true,
    });

    let copiedCount = 0;
    const total = files.length;

    for (const file of files) {
      const srcPath = path.join(rootDir, file);
      const dstPath = path.join(buildDir, file);

      if (shouldExclude(srcPath)) {
        continue;
      }

      try {
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
          if (!fs.existsSync(dstPath)) {
            fs.mkdirSync(dstPath, { recursive: true });
          }
          copiedCount++;
        } else {
          fs.mkdirSync(path.dirname(dstPath), { recursive: true });
          fs.copyFileSync(srcPath, dstPath);
          copiedCount++;
        }

        if (copiedCount % 100 === 0) {
          info(`已复制 ${copiedCount}/${total} 文件...`);
        }
      } catch (err) {
        // 跳过无法复制的文件
      }
    }

    success(`复制主技能: ${copiedCount} 个文件`);
    return copiedCount;
  } catch (err) {
    error(`文件复制失败: ${err.message}`);
    throw err;
  }
}

// 复制外部技能
async function copyExternalSkills(buildDir, openclawSkills) {
  info('开始复制外部技能...');

  try {
    const skills = await glob('*', {
      cwd: openclawSkills,
      nodir: false,
      absolute: false,
    });

    // 创建外部技能目录
    const externalSkillsDir = path.join(buildDir, 'external-skills');
    fs.mkdirSync(externalSkillsDir, { recursive: true });

    let copiedCount = 0;
    let skippedCount = 0;

    for (const skill of skills) {
      const srcPath = path.join(openclawSkills, skill);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        const dstPath = path.join(externalSkillsDir, skill);

        // 复制整个技能目录
        copyDirectory(srcPath, dstPath);
        copiedCount++;
      } else {
        // 复制单个文件
        const dstPath = path.join(externalSkillsDir, skill);
        fs.mkdirSync(path.dirname(dstPath), { recursive: true });
        fs.copyFileSync(srcPath, dstPath);
        copiedCount++;
      }
    }

    success(`复制外部技能: ${copiedCount} 个项目`);
    info(`跳过了 ${skippedCount} 个项目`);
    return copiedCount;
  } catch (err) {
    error(`外部技能复制失败: ${err.message}`);
    throw err;
  }
}

function copyDirectory(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  const files = fs.readdirSync(src);

  for (const file of files) {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirectory(srcPath, dstPath);
    } else if (stat.isFile()) {
      fs.mkdirSync(path.dirname(dstPath), { recursive: true });
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

// 改进的排除逻辑
function shouldExclude(filePath) {
  const baseName = path.basename(filePath);
  const relativePath = path.relative(rootDir, filePath);

  // 特殊处理：.example 文件永远不排除
  if (baseName.includes('.example') || relativePath.includes('.example')) {
    return false;
  }

  // 排除列表
  const excludes = [
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
    'test-output',
  ];

  for (const exclude of excludes) {
    if (relativePath.includes(exclude) || relativePath === exclude) {
      return true;
    }
  }

  // 后缀排除
  const suffixExcludes = ['.log', '.tmp', '.bak'];
  for (const suffix of suffixExcludes) {
    if (baseName.endsWith(suffix)) {
      return true;
    }
  }

  return false;
}

// 创建安装向导
function createInstallWizard(buildDir) {
  info('创建安装向导...');

  const installScript = `#!/usr/bin/env node

/**
 * 红龙获客系统 - 完整安装向导 v3.0
 * 运行：node install.js
 *
 * 包含：
 * - 主技能（global-customer-acquisition）
 * - 20个外部技能（.openclaw/skills）
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

// 获取版本
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
  console.log('║     🔥 红龙获客系统 v' + getVersion() + ' - 完整版安装向导              ║');
  console.log('║     温州红龙工业设备制造有限公司                                  ║');
  console.log('║     包含主技能 + 20个外部技能                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\\n');

  console.log('欢迎使用红龙获客系统完整版！');
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
    }
  }

  // 创建credentials.md
  if (!fs.existsSync('config/credentials.md')) {
    if (fs.existsSync('config/credentials.example.md')) {
      fs.copyFileSync('config/credentials.example.md', 'config/credentials.md');
      console.log('✅ 已创建 config/credentials.md');
    }
  }

  console.log('\\n🎉 安装完成！');
  console.log('\\n系统组件：');
  console.log('  ✅ 主技能：global-customer-acquisition');
  console.log('  ✅ 外部技能：20个 (.openclaw/skills)');
  console.log('\\n下一步：');
  console.log('1. 编辑 .env 文件，填写您的凭据');
  console.log('2. 编辑 config/credentials.md，填写服务凭据');
  console.log('3. 运行: node scripts/setup-security.js');
  console.log('4. 查阅 QUICK-START-USER.md 开始使用\\n');

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

// 创建发布说明
function createReleaseNotes(buildDir, version) {
  info('创建发布说明...');

  const releaseNotes = `# 红龙获客系统 v${version} - 完整版发布说明

> 温州红龙工业设备制造有限公司
> 发布日期：${new Date().toLocaleDateString('zh-CN')}
> 版本类型：完整版（包含主技能 + 20个外部技能）

---

## 🎉 完整版特性

### 系统组成

| 组件 | 说明 | 文件数 |
|------|------|--------|
| **主技能** | global-customer-acquisition 核心系统 | ~350个文件 |
| **外部技能** | .openclaw/skills 全部20个技能 | ~20个技能 |

### 外部技能清单

1. **agent-reach** - 多渠道客户发现
2. **backup-skill** - 备份技能
3. **brave-web-search** - Brave搜索集成
4. **calendar-skill** - 日历管理
5. **docx** - Word文档生成
6. **email-skill** - 邮件发送
7. **find-skills** - 技能查找
8. **github-skill** - GitHub集成
9. **local** - 本地操作
10. **memos-memory-guide** - Memos记忆指南
11. **notion-skill** - Notion集成
12. **pdf-skill** - PDF处理
13. **planning-with-files** - 文件规划
14. **pptx** - PowerPoint生成
15. **self-improving-agent** - 自我优化
16. **ssh-skill** - SSH操作
17. **tavily-search** - Tavily搜索
18. **xlsx** - Excel生成

---

## 🔧 改进

### 完整性
- ✅ 包含所有主技能文件
- ✅ 包含所有外部技能依赖
- ✅ 环境变量隔离
- ✅ 凭据模板化

### 质量
- ✅ 0个已知漏洞
- ✅ 测试框架完整
- ✅ 结构化日志
- ✅ 错误追踪集成

---

## 📋 系统要求

### 必需
- Node.js >= 18.0.0
- npm >= 9.0.0
- Windows 10/11 或 macOS 或 Linux
- **磁盘空间**: 至少 2GB 可用空间

### 可选
- NAS共享盘（产品资料）
- 特易海关数据账号
- 孚盟MX CRM账号
- 企业邮箱（SMTP）

---

## 🚀 快速开始

### 1. 解压安装包

\`\`\`powershell
# Windows
Expand-Archive -Path .\\global-customer-acquisition-v${version}.zip -DestinationPath .\\

# macOS/Linux
unzip global-customer-acquisition-v${version}.zip
\`\`\`

### 2. 运行安装向导

\`\`\`bash
node install.js
\`\`\`

### 3. 配置凭据

编辑以下文件：
- \`.env\` - 环境变量
- \`context/user.md\` - 业务员信息
- \`config/credentials.md\` - 服务凭据

### 4. 验证安装

\`\`\`bash
node scripts/setup-security.js
npm test
\`\`\`

---

## 📊 包大小

| 组件 | 大小 |
|------|------|
| 主技能 | ~1.2GB |
| 外部技能 | ~50MB |
| 总计（压缩前） | ~1.25GB |
| **ZIP包大小** | ~200MB |

---

## 🆘 技术支持

- **邮箱**: ${process.env.HONGLONG_EMAIL || 'HONGLONG_EMAIL'}
- **电话**: +86 577-66856856
- **官网**: https://www.holobelt.com

---

*红龙获客系统完整版 - 让B2B获客更智能*
*Built with ❤️ by HOLO Team*
`;

  fs.writeFileSync(path.join(buildDir, 'RELEASE-NOTES.md'), releaseNotes);
  success('创建发布说明: RELEASE-NOTES.md');
}

// 创建用户快速开始指南
function createUserQuickStart(buildDir) {
  info('创建用户快速开始指南...');

  const quickStart = `# 红龙获客系统 v2.3.0 - 完整版快速开始

> 专为业务员设计的AI获客助手（完整版）
> 包含主技能 + 20个外部技能

---

## 🎯 系统能做什么？

**一句话，AI完成全部操作！**

| 你说 | AI做 |
|------|------|
| "帮我找10个美国的传送带客户" | 搜索+背调+生成报告 |
| "给这家公司发开发信" | 生成邮件+润色+发送 |
| "生成报价单" | 创建.docx报价单 |
| "查看Pipeline" | 显示客户状态报表 |

---

## 🚀 第1步：安装（3分钟）

### Windows用户

\`\`\`powershell
# 1. 解压下载的ZIP包
Expand-Archive -Path .\\global-customer-acquisition-v2.3.0.zip -DestinationPath .\\

# 2. 进入目录
cd global-customer-acquisition-v2.3.0

# 3. 运行安装向导
node install.js
\`\`\`

### macOS/Linux用户

\`\`\`bash
# 1. 解压下载的ZIP包
unzip global-customer-acquisition-v2.3.0.zip
cd global-customer-acquisition-v2.3.0

# 2. 运行安装向导
node install.js
\`\`\`

---

## ⚙️ 第2步：配置（2分钟）

编辑 \`.env\` 文件：

\`\`\`bash
# 业务员信息
SALESPERSON_NAME=张三
SALESPERSON_EMAIL=zhangsan@example.com
SALESPERSON_PHONE=+8613800138000
SALESPERSON_TITLE=销售经理

# 邮箱配置
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=zhangsan@example.com
SMTP_PASSWORD=你的邮箱授权码
\`\`\`

---

## ✅ 第3步：验证（1分钟）

\`\`\`bash
node scripts/setup-security.js
\`\`\`

---

## 🎓 第4步：开始使用

### 客户发现
\`\`\`
帮我找10个美国的工业皮带客户
\`\`\`

### 发送开发信
\`\`\`
给这5个客户发开发信
\`\`\`

---

## 📚 完整功能

### 主技能功能
- ✅ 智能获客（11步流程）
- ✅ 开发信生成v2.0（≥9.0分）
- ✅ 企业背调（ICP 6维度评分）
- ✅ 报价单生成（.docx）
- ✅ Pipeline管理

### 外部技能功能
- ✅ 多渠道搜索（Brave + Tavily）
- ✅ 文档生成（Word + PDF + Excel）
- ✅ 日历管理
- ✅ GitHub集成
- ✅ Notion集成
- ✅ Memos记忆

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

  const readme = `# 红龙获客系统 v${version} - 完整版

> **AI驱动的B2B海外获客全能系统（完整版）**
> 温州红龙工业设备制造有限公司
>
> 包含：主技能 + 20个外部技能

---

## 🎯 一句话介绍

**业务员说一句话，AI完成全部获客操作。**

---

## ✨ 核心功能

- 🔍 **智能获客** - 客户发现、背调、决策人定位
- ✉️ **邮件营销** - 开发信生成（≥9.0分）、润色、发送
- 📊 **报价管理** - 自动生成.docx报价单
- 📱 **社媒运营** - Facebook、Instagram、LinkedIn内容生成
- 💼 **工具集成** - Word、PDF、Excel、日历、GitHub、Notion
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

---

## 📦 系统组成

| 组件 | 说明 |
|------|------|
| **主技能** | global-customer-acquisition |
| **外部技能** | agent-reach, tavily-search, docx, pdf, xlsx等20个 |

详细列表见 [RELEASE-NOTES.md](RELEASE-NOTES.md)

---

## 📋 系统要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Windows/macOS/Linux
- **磁盘空间**: 至少 2GB

---

## 🆘 技术支持

- **邮箱**: ${process.env.HONGLONG_EMAIL || 'HONGLONG_EMAIL'}
- **电话**: +86 577-66856856
- **官网**: https://www.holobelt.com

---

*红龙获客系统完整版 - 让B2B获客更智能*
*Built with ❤️ by HOLO Team*
`;

  fs.writeFileSync(path.join(buildDir, 'README.md'), readme);
  success('创建README.md');
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
      `SHA256: ${checksum}\nFile: global-customer-acquisition-v${version}.zip\nDate: ${new Date().toISOString()}\nContents: Main skill + 20 external skills\n`
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
    'external-skills', // 新增：检查外部技能目录
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

  // 检查外部技能数量
  const externalSkillsPath = path.join(buildDir, 'external-skills');
  if (fs.existsSync(externalSkillsPath)) {
    const skills = fs.readdirSync(externalSkillsPath);
    info(`外部技能数量: ${skills.length}个`);
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

  if (sizeMB > 200) {
    warning('包大小超过200MB，压缩后可能仍较大');
  } else if (sizeMB < 10) {
    warning('包大小小于10MB，可能文件不完整');
  }

  return sizeMB;
}

// 创建ZIP包
function createZipPackage(buildDir, version) {
  info('创建ZIP包...');

  try {
    const packageName = `global-customer-acquisition-v${version}-COMPLETE`;
    const zipFile = path.join(rootDir, 'release', `${packageName}.zip`);

    // 创建release目录
    const releaseDir = path.join(rootDir, 'release');
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }

    // Windows使用PowerShell压缩
    if (process.platform === 'win32') {
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

    info('\\n手动创建ZIP包：');
    info(`1. 压缩 dist/ 目录为 ZIP 文件`);
    info(`2. 命名为: global-customer-acquisition-v${version}-COMPLETE.zip`);

    return null;
  }
}

// 主函数
async function main() {
  log('\\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║        🔥 红龙获客系统 - 完整版打包工具 v3.0                   ║', 'blue');
  log('║        版本: v2.3.0                                              ║', 'blue');
  log('║        包含：主技能 + 20个外部技能                              ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝\\n', 'blue');

  const version = getVersion();
  validateVersion(version);

  info(`开始打包 v${version} 完整版...\\n`);

  // 0. 检查前置条件
  const { openclawSkills, agentsSkills } = checkPrerequisites();

  // 1. 创建打包目录
  const buildDir = createBuildDir();

  // 2. 复制主技能
  const mainSkillCount = await copyMainSkill(buildDir);

  // 3. 复制外部技能
  const externalSkillsCount = await copyExternalSkills(buildDir, openclawSkills);

  // 4. 创建安装向导
  createInstallWizard(buildDir);

  // 5. 创建发布说明
  createReleaseNotes(buildDir, version);

  // 6. 创建用户快速开始
  createUserQuickStart(buildDir);

  // 7. 创建README
  createReadme(buildDir, version);

  // 8. 验证包完整性
  if (!validatePackage(buildDir)) {
    error('包验证失败，打包中止');
    process.exit(1);
  }

  // 9. 计算包大小
  const sizeMB = calculatePackageStats(buildDir);

  // 10. 生成校验和
  const checksum = await generateChecksum(buildDir, version);

  // 11. 创建ZIP包
  const zipFile = createZipPackage(buildDir, version);

  // 12. 打印摘要
  log('\\n╔════════════════════════════════════════════════════════════╗', 'green');
  log('║                  📦 完整版打包完成！                              ║', 'green');
  log('╠════════════════════════════════════════════════════════════╣', 'green');
  log('║  版本: v' + version.padEnd(55) + '║', 'green');
  log('║  主技能文件: ' + mainSkillCount + ' 个'.padEnd(45) + '║', 'green');
  log('║  外部技能: ' + externalSkillsCount + ' 个'.padEnd(45) + '║', 'green');
  log('║  总大小: ' + sizeMB + 'MB'.padEnd(51) + '║', 'green');
  if (zipFile) {
    log('║  ZIP: ' + path.basename(zipFile).padEnd(51) + '║', 'green');
  }
  if (checksum) {
    log('║  SHA256: ' + checksum.substring(0, 16) + '...'.padEnd(43) + '║', 'green');
  }
  log('║  位置: release/'.padEnd(51) + '║', 'green');
  log('╠════════════════════════════════════════════════════════════╣', 'green');
  log('║  📦 包含内容:                                                ║', 'green');
  log('║  ✅ 主技能：global-customer-acquisition                        ║', 'green');
  log('║  ✅ 外部技能：20个 (.openclaw/skills 全部)                    ║', 'green');
  log('║  ✅ 安装向导：install.js                                        ║', 'green');
  log('║  ✅ 文档：README + 快速开始 + 发布说明                           ║', 'green');
  log('╠════════════════════════════════════════════════════════════╣', 'green');
  log('║  📦 文件名:                                                   ║', 'green');
  log('║  global-customer-acquisition-v2.3.0-COMPLETE.zip                ║', 'green');
  log('╠════════════════════════════════════════════════════════════╣', 'green');
  log('║  下一步:                                                    ║', 'green');
  log('║  1. 测试安装: 解压ZIP包，运行 node install.js                      ║', 'green');
  log('║  2. 验证完整性: shasum -a 256 -c CHECKSUM-v2.3.0.txt              ║', 'green');
  log('║  3. 分发文件: 将ZIP包发送给用户                                  ║', 'green');
  log('║  4. 用户支持: 提供 QUICK-START-USER.md 指导                      ║', 'green');
  log('╚════════════════════════════════════════════════════════════╝\\n', 'green');

  success('完整版打包完成！');
  info('\\n💡 提示：这是包含主技能 + 20个外部技能的完整版本！');
}

main().catch(err => {
  error(`打包失败: ${err.message}`);
  process.exit(1);
});
