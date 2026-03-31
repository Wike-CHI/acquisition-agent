#!/usr/bin/env node

/**
 * 安全配置脚本
 * 用途：验证和初始化安全配置
 * 运行：node scripts/setup-security.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// ANSI颜色代码
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

function error(message) {
  log(`❌ 错误: ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 检查文件是否存在
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

// 检查敏感文件是否被忽略
function checkGitignore() {
  const gitignorePath = path.join(rootDir, '.gitignore');
  if (!fileExists(gitignorePath)) {
    error('.gitignore 文件不存在');
    return false;
  }

  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  const sensitiveFiles = [
    'context/user.md',
    'config/credentials.md',
    '.env'
  ];

  let allIgnored = true;
  for (const file of sensitiveFiles) {
    const isIgnored = gitignore.includes(file);
    if (!isIgnored) {
      warning(`${file} 未在 .gitignore 中`);
      allIgnored = false;
    }
  }

  if (allIgnored) {
    success('所有敏感文件已在 .gitignore 中');
  }

  return allIgnored;
}

// 检查环境变量文件
function checkEnvFile() {
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  if (!fileExists(envExamplePath)) {
    warning('.env.example 不存在，跳过环境变量检查');
    return true;
  }

  if (!fileExists(envPath)) {
    warning('.env 文件不存在');
    info('请运行: cp .env.example .env');
    info('然后填写真实凭据');
    return false;
  }

  // 检查 .env 文件是否包含示例值
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const exampleValues = [
    'your_nas_username',
    'your_nas_password',
    'your_email@example.com',
    '{{',
    '}}'
  ];

  let hasExampleValues = false;
  for (const example of exampleValues) {
    if (envContent.includes(example)) {
      warning(`.env 文件包含示例值: ${example}`);
      hasExampleValues = true;
    }
  }

  if (!hasExampleValues) {
    success('.env 文件配置正确');
  }

  return !hasExampleValues;
}

// 检查用户配置文件
function checkUserConfig() {
  const userExamplePath = path.join(rootDir, 'context/user.example.md');
  const userPath = path.join(rootDir, 'context/user.md');

  if (!fileExists(userExamplePath)) {
    warning('context/user.example.md 不存在');
    return true;
  }

  if (!fileExists(userPath)) {
    warning('context/user.md 不存在');
    info('请运行: cp context/user.example.md context/user.md');
    info('然后填写真实信息');
    return false;
  }

  // 检查是否包含占位符
  const userContent = fs.readFileSync(userPath, 'utf-8');
  const placeholders = ['{{SALESPERSON_', '请填写'];

  let hasPlaceholders = false;
  for (const placeholder of placeholders) {
    if (userContent.includes(placeholder)) {
      warning(`context/user.md 包含占位符: ${placeholder}`);
      hasPlaceholders = true;
    }
  }

  if (!hasPlaceholders) {
    success('context/user.md 配置正确');
  }

  return !hasPlaceholders;
}

// 检查凭据配置文件
function checkCredentialsConfig() {
  const credExamplePath = path.join(rootDir, 'config/credentials.example.md');
  const credPath = path.join(rootDir, 'config/credentials.md');

  if (!fileExists(credExamplePath)) {
    warning('config/credentials.example.md 不存在');
    return true;
  }

  if (!fileExists(credPath)) {
    warning('config/credentials.md 不存在');
    info('请运行: cp config/credentials.example.md config/credentials.md');
    info('然后填写真实凭据');
    return false;
  }

  // 检查是否包含示例值或占位符
  const credContent = fs.readFileSync(credPath, 'utf-8');
  const patterns = [
    /{{.*}}/g,
    /your_.*_username/g,
    /your_.*_password/g,
    /请填写/g
  ];

  let hasPlaceholders = false;
  for (const pattern of patterns) {
    const matches = credContent.match(pattern);
    if (matches && matches.length > 0) {
      warning(`config/credentials.md 包含占位符: ${matches[0]}`);
      hasPlaceholders = true;
    }
  }

  if (!hasPlaceholders) {
    success('config/credentials.md 配置正确');
  }

  return !hasPlaceholders;
}

// 检查文件权限
function checkFilePermissions() {
  const sensitiveFiles = [
    path.join(rootDir, '.env'),
    path.join(rootDir, 'context/user.md'),
    path.join(rootDir, 'config/credentials.md')
  ];

  let allSecure = true;
  for (const file of sensitiveFiles) {
    if (!fileExists(file)) continue;

    try {
      const stats = fs.statSync(file);
      const mode = stats.mode & 0o777;

      // 检查是否只有所有者可读写 (600)
      if (mode !== 0o600) {
        warning(`${file} 权限不安全: ${mode.toString(8)} (应该是 600)`);
        info('运行修复命令:');
        info(`  chmod 600 ${file}`);
        allSecure = false;
      }
    } catch (err) {
      error(`无法检查 ${file} 权限: ${err.message}`);
      allSecure = false;
    }
  }

  if (allSecure) {
    success('所有敏感文件权限正确 (600)');
  }

  return allSecure;
}

// 搜索可能包含敏感信息的文件
function scanForSensitiveData() {
  const sensitivePatterns = [
    /password\s*[:=]\s*\w+/gi,
    /api\s*key\s*[:=]\s*\w+/gi,
    /secret\s*[:=]\s*\w+/gi,
    /token\s*[:=]\s*\w+/gi,
    /@[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g  // 邮箱
  ];

  const scanDirs = ['context', 'config', 'scripts'];
  const findings = [];

  for (const dir of scanDirs) {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.js') && !file.endsWith('.json')) continue;

      const filePath = path.join(dirPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');

        for (const pattern of sensitivePatterns) {
          const matches = content.match(pattern);
          if (matches) {
            findings.push({ file: filePath, matches });
            break;
          }
        }
      } catch (err) {
        // 跳过无法读取的文件
      }
    }
  }

  if (findings.length > 0) {
    warning('发现可能包含敏感信息的文件:');
    for (const finding of findings) {
      log(`  - ${finding.file}`, 'yellow');
      // 不打印具体匹配内容，避免泄露
    }
    info('请手动检查这些文件，确保没有真实凭据');
  } else {
    success('未发现明显的敏感信息');
  }

  return findings.length === 0;
}

// 主函数
async function main() {
  log('\n═════════════════════════════════════════════════════', 'blue');
  log('🔒 红龙获客系统 - 安全配置检查', 'blue');
  log('═════════════════════════════════════════════════════\n', 'blue');

  const results = {
    gitignore: checkGitignore(),
    env: checkEnvFile(),
    user: checkUserConfig(),
    credentials: checkCredentialsConfig(),
    permissions: checkFilePermissions(),
    sensitiveData: scanForSensitiveData()
  };

  log('\n═════════════════════════════════════════════════════', 'blue');
  log('📊 检查结果汇总', 'blue');
  log('═════════════════════════════════════════════════════\n', 'blue');

  const passed = Object.values(results).filter(v => v).length;
  const total = Object.keys(results).length;

  for (const [check, result] of Object.entries(results)) {
    const status = result ? '✅ 通过' : '❌ 失败';
    const color = result ? 'green' : 'red';
    log(`  ${check.padEnd(20)} ${status}`, color);
  }

  log(`\n总计: ${passed}/${total} 项通过`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    success('\n🎉 所有安全检查通过！系统配置安全。');
    log('\n下一步:', 'blue');
    log('  1. 运行: node scripts/init.js (初始化系统)');
    log('  2. 运行: npm test (运行测试)');
  } else {
    warning('\n⚠️  发现安全问题，请按照上述提示修复。');
    log('\n修复步骤:', 'blue');
    log('  1. 复制配置模板:');
    log('     cp .env.example .env');
    log('     cp context/user.example.md context/user.md');
    log('     cp config/credentials.example.md config/credentials.md');
    log('  2. 填写真实凭据');
    log('  3. 运行: node scripts/setup-security.js (重新检查)');
    log('\n详细文档: SECURITY-GUIDE.md');
  }

  process.exit(passed === total ? 0 : 1);
}

main().catch(err => {
  error(`脚本执行失败: ${err.message}`);
  process.exit(1);
});
