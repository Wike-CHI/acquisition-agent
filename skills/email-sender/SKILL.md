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

**存储位置**: `%USERPROFILE%\.openclaw\.email_config.json`

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

**存储位置**: `%USERPROFILE%\.openclaw\email_logs\`

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

## 四、跟进管理

### 4.1 自动跟进设置

**跟进规则**：

| 天数 | 动作 | 模板 |
|------|------|------|
| Day 0 | 发送初始邮件 | 开发信模板 |
| Day 3 | 第1次跟进 | Follow-up 1 |
| Day 7 | 第2次跟进 | Follow-up 2 |
| Day 14 | 最后跟进 | Follow-up 3 |

### 4.2 跟进提醒

**每日检查**：
```
今天需要跟进的邮件：
- abc@company.com (3天后跟进)
- xyz@belt.com (7天后跟进)
...

是否现在发送跟进邮件？(Y/n)
```

### 4.3 回复检测

**手动标记**：
```
用户: abc@company.com 已回复
→ 标记为已回复
→ 停止跟进
```

---

## 五、签名管理

### 5.1 默认签名

```
Best regards,
{姓名}
{职位}
{公司名称}
{网站}
{电话}
{LinkedIn}
```

### 5.2 多签名支持

| 签名名称 | 用途 |
|----------|------|
| default | 默认签名 |
| formal | 正式签名（首次接触） |
| casual | 非正式签名（跟进） |
| chinese | 中文签名 |

### 5.3 配置签名

```
用户: 配置邮件签名
→ 输入姓名、职位、公司、网站等
→ 保存签名
```

---

## 六、邮件模板

### 6.1 开发信模板

```
Subject: Industrial Belt Solutions - {公司名}

Hi {姓名},

{个性化开场}

I'm writing to introduce HOLO (红龙), a leading manufacturer of industrial belt equipment with 20+ years of experience.

Our product line includes:
- Air/Water Cooled Press
- Finger Puncher
- Belt Slitting Machine
- Ply Separator

{痛点关联}

Website: www.beltsplicepress.com

Would you be interested in discussing potential collaboration?

Best regards,
{签名}
```

### 6.2 跟进模板

**3天后**：
```
Subject: Re: Industrial Belt Solutions - {公司名}

Hi {姓名},

I wanted to follow up on my previous email. Did you have a chance to review it?

Happy to answer any questions.

Best regards,
{签名}
```

**7天后**：
```
Subject: Re: Industrial Belt Solutions - {公司名}

Hi {姓名},

Following up again. If timing isn't right, I'm happy to reconnect later.

In the meantime, here's a case study: {案例链接}

Best regards,
{签名}
```

---

## 七、安全与合规

### 7.1 密码安全

- ✅ 使用加密存储
- ✅ 不明文显示密码
- ✅ 定期提醒更换密码
- ❌ 不使用简单密码

### 7.2 发送限制

**防止被封**：
```
- 每小时: ≤50封
- 每天: ≤200封
- 同域名: 间隔30秒
- 监控退信率: <5%
```

### 7.3 法律合规

- ✅ 包含退订链接
- ✅ 包含公司地址
- ✅ 不使用误导性主题
- ✅ 遵守CAN-SPAM/GDPR

---

## 八、快速命令

### 配置命令
```
用户: 配置邮箱
→ 启动引导式配置
```

### 发送命令
```
用户: 发送邮件给 {邮箱}
用户: 给这些客户批量发送开发信
用户: 查看发送记录
```

### 跟进命令
```
用户: 查看今天需要跟进的邮件
用户: {邮箱} 已回复
用户: 发送跟进邮件
```

---

## 九、故障排查

### 9.1 连接失败

**可能原因**：
- SMTP服务器地址错误
- 端口号错误
- 网络问题
- 防火墙阻止

**解决方案**：
```
1. 检查SMTP服务器地址
2. 尝试不同端口（465/587/25）
3. 检查网络连接
4. 临时关闭防火墙测试
```

### 9.2 认证失败

**可能原因**：
- 用户名错误（需完整邮箱）
- 密码错误（使用授权码而非登录密码）
- 账户未开启SMTP服务

**解决方案**：
```
1. 确认使用完整邮箱地址
2. 确认使用授权码/应用密码
3. 检查邮箱设置中的SMTP开关
```

### 9.3 发送失败

**可能原因**：
- 收件人邮箱不存在
- 被对方服务器拒收
- 邮件内容触发垃圾邮件过滤

**解决方案**：
```
1. 验证收件人邮箱地址
2. 简化邮件内容
3. 避免垃圾邮件关键词
4. 降低发送频率
```

---

## 十、配置文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| 邮箱配置 | `%USERPROFILE%\.openclaw\.email_config.json` | SMTP配置（加密） |
| 发送日志 | `%USERPROFILE%\.openclaw\email_logs\` | 发送记录 |
| 签名配置 | `%USERPROFILE%\.openclaw\.email_signatures.json` | 签名模板 |

---

*相关技能*:
- email-marketing: 邮件营销策略
- email-outreach-ops: 邮件外联模板
- global-customer-acquisition: 全网获客主控

*更新时间*: 2026-03-25
