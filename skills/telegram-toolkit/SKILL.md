---
name: telegram-toolkit
version: "1.0.0"
description: Telegram SDR 最佳实践与模板，覆盖俄罗斯/独联体/伊朗等 Telegram-first 市场。
triggers:
  - Telegram
  - 电报
  - 俄罗斯市场
  - telegram-toolkit
---

# telegram-toolkit — 红龙获客 Telegram 渠道技能

> Telegram SDR 最佳实践与模板。覆盖：Bot commands、inline keyboards、大文件处理、Telegram-first 市场策略。
> **适用市场**：俄罗斯/独联体/伊朗（这些市场 Telegram 是主渠道）

---

## 为什么 B2B 销售要用 Telegram

| 优势 | 影响 |
|------|------|
| **无 72h 窗口** | 可随时主动触达，不受 WhatsApp 72h 限制 |
| **2GB 文件限制** | 可发送完整产品目录 PDF、视频演示、认证文件 |
| **Bot commands** | 客户自助：`/catalog`、`/quote`、`/status` |
| **Inline keyboards** | 按钮式 BANT 采集，比文字快 3-5 倍 |
| **Username-based** | 客户无需暴露手机号，门槛更低 |
| **免费 API** | 无按消息收费 |
| **无封号风险** | Bot API 稳定，不像 WhatsApp 那样严打自动化 |

---

## Bot Commands

向 @BotFather 注册命令（`/setcommands`）：

```
start - 欢迎消息 + 产品概览
catalog - 浏览产品目录
quote - 请求报价
status - 查看订单/报价状态
contact - 联系真人销售
language - 切换语言
```

### 命令行为详解

#### `/start`

1. 检测 Telegram 用户 profile 的语言
2. 发送欢迎消息（2-3 句，含公司介绍）
3. 创建 CRM 记录：`source = telegram_organic`，`status = new`
4. 用 inline keyboard 提供产品分类
5. 自然开始 BANT 采集

#### `/catalog`

1. 检查 CRM 中客户的产品兴趣（回头客）
2. 已知兴趣 → 发送相关产品 section + 完整目录链接
3. 未知 → 发送产品分类 inline keyboard
4. 必含：规格、MOQ、典型交期
5. 文件格式：PDF 优先，单文件 ≤ 20MB

#### `/quote`

1. 检查 L1 MemOS 中的 BANT 数据
2. BANT 不完整 → 触发 inline keyboard 采集流程
3. BANT 完整 → 生成报价草稿 → 发送 owner 审批
4. 告知客户："正在准备报价，稍等片刻"

#### `/status`

1. 读取 CRM 中客户的记录
2. 返回：最新状态、待办动作、下次跟进日期
3. 报价已发 → "您的报价于 [日期] 发出，有兴趣讨论吗？"
4. 无记录 → "还没有您的订单记录，要开始一个吗？"

---

## Inline Keyboard 流程

### 快速 BANT 采集

**第一步 — N（产品）**

```json
{
  "text": "您对哪些产品感兴趣？",
  "reply_markup": {
    "inline_keyboard": [
      [{"text": "🔥 风冷接头机（三代）", "callback_data": "product_aircool"}],
      [{"text": "💧 水冷接头机", "callback_data": "product_watercool"}],
      [{"text": "📊 分层机", "callback_data": "product_ply"}],
      [{"text": "⚙️ 导条机/打齿机", "callback_data": "product_guide"}],
      [{"text": "📋 查看完整目录", "callback_data": "full_catalog"}]
    ]
  }
}
```

**第二步 — B（预算/数量）**

```json
{
  "text": "您的预估采购数量是？",
  "reply_markup": {
    "inline_keyboard": [
      [{"text": "1-2 台", "callback_data": "vol_1_2"}],
      [{"text": "3-5 台", "callback_data": "vol_3_5"}],
      [{"text": "6-10 台", "callback_data": "vol_6_10"}],
      [{"text": "10+ 台", "callback_data": "vol_10plus"}]
    ]
  }
}
```

**第三步 — A（决策权）**

```json
{
  "text": "您是采购负责人吗？",
  "reply_markup": {
    "inline_keyboard": [
      [{"text": "✅ 是，我可以决定", "callback_data": "auth_yes"}],
      [{"text": "🔍 我是技术/信息收集者", "callback_data": "auth_tech"}],
      [{"text": "👥 需要和团队讨论", "callback_data": "auth_team"}]
    ]
  }
}
```

**第四步 — T（时间线）**

```json
{
  "text": "您计划什么时候采购？",
  "reply_markup": {
    "inline_keyboard": [
      [{"text": "⚡ 紧急（1个月内）", "callback_data": "time_urgent"}],
      [{"text": "📅 近期（1-3个月）", "callback_data": "time_soon"}],
      [{"text": "📆 今年内（3-6个月）", "callback_data": "time_thisyear"}],
      [{"text": "🗓 计划中（6个月以上）", "callback_data": "time_plan"}]
    ]
  }
}
```

