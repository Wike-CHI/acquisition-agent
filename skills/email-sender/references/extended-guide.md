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

## 📌 REQUIRED: 发信后回写钩子

> **MUST** — 每封邮件发送后，必须执行以下步骤。不可跳过。

### 发送成功后

#### 9.1 写入知识库（团队共享）

将邮件记录写入 `K:\knowledge\emails\{公司名}.md`，供全团队查阅：

```powershell
powershell -File "{{SKILL_DIR}}/../knowledge-base/scripts/write-knowledge.ps1" -Type email -Name "{公司名}" -Content @"
---
title: {公司名} - 邮件记录
type: email_record
customer: {公司名}
---

# 邮件发送记录

## 邮件信息
- 发送时间：{时间}
- 收件人：{邮箱}
- 主题：{主题}
- 邮件类型：{开发信/跟进/报价}
- 发送渠道：email

## 邮件摘要
{AI生成的邮件正文摘要，50字以内}

## 跟进状态
- 下次跟进日期：{发送日期+3天}
- 回复状态：待回复
"@
```

#### 9.2 记录活动日志

```powershell
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType email_send -Customer "{公司名}" -Result success -SkillName email-sender
```

### 发送失败时

**不写入知识库**（没有成功发送无需记录），但记录失败日志：

```powershell
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType email_send -Customer "{公司名}" -Result failed -Notes "{失败原因}" -SkillName email-sender
```

---

## 十、配置文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| 邮箱配置 | `{{SKILL_DATA_DIR}}/.email_config.json` | SMTP配置（加密） |
| 发送日志 | `{{SKILL_DATA_DIR}}/email_logs/` | 发送记录 |
| 签名配置 | `../../workspace/operator-config.md` | 业务员身份信息，见 `cold-email-generator/references/nas-paths.md` |

> **迁移说明**：旧路径（`.openclaw/` 下同名文件）已废弃。如检测到旧路径文件存在且新路径不存在，自动复制到新路径。

---

*相关技能*:
- email-marketing: 邮件营销策略
- email-outreach-ops: 邮件外联模板
- global-customer-acquisition: 全网获客主控

*更新时间*: 2026-03-25
