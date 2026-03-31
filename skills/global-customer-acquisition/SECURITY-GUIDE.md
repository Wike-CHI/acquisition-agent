# 安全配置指南

> 红龙获客系统 - 安全最佳实践和凭据管理

---

## 🚨 安全原则

1. **永远不要提交真实凭据到代码仓库**
2. **使用环境变量管理敏感信息**
3. **定期轮换API密钥和密码**
4. **最小权限原则**
5. **审计所有访问日志**

---

## 📋 首次配置步骤

### 第1步：创建环境变量文件

```bash
# 在项目根目录执行
cp .env.example .env
```

### 第2步：填写真实凭据

编辑 `.env` 文件，填写以下信息：

```bash
# 业务员信息
SALESPERSON_NAME=你的名字
SALESPERSON_EMAIL=你的邮箱@example.com
SALESPERSON_PHONE=+8610000000000
SALESPERSON_TITLE=销售代表

# NAS凭据
NAS_USERNAME=你的NAS账号
NAS_PASSWORD=你的NAS密码

# 特易海关数据
TEYI_USERNAME=你的特易账号
TEYI_PASSWORD=你的特易密码

# 邮箱SMTP
SMTP_USER=你的邮箱@example.com
SMTP_PASSWORD=你的邮箱授权码
```

### 第3步：创建用户配置文件

```bash
# 创建用户信息文件
cp context/user.example.md context/user.md

# 创建凭据配置文件
cp config/credentials.example.md config/credentials.md
```

### 第4步：验证配置

```bash
# 运行配置验证脚本
cd scripts
node validate-config.js
```

---

## 🔒 安全检查清单

### 凭据管理

- [ ] `.env` 文件已在 `.gitignore` 中
- [ ] `context/user.md` 已在 `.gitignore` 中
- [ ] `config/credentials.md` 已在 `.gitignore` 中
- [ ] 所有真实凭据已从代码中移除
- [ ] 使用占位符替换敏感信息

### 访问控制

- [ ] NAS账号使用独立账号（不共享）
- [ ] API密钥有访问限制
- [ ] 定期轮换密码（建议每90天）
- [ ] 启用双重认证（如果可用）

### 审计和监控

- [ ] 启用访问日志记录
- [ ] 定期检查异常访问
- [ ] 监控API使用量
- [ ] 设置告警规则

---

## 🛡️ 常见安全问题

### Q1: 如何检查是否已提交敏感信息？

```bash
# 搜索git历史中的敏感信息
git log --all --full-history --source -- "*password*"
git log --all --full-history --source -- "*api*key*"
git log --all --full-history --source -- "*secret*"

# 如果发现敏感信息，立即使用 git-filter-repo 清理
```

### Q2: 如何轮换API密钥？

1. 在服务提供商处生成新密钥
2. 更新 `.env` 文件
3. 重启相关服务
4. 删除旧密钥
5. 记录轮换日期

### Q3: 如何加密存储凭据？

推荐使用以下工具之一：

- **Windows DPAPI**（内置）
- **HashiCorp Vault**
- **AWS Secrets Manager**
- **Azure Key Vault**

示例代码（Node.js + Windows DPAPI）：

```javascript
import { execSync } from 'child_process';

// 加密
function encrypt(plaintext) {
  const cmd = `powershell -Command "Add-Type -AssemblyName System.Security; [System.Security.Cryptography.ProtectedData]::Protect([System.Text.Encoding]::UTF8.GetBytes('${plaintext}'), $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser) | ForEach-Object { [System.Convert]::ToBase64String($_) }"`;
  return execSync(cmd).toString().trim();
}

// 解密
function decrypt(ciphertext) {
  const cmd = `powershell -Command "$bytes = [System.Convert]::FromBase64String('${ciphertext}'); [System.Text.Encoding]::UTF8.GetString([System.Security.Cryptography.ProtectedData]::Unprotect($bytes, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser))"`;
  return execSync(cmd).toString().trim();
}
```

---

## 📧 邮件安全

### SMTP配置最佳实践

```javascript
// 使用环境变量
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
};

// 验证配置
if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
  throw new Error('SMTP凭据未配置');
}
```

### 邮箱授权码获取方法

**163邮箱**：
1. 登录 https://mail.163.com
2. 设置 → POP3/SMTP/IMAP
3. 开启SMTP服务
4. 生成授权码（不是登录密码）

**Gmail**：
1. 登录 Gmail
2. 账号 → 安全
3. 两步验证 → 应用密码
4. 生成应用专用密码

---

## 🔍 安全审计

### 定期审计任务

每周检查：
- [ ] 异常登录记录
- [ ] API调用异常
- [ ] 磁盘使用情况

每月检查：
- [ ] 权限设置
- [ ] 密码强度
- [ ] 依赖包漏洞（`npm audit`）

每季度检查：
- [ ] 全面安全审计
- [ ] 灾难恢复测试
- [ ] 安全培训

### 自动化安全扫描

```bash
# 添加到 package.json
{
  "scripts": {
    "security:audit": "npm audit",
    "security:check": "snyk test",
    "security:fix": "npm audit fix"
  }
}

# 运行安全扫描
npm run security:audit
```

---

## 🚨 事件响应

### 发现安全漏洞时的处理流程

1. **立即隔离**：断开受影响系统的网络连接
2. **评估影响**：确定泄露范围和严重程度
3. **通知相关方**：告知用户和管理层
4. **修复漏洞**：应用补丁或更改配置
5. **恢复服务**：验证修复后重新上线
6. **事后分析**：编写事故报告，改进流程

### 紧急联系方式

- 安全团队：[填写]
- 技术负责人：[填写]
- 管理层：[填写]

---

## 📚 相关资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://www.sans.org/top25-software-errors/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

*最后更新：2026-04-02*
*版本：1.0.0*