---

## 文件发送策略

| 文件类型 | 大小 | 格式 | 说明 |
|---------|------|------|------|
| 产品目录 | ≤ 10MB | PDF | 全目录或按分类拆分成多个 PDF |
| 单产品页 | ≤ 5MB | PDF / JPG | 高清产品参数 |
| 视频演示 | ≤ 1.5GB | MP4 | 机器运行视频，送样机视频 |
| 认证文件 | ≤ 5MB | PDF | CE / ISO 证书 |
| 报价单 | ≤ 2MB | PDF | 正式 PI / Quote |
| 图片 | ≤ 2MB | JPG / PNG | 产品图、客户现场图 |

> Telegram 单文件上限 2GB，但建议保持 ≤ 20MB 以提升客户打开率。

---

## Telegram-first 市场规则

### 市场优先级

| 国家/地区 | 主渠道 | 说明 |
|-----------|--------|------|
| 俄罗斯 | **Telegram** | WhatsApp 在俄罗斯被限制，Telegram 是默认 |
| 哈萨克斯坦 | **Telegram** | 同俄罗斯 |
| 伊朗 | **Telegram** | WhatsApp 被封锁，Telegram 广泛使用 |
| 白俄罗斯 | **Telegram** | Telegram 渗透率高 |
| 乌克兰 | **Telegram** | 战时 Telegram 使用率上升 |
| 其他独联体 | Telegram 优先 | 按国家判断 |

### 渠道切换规则

```
客户用 Telegram 联系我们
  → 用 Telegram 回复
  → 无需切换

客户用 WhatsApp 联系
  → 用 WhatsApp 回复

Telegram 超过 72h 无回复
  → 可继续发 Telegram（无窗口限制）
  → 但超过 7 天建议切换 Email

WhatsApp 客户
  → 告知我们有 Telegram："您也可以用 Telegram 联系我们，更方便"
```

---

## CRM 记录规则

### Telegram 来源标记

| 场景 | CRM source 标记 |
|------|----------------|
| 客户主动 Telegram 联系 | `telegram_organic` |
| 我们主动 Telegram 触达 | `telegram_outreach` |
| 从其他渠道（WhatsApp/Email）切换 | `channel_switch_telegram` |

### Telegram 特定字段

```yaml
telegram:
  username: "@xxx"          # Telegram username
  chat_id: "123456789"      # Telegram chat_id
  language: "ru"            # 检测语言
  bot_commands_used: []     # 用过的 commands
  inline_keyboard_responses: {}  # inline keyboard 选择结果
```

---

## 消息模板

### 欢迎消息（俄语）

```
👋 Здравствуйте!

Я Wike, менеджер по продажам HOLO Industrial.

Мы производим оборудование для обработки конвейерных лент:
🔥 Машины холодной вулканизации (III поколение)
💧 Машины горячей вулканизации
📊 Слоистые машины
⚙️ Направляющие / зуборезные станки

Какие продукты вас интересуют? Нажмите кнопку или напишите!
```

### 欢迎消息（英语）

```
👋 Hi there!

I'm Wike from HOLO Industrial.

We manufacture conveyor belt processing equipment:
🔥 Air-cool vulcanizers (3rd gen)
💧 Water-cool vulcanizers
📊 Ply separators
⚙️ Finger cutters / guide machines

What are you interested in? Click a button or just ask!
```

### 报价确认消息

```
📋 Quote ready for [Company Name]

Product: [Product] x [Quantity]
Price: USD [amount] (EXW Shanghai)
Lead time: [X] weeks
Payment: T/T 30/70

Validity: 7 days
PDF attached. Questions? Reply here or /quote for more.
```

---

## 与 HEARTBEAT 集成

`telegram-toolkit` 的自动化由 HEARTBEAT.md 驱动：

| 心跳任务 | Telegram 动作 |
|---------|-------------|
| 每日 10:00 线索发现 | 俄语市场 Exa 搜索 → Telegram 触达 |
| WhatsApp 72h 窗口检测 | 切换 Telegram 继续触达 |
| 报价追踪 >3 天 | Telegram 跟进消息 |
| 停滞线索 >5 天 | Telegram 激活消息 |

---

## 实施前提

- [ ] 向 @BotFather 创建红龙 Bot（用户名：`@HOLO_Industrial_Bot`）
- [ ] 配置 Bot API token
- [ ] 设置 Webhook 或 polling 模式
- [ ] 向 @BotFather 注册 commands
- [ ] CRM 支持 `telegram_organic` / `telegram_outreach` 标签
- [ ] 准备俄语/波斯语产品目录 PDF
