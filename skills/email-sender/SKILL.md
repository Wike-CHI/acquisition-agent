---
name: email-sender
version: 2.0.0
description: Use when 需要发送邮件、批量发送开发信或跟进邮件时。路由：发送邮件必须走此技能（内置黑名单检查+ICP校验+邮箱铁律+联系记录），禁止绕过直接调 send_email_smtp。v2.0 对接实际 Agent 工具链，不再依赖 PowerShell 脚本。
always: false
triggers:
  - 发送邮件
  - 批量发送
  - 自动发邮件
  - send email
---

# 邮件发送技能 v2.0

> **Skill Graph：** 领域 → [[_index-outreach|多渠道触达领域]] | 上游 ← [[cold-email-generator|开发信生成]] | 下游 → [[follow-up-signal-monitor|跟进监控]]

> **v2.0 更新**: SMTP 配置在 holo-desktop 设置页面完成（设置 → 邮件），Agent 直接调 `send_email_smtp` 工具发信，不再依赖 PowerShell 脚本。

---

## 发送前检查链（铁律，不可跳过）

```
┌─────────────────────────────────────────────────────────┐
│                 发信前强制检查链                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ① check_existing_customer — 成交客户黑名单检查            │
│     ↓ 命中 → 立即停止！禁止发送                            │
│     ↓ 未命中                                              │
│  ② kb_search(type="email") — 是否已发过开发信              │
│     ↓ 发过 → 告知"已于X月X日发送过"，询问是否发跟进         │
│     ↓ 未发过                                              │
│  ③ kb_read(type="company") — 查客户档案，取ICP评分         │
│     ↓ ICP < 75 → 告知"ICP不达标"，询问是否继续              │
│     ↓ ICP ≥ 75                                            │
│  ④ 邮箱验证 — 必须是决策人邮箱，禁止 info@/sales@           │
│     ↓ 通过                                                │
│  ⑤ send_email_smtp — 实际发送                             │
│     ↓                                                     │
│  ⑥ kb_write(type="email") — 保存发送记录到知识库           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 发送流程

### Step 0: SMTP 已配置？

SMTP 配置在 holo-desktop **设置 → 邮件** 页面完成（支持 9 种邮箱预设，密码存入 Electron safeStorage 加密）。

Agent 可以调 `get_smtp_status` 确认配置状态：
```
get_smtp_status()
// 返回: { configured: true, host: "smtp.exmail.qq.com", user: "sale@18816.cn", ... }
```

如果 `configured: false`，告知业务员去设置页面配置。

### Step 1: 黑名单检查

```
check_existing_customer(company_name="ABC Corp", email="buyer@abccorp.com", website="abccorp.com")
```
- 命中 → **立即停止**，告知"该客户已是成交客户，禁止发开发信"
- 未命中 → 继续

### Step 2: 检查是否已发送

```
kb_search(query="ABC Corp", type="email")
kb_read(type="email", name="ABC-Corp")
```
- 已发送 → 告知发送时间和内容摘要，询问是否发跟进邮件
- 未发送 → 继续

### Step 3: ICP 校验

```
kb_read(type="company", name="ABC-Corp")
```
- 获取 ICP 评分
- ICP < 75 → 告知"ICP评分 {分数}，不达发送门槛(75)。确定要继续吗？"
- ICP ≥ 75 → 继续

### Step 4: 邮箱验证

| 规则 | 说明 |
|------|------|
| 禁 info@ | 禁止发送到 info@, sales@, admin@, contact@ 等通用邮箱 |
| 必须决策人 | 必须有具体人名（如 john.smith@） |
| 格式检查 | 必须包含 @ 和有效域名 |

如遇 info@/sales@，先用 `email_finder` 工具推测决策人邮箱：
```
email_finder(name="John Smith", domain="abccorp.com")
```

### Step 5: 发送

```
send_email_smtp({
  to: ["john.smith@abccorp.com"],
  subject: "Air Cooling Belt Splicing Press — Reduce Downtime by 40%",
  html: "<p>Dear Mr. Smith,</p><p>...邮件正文...</p>",
  signature: "Best regards,\nZhang Wei | HOLO Industrial\nsale@18816.cn | +86 18057753889"
})
```

**频率控制**（批量发送时）：
- 同域名间隔 ≥ 30 秒
- 不同域名间隔 ≥ 10 秒
- 每小时 ≤ 50 封
- 每天 ≤ 200 封

### Step 6: 保存发送记录

```
kb_write(type="email", name="ABC-Corp", content="邮件记录内容", overwrite=false)
```

记录格式：
```markdown
---
name: ABC-Corp
type: email
updated: 2026-06-01T14:30:00+08:00
---

