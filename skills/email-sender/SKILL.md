---
name: email-sender
version: 1.0.0
description: 邮件自动发送技能。引导式配置SMTP，自动发送开发信和跟进邮件。当用户需要：(1) 配置邮箱 (2) 发送邮件 (3) 批量发送 (4) 自动跟进 时使用此技能。
always: false
triggers:
  - 发送邮件
  - 批量发送
  - 自动发邮件
  - 配置邮箱
  - send email
---

# 邮件自动发送技能

> **Skill Graph：** 领域 → [[_index-outreach|多渠道触达领域]] | 上游 ← [[cold-email-generator|开发信生成]] ← [[_index-outreach|触达领域]] | 下游 → [[follow-up-signal-monitor|跟进监控]]


引导式配置邮箱，自动发送开发信、跟进邮件，管理发送记录。

---

## 一、首次使用配置（引导式）

### 1.1 启动配置向导

```
用户: 配置邮箱发送功能
→ 启动引导式配置
```

### 1.2 配置步骤

**Step 1: 选择邮箱服务商**

| 服务商 | SMTP服务器 | 端口 | 说明 |
|--------|------------|------|------|
| **QQ邮箱** | smtp.qq.com | 465/587 | 需要授权码 |
| **163邮箱** | smtp.163.com | 465/25 | 需要授权码 |
| **Gmail** | smtp.gmail.com | 587 | 需要应用专用密码 |
| **Outlook** | smtp-mail.outlook.com | 587 | 需要应用密码 |
| **阿里企业邮箱** | smtp.qiye.aliyun.com | 465 | 企业邮箱 |
| **腾讯企业邮箱** | smtp.exmail.qq.com | 465 | 企业邮箱 |
| **自定义** | - | - | 自定义SMTP |

**Step 2: 输入邮箱信息**

```
请输入您的邮箱地址: your@email.com
请输入邮箱密码（或授权码）: ********
```

**Step 3: 验证配置**

```
正在测试SMTP连接...
✅ 连接成功
✅ 认证成功
✅ 发送测试邮件到 your@email.com

配置成功！
```

### 1.3 配置文件存储

**存储位置**: `{{SKILL_DATA_DIR}}/.email_config.json`
> **迁移说明**：旧路径 `%USERPROFILE%\.openclaw\.email_config.json` 已废弃（deprecated），首次加载时自动迁移到新路径。

**文件内容**（加密存储）:
```json
{
  "provider": "QQ",
  "smtp_server": "smtp.qq.com",
  "smtp_port": 465,
  "username": "your@email.com",
  "password_encrypted": "加密后的密码",
  "use_ssl": true,
  "created_at": "2026-03-25 13:35:00",
  "last_used": "2026-03-25 13:35:00"
}
```

---

## 二、常用邮箱配置指南

### 2.1 QQ邮箱配置

**步骤**：
```
1. 登录 mail.qq.com
2. 设置 → 账户 → POP3/SMTP服务
3. 开启"POP3/SMTP服务"
4. 生成授权码（不是QQ密码！）
5. 记录授权码
```

**配置**：
```
SMTP服务器: smtp.qq.com
端口: 465 (SSL) 或 587 (TLS)
用户名: 完整邮箱地址
密码: 授权码（16位字母）
```

### 2.2 163邮箱配置

**步骤**：
```
1. 登录 mail.163.com
2. 设置 → POP3/SMTP/IMAP
3. 开启"SMTP服务"
4. 获取授权码
```

**配置**：
```
SMTP服务器: smtp.163.com
端口: 465 (SSL) 或 25
用户名: 完整邮箱地址
密码: 授权码
```

### 2.3 Gmail配置

**步骤**：
```
1. 登录 myaccount.google.com
2. 安全性 → 两步验证（必须开启）
3. 搜索"应用专用密码"
4. 生成新的应用专用密码（邮件）
5. 记录16位密码
```

**配置**：
```
SMTP服务器: smtp.gmail.com
端口: 587 (TLS)
用户名: 完整Gmail地址
密码: 应用专用密码（16位）
```

### 2.4 企业邮箱配置

**阿里企业邮箱**：
```
SMTP服务器: smtp.qiye.aliyun.com
端口: 465 (SSL)
用户名: 完整企业邮箱
密码: 邮箱密码（或管理员设置的专用密码）
```

**腾讯企业邮箱**：
```
SMTP服务器: smtp.exmail.qq.com
端口: 465 (SSL)
用户名: 完整企业邮箱
密码: 邮箱密码
```

---

## 三、发送邮件

### 3.0 前置检查清单

**发送前必须确认**:
- [ ] **NAS已挂载** - 运行 `.\skills\nas-file-reader\scripts\mount-nas.ps1`
- [ ] **邮箱已配置** - 运行 `.\skills\email-sender\scripts\setup-email.ps1`
- [ ] **客户邮箱有效** - 确认收件人地址格式正确
- [ ] **产品资料可用** - NAS中有相关产品图片/视频

**为什么需要NAS？**
```
开发信 + 产品图片 = 回复率提升2-3倍
客户看到实际产品 = 信任度提升
```

### 3.1 单封发送

**命令**：
```
用户: 发送邮件给 abc@company.com
主题: Industrial Belt Solutions
内容: {邮件内容}
```

**执行流程**：
```
1. 加载邮箱配置
2. 连接SMTP服务器
3. 构建邮件（主题/正文/签名）
4. 发送
5. 记录发送状态
```

**输出**：
```
✅ 邮件发送成功
收件人: abc@company.com
主题: Industrial Belt Solutions
发送时间: 2026-03-25 13:40:00
邮件ID: msg_001
```

### 3.2 批量发送

**命令**：
```
用户: 给这10个客户发送开发信
客户列表: [abc@company.com, xyz@belt.com, ...]
```

**执行流程**：
```
1. 加载客户列表
2. 为每个客户生成个性化邮件
3. 逐个发送（控制频率）
4. 记录发送结果
5. 生成发送报告
```

**发送频率控制**：
```
- 同一域名: 间隔30秒
- 不同域名: 间隔10秒
- 每小时最多: 50封
- 每天最多: 200封
```

**输出**：
```
## 批量发送报告

### 发送统计
- 总数: 10封
- 成功: 9封
- 失败: 1封
- 成功率: 90%

### 详细结果
| # | 收件人 | 状态 | 时间 |
|---|--------|------|------|
| 1 | abc@company.com | ✅ 成功 | 13:40:00 |
| 2 | xyz@belt.com | ✅ 成功 | 13:40:15 |
| 3 | ... | ❌ 失败 | - |
...

### 失败原因
- def@invalid.com: 邮箱不存在
```

### 3.3 发送记录

**存储位置**: `{{SKILL_DATA_DIR}}/email_logs/`
> **迁移说明**：旧路径 `%USERPROFILE%\.openclaw\email_logs\` 已废弃（deprecated）。

**记录格式**:
```json
{
  "message_id": "msg_20260325_001",
  "to": "abc@company.com",
  "subject": "Industrial Belt Solutions",
  "sent_at": "2026-03-25 13:40:00",
  "status": "sent",
  "follow_up_date": "2026-03-28",
  "replied": false
}
```

---

---

## 详细参考

> 以下内容已拆分到 [[references/extended-guide.md]]，仅在需要时读取：
> - 四、跟进管理
> - 五、签名管理
> - 六、邮件模板
> - 七、安全与合规
> - 八、快速命令
> - 九、故障排查
> - 📌 REQUIRED: 发信后回写钩子
> - 邮件信息
> - 邮件摘要
> - 跟进状态
> - 十、配置文件位置
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