# ABC Corp — 开发信记录

## 邮件 1（首次开发信）
- 发送时间：2026-06-01 14:30
- 收件人：john.smith@abccorp.com
- 主题：Air Cooling Belt Splicing Press — Reduce Downtime by 40%
- 产品推荐：PA1200-3 风冷接头机
- CTA 策略：S2（产品资料+案例）
- 状态：已发送
```

---

## 发送结果解读

**成功**:
```json
{
  "ok": true,
  "messageId": "<abc123@smtp.exmail.qq.com>",
  "accepted": ["john.smith@abccorp.com"],
  "rejected": []
}
```

**失败处理**:

| 错误类型 | 处理方式 |
|---------|---------|
| SMTP 未配置 | 告知业务员去设置 → 邮件页面配置 |
| 认证失败 | 提示检查密码/授权码是否正确 |
| 连接超时 | 等 60 秒后重试一次 |
| 邮箱不存在 | 标记该邮箱无效，尝试其他联系方式 |
| 被拒收 | 检查是否被列入黑名单，换邮箱发送 |

---

## 批量发送

批量发送时，Agent 必须：
1. 逐封个性化（不能群发、不能 BCC 批量）
2. 控制频率（见上表）
3. 每封发送后记录结果
4. 全部完成后生成发送报告

发送报告格式：
```
## 批量发送报告 — 2026-06-01

| # | 客户 | 邮箱 | 状态 | 时间 |
|---|------|------|------|------|
| 1 | ABC Corp | john@abc.com | 成功 | 14:30 |
| 2 | XYZ Belt | mary@xyz.com | 成功 | 14:31 |
| 3 | DEF Ltd | tom@def.com | 失败(邮箱不存在) | 14:31 |

总计: 3 封, 成功: 2, 失败: 1, 成功率: 67%
```

---

## 邮件内容规范

### 签名

签名从 holo-desktop 设置的 `smtpSignature` 字段自动读取。Agent 无需手动拼接，传 `signature` 参数即可。

如未配置签名，使用标准格式：
```
Best regards,
{sender_name}
{sender_title} | HOLO Industrial Equipment
{sender_email} | {sender_phone}
{website}
```

### HTML 邮件规范
- 正文 ≤ 150 词
- 不用 emoji（工业设备 B2B 调性）
- 段落间留白，易读
- 可附产品图片链接（不嵌入，避免被拦截）

---

## 相关工具速查

| 工具 | 用途 |
|------|------|
| `get_smtp_status` | 检查 SMTP 配置状态 |
| `check_existing_customer` | 成交客户黑名单检查 |
| `send_email_smtp` | 实际发送邮件 |
| `email_finder` | 推测决策人邮箱 |
| `imap_inbox_check` | 检查收件箱（查回复） |
| `kb_write(type="email")` | 保存发送记录 |

## 相关技能

| 技能 | 用途 |
|------|------|
| `cold-email-generator` | 写开发信内容 |
| `inquiry-response` | 客户回复后应答 |
| `smart-quote` | 报价（开发信禁止报价） |
| `knowledge-base` | 查客户档案/产品知识 |

---

*email-sender v2.0 — 基于 Agent 工具链，不再依赖 PowerShell*
