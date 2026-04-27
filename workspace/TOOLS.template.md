# TOOLS.md — 红龙获客系统工具配置

> 红龙获客系统完整工具配置、命令参考和 A2UI 交互式卡片协议。
> 基于 B2B-SDR template v2026.4.24 TOOLS.md 改造。
> 最后更新：2026-04-27

---

## A2UI 交互式卡片

### 什么是 A2UI

A2UI 是一种**声明式 UI 协议**。在聊天回复末尾嵌入 ````a2ui` 代码块，前端会自动提取并渲染为可交互的 UI 组件（客户卡片、按钮、邮件预览等）。

**不要**用 `write` 工具生成 HTML 文件，不要写入 canvas 文档系统，不要用 exec 生成文件。**只输出文本中的 ````a2ui` 块**。

### 基本格式

在 Markdown 正文后，按顺序输出以下两个块：

````a2ui
{"beginRendering":{"surfaceId":"唯一ID","catalogId":"basic"}}
````

````a2ui
{"surfaceUpdate":{"surfaceId":"唯一ID","components":[
  {"id":"组件ID","component":{"Text":{"text":"显示的文本"}}},
  {"id":"按钮ID","component":{"Button":{"text":"按钮文字","action":{"type":"动作类型","context":{}}}}}
]}}
````

### surfaceId 命名规则

`{技能缩写}-{客户名或场景}-{日期}`，例如：
- `cr-bando-2026` — company-research 坂东背调
- `eq-acme-2026` — cold-email-generator 开发信
- `sq-hl200-2026` — smart-quote 报价

### 组件类型

**Text（文本）：**
```json
{"id":"name","component":{"Text":{"text":"🏢 坂东化学 Bando"}}}
```

**Button（按钮）：**
```json
{"id":"send_btn","component":{"Button":{"text":"📧 发送开发信","action":{"type":"send_email","context":{"to":"kouhou@bandogrp.com","subject":"Partnership Inquiry"}}}}}
```

**可用动作类型：**
- `send_email` — context: `{to, subject, body}`
- `send_whatsapp` — context: `{phone, message}`
- `openUrl` — context: `{url}`
- `copy_text` — context: `{text}`
- `generate_quote` — context: `{company, product, quantity}`

### 完整示例（客户背调）

在 Markdown 报告后输出：

````a2ui
{"beginRendering":{"surfaceId":"cr-bando-2026","catalogId":"basic"}}
````

````a2ui
{"surfaceUpdate":{"surfaceId":"cr-bando-2026","components":[
  {"id":"name","component":{"Text":{"text":"🏢 坂东化学 Bando Chemical · ICP 38/100（C级）"}}},
  {"id":"info","component":{"Text":{"text":"东京证交所: 5195.T · 年营收 ~$717M · 全球约4,000人"}}},
  {"id":"decision","component":{"Text":{"text":"关键决策人: 高宫晃(社长) · 河野彰(董事/采购)"}}},
  {"id":"send","component":{"Button":{"text":"📧 发送日文开发信","action":{"type":"send_email","context":{"to":"kouhou@bandogrp.com","subject":"阪東化学×紅龍工业 協力会社のご提案"}}}}},
  {"id":"quote","component":{"Button":{"text":"💰 生成报价","action":{"type":"generate_quote","context":{"company":"坂东化学","product":"全自动风冷机","quantity":"待确认"}}}}}
]}}
````

### 规则

1. **先 Markdown 后 A2UI** — 文字报告在前，交互卡片在后
2. **beginRendering 和 surfaceUpdate 缺一不可**
3. **surfaceId 必须唯一**
4. **按钮动作必须有 context**，不要传空对象
5. **send_email context 必须包含 body** — 仅 to+subject 无法发送邮件
5. **不要在 A2UI 中透露精确利润率**，用范围代替（如 15%-20%）
6. **不要用 write/exec 生成 HTML/文件**，这不是 A2UI 的用法
7. **不要写入 canvas 文档系统**，A2UI 是聊天内嵌，不是独立文档

### 完整示例（邮件草稿）

````a2ui
{"beginRendering":{"surfaceId":"eq-acme-2026","catalogId":"basic"}}
````

````a2ui
{"surfaceUpdate":{"surfaceId":"eq-acme-2026","components":[
  {"id":"subject","component":{"Text":{"text":"Subject: Partnership Opportunity - HongLong Industrial Equipment"}}},
  {"id":"preview","component":{"Text":{"text":"Dear John,\n\nWe specialize in... (邮件正文摘要)"}}},
  {"id":"send","component":{"Button":{"text":"📤 发送此邮件","action":{"type":"send_email","context":{"to":"john@acme.com","subject":"Partnership Opportunity - HongLong Industrial Equipment","body":"Dear John,\n\n完整邮件正文..."}}}}},
  {"id":"copy","component":{"Button":{"text":"📋 复制邮件内容","action":{"type":"copy_text","context":{"text":"Dear John..."}}}}}
]}}
````

---

## 邮件发送（holo-server API）

### 架构
```
用户点击 A2UI "发送" 按钮
    ↓
React 前端 → holo-server POST /api/emails/send
    ↓
holo-server Nodemailer SMTP → 163邮箱（smtp.163.com:465）
```

### 配置
- **SMTP 配置**: 在 holo-server `.env` 中设置 `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- **API 端点**: `POST /api/emails/send`（需 JWT 认证）
- **质量门禁**: ICP≥75（传 leadId 时），禁止 info@/sales@ 等通用别名

### A2UI send_email 按钮
生成 A2UI 按钮时，context **必须包含 `body`**：

```json
{"type":"send_email","context":{"to":"client@company.com","subject":"Partnership Inquiry","body":"Dear ...\n\nFull email body here..."}}
```

### 发送窗口
- 不在客户当地时间 22:00-07:00 发送
- 周二/周三上午为最佳发送时间（冷邮件）

### 收件箱检查
如需查看客户邮件回复，可引导用户通过 holo-server `GET /api/emails/inbox` 检查收件箱。
IMAP 配置与 SMTP 共用账号，环境变量 `IMAP_HOST/IMAP_PORT/IMAP_USER/IMAP_PASS`。

---

## WhatsApp（wacli）

### 状态
✅ 已配置可用

### 发送方式
```bash
wacli send --phone "+86138xxxx" --message "消息内容"
```

### WhatsApp 反应（v2026.4.2+）
使用 `reactionLevel` 控制何时对客户消息做出反应：
- `"none"` — 无反应（默认，最安全）
- `"selective"` — 对关键消息做出反应（确认、下单、询盘）← **推荐用于 B2B**
- `"active"` — 对所有消息做出反应（参与感高，可能显得过于主动）

### 流式消息控制（v2026.4.5+）
部分 WhatsApp Business 账号可能遇到流式消息投递问题。使用 `blockStreaming: true` 发送完整消息：
```yaml
channels:
  whatsapp:
    blockStreaming: true   # 发送完整回复而非流式
    reactionLevel: "selective"
```

### 规则
- 72h 窗口内：可主动推送
- 72h 窗口外：必须客户先回复，否则切换 Telegram 或 Email
- 每次发送间隔 > 10 秒（防 spam）
- 不发纯数字验证码类内容
- WhatsApp 消息 ≤ 100 词，3-5 句，一个重点一条消息
- 客户用语音回复 → 优先语音回复（匹配沟通偏好）

### 市场优先级

| 市场 | 主渠道 | 次渠道 | 第三渠道 |
|------|--------|--------|---------|
| 非洲（尼日利亚/肯尼亚/加纳/坦桑尼亚）| **WhatsApp** | Email | — |
| 中东（沙特/阿联酋/阿曼）| **WhatsApp** | Email | LinkedIn |
| 东南亚（越南/菲律宾/印尼）| **WhatsApp** | Email | — |
| 拉美（巴西/智利/阿根廷/秘鲁）| **WhatsApp** | Email | — |
| 南亚（印度/巴基斯坦/孟加拉）| **WhatsApp** | Email | — |
| 欧洲（德国/法国/意大利/西班牙）| **Email** | WhatsApp | LinkedIn |
| 独联体（俄罗斯/哈萨克/乌兹别克）| **Telegram** | Email | WhatsApp |
| 伊朗 | **Telegram** | Email | — |

---

## Telegram Bot

### 状态
⚠️ 待配置（Bot Token 未设置）

### 渠道优势
- **无 72h 窗口限制**：WhatsApp 有 72h 限制，Telegram 可随时主动推送
- **文件最大 2GB**：完整产品目录、认证文件、视频演示
- **Bot 命令**：结构化自助服务（`/catalog`、`/quote`、`/status`）
- **内联键盘**：一键 BANT 资格认证，比打字快 3-5 倍
- **Username 连接**：客户无需暴露手机号，降低连接门槛
- **免费 API**：无每条消息费用

### 配置方法
1. @BotFather 创建 Bot，获取 Token
2. 配置到环境变量 `TELEGRAM_BOT_TOKEN`
3. 更新技能 `telegram-toolkit`

### Bot 命令（自动注册）
| 命令 | 动作 |
|------|------|
| `/start` | 欢迎消息 + 语言检测 + CRM 记录创建 |
| `/catalog` | 发送产品目录 PDF 或产品线摘要 |
| `/quote` | 启动报价流程 → 通过内联键盘收集 BANT |
| `/status` | 从 CRM 查询订单/报价状态 |
| `/contact` | 请求人工销售 → 通知 owner |
| `/language` | 切换对话语言 |

### 内联键盘模板
**采购量级：**
```
[< 100 units] [100-500] [500-1000] [1000+]
```
**时间线：**
```
[本月] [1-3个月] [3-6个月] [仅了解]
```
**产品兴趣：**
```
[风冷机] [水冷机] [分层机] [查看全部产品]
```

### 大文件策略
| 文件类型 | 大小 | 渠道 |
|---------|------|------|
| 快速报价（1-2页） | < 10MB | WhatsApp 或 Telegram |
| 完整产品目录 | 10-100MB | **Telegram only** |
| 认证文件 | 10-50MB | **Telegram only** |
| 视频演示 | 50MB-2GB | **Telegram only** |
| 合同/PI | < 10MB | Email（正式） + Telegram（快速送达） |

### 适用场景
- 俄罗斯/独联体市场优先渠道
- WhatsApp 72h 窗口过期后的备选渠道
- 大文件（PDF catalog > 10MB / 视频 / 认证文档）
- 正式文件（合同 / PI）发送

---

## LinkedIn

### 状态
⚠️ 待配置（Cookie 未注入）

### 适用场景
- 欧洲市场 B2B 触达
- 决策人搜索（采购总监、厂长、GM）
- 企业主页研究
- InMail 触达（≤ 150 词，专业简洁）

---

## CRM（孚盟 MX）

### 状态
⚠️ 未连通（未登录）

### 技能
- `fumamx-crm` — 孚盟 MX CRM 自动化操作
- 支持: 客户管理 / 查询 / 创建 / 更新 / 筛选 / 发送邮件

### 备选
- **Google Sheets Pipeline** — `${PIPELINE_DATA_PATH}` 路径
- 字段: name / company / whatsapp / email / country / language / status / source / icp_score / lead_tier / product_interest / created_at / last_contact / next_action / notes
- 只做 append 和 update，绝不覆盖整行

---

## Exa 搜索

### 状态
✅ 已配置（免费版）

### 工具
- `exa-web-search-free` — 必须通过 `mcporter` 调用
- `web_search_exa` — MCP 工具（最稳定）
- `crawling_exa` / `web_search_advanced_exa` — ⚠️ 经常报 "Tool not found"

### 使用
```bash
mcporter exa search --query "客户公司名 + procurement"
```

---

## Jina AI（网页内容获取）

### 状态
✅ 可用（API Key 通过环境变量注入）

### 工具优先级
1. `r.jina.ai` — 最稳定，用于读取官网
2. `browser-automation` — 动态页面
3. 直接 curl — 简单页面

### 官网研究（Layer 1）
```bash
curl -s 'https://r.jina.ai/https://客户官网.com' \
  -H 'Authorization: Bearer $JINA_API_KEY' \
  -H 'Accept: application/json'
```

### 搜索潜在客户（Layer 2）
```bash
curl -s 'https://s.jina.ai/QUERY_URL_ENCODED' \
  -H 'Authorization: Bearer $JINA_API_KEY' \
  -H 'Accept: application/json'
```

### 安全约束
- **禁止读取**：localhost、127.0.0.1、10.*、192.168.*、172.16-31.*（内部网络）
- **频率限制**：每天最多 20 次 API 调用（搜索 + 读取总计）
- **查询清理**：URL 编码所有搜索词，去除 HTML 标签和 shell 特殊字符

---

## Supermemory（研究存储 — L1 补充）

语义记忆，用于研究笔记、竞品情报和市场洞察。
- 研究后自动存储，打适当标签
- 每次触达前查询相关上下文
- 标签：customer_fact、competitor_intel、effective_tactic、market_signal
- 命令：`memory:add`、`memory:search`、`memory:list`、`memory:stats`

```bash
memory:add "Ahmed from Dubai buys 50 units/quarter, prefers FOB" --type customer_fact
memory:add "Beltwin dropped prices 15% in West Africa" --type competitor_intel
memory:add "WhatsApp voice notes get 2x reply rate in Middle East" --type effective_tactic
memory:search "Dubai customer preferences" --limit 5
```

---

## Active Memory 插件（v2026.4.10+）

可选插件，在主回复前插入一个专用的记忆子 Agent 步骤。子 Agent 自动搜索记忆中的相关偏好、过往线索详情、交易上下文和沟通历史——然后在不需任何手动记忆命令的情况下将顶部结果注入回复的上下文窗口。

### 启用
```yaml
# openclaw.json
plugins:
  active-memory:
    enabled: true
    mode: "recent"              # "message" | "recent" | "full"
    verbose: false              # 设为 true 查看拉取了什么记忆
    persistTranscripts: false
```

### 上下文模式
| 模式 | 行为 | SDR 用例 |
|------|------|---------|
| `message` | 仅当前消息触发搜索 | 最低延迟，适合简单 FAQ |
| `recent` | 最近 N 条消息作为搜索查询 | **推荐** — 捕获线程上下文 |
| `full` | 完整对话历史 | 最佳召回，token 成本更高 |

### B2B SDR 价值
在回复 "What's my order status?" 之前，agent 自动检索：该线索之前询问的产品、首选发货港、谈判定价层级、上次跟进日期——完全不需要在 prompt 中手动调用 `memory:search`。让多周销售线程保持连贯，零额外提示。

---

## ChromaDB（对话历史 — L3 + L4）

每轮存储 + customer_id 隔离 + 自动打标。
- L3：每轮对话自动存储，含 quote/commitment/objection 标签
- L4：每日 CRM 快照作为灾难恢复回退
- 命令：`chroma:store`、`chroma:search`、`chroma:recall`、`chroma:snapshot`、`chroma:stats`、`chroma:expand`
- 客户隔离：所有查询按 customer_id（电话号码）隔离

```bash
# 语义搜索
chroma:search "pricing discussion Dubai" --customer "+971501234567" --limit 5

# 返回客户完整历史
chroma:recall "+971501234567" --limit 10

# 查看被压缩 turn 的原文
chroma:expand <turn_id>
```

---

## Graphify（知识图谱 — 销售情报）

从产品目录、客户对话和市场研究中构建可查询的知识图谱。

### 何时查询
- 报价前 → 发现交叉销售产品
- 冷线索触达前 → 了解潜在客户的市场背景
- BANT 期间 → 从图谱关系检查产品匹配度
- 周度 Pipeline 审查 → 可视化客户聚类

### 查询命令
```bash
python3 -m graphify query "conveyor belt certification" --budget 1500
python3 -m graphify query "Brazil fleet customer" --dfs --budget 1000
```

---

## 开发信发送

### 流程
1. `cold-email-generator` 生成个性化开发信
2. `sdr-humanizer` 去 AI 味
3. 评分 ≥ 9.0 才发送
4. A2UI `send_email` 按钮 → 用户点击 → holo-server API 发送
5. `delivery-queue` 控制节奏

### 4步序列

| 步次 | 时间 | 内容类型 | 目标 |
|------|------|---------|------|
| Day 0 | 首日 | 个性化开场 | 建立联系 |
| Day 3 | 第3天 | 价值型跟进 | 提供案例 |
| Day 7 | 第7天 | 直接诉求 | 推动响应 |
| Day 14 | 第14天 | 最终跟进 | 激活或移 nurture |

---

## 报价系统

### 技能
- `smart-quote` — 先背调后报价，给利润率范围
- `quotation-generator` — PDF 形式发票
- `holo-proposal-generator` — 数字提案包 PDF

### 流程
```
客户问价 → 锁对话 → 背调 → 利润率区间 → 老板审批 → 发送报价 → CRM 更新
```

### 报价后追踪

| 天数 | 状态 | 动作 |
|------|------|------|
| Day 0 | quote_sent | 报价发出 |
| Day 3 | 无回复 | 跟进消息（价值强化，不提价格） |
| Day 7 | 无回复 | 第二轮跟进（问具体顾虑） |
| Day 14 | 无回复 | 最终跟进，或移入 nurture |

---

## NAS 挂载

### 状态
⚠️ 未挂载

### 挂载命令（Windows）
```powershell
net use Y: \\192.168.0.194\home /user:${env.NAS_USER} ${env.NAS_PASSWORD}
```

### 用途
- 产品图片、视频目录
- 原始技术文档
- 认证文件库

---

## Cron 自动任务

| 任务 | 频率 | 说明 |
|------|------|------|
| HEARTBEAT（Pipeline 巡检） | 每 15 分钟 | 14 项自动检查 |
| 线索发现 | 每日 10:00 | 按星期轮换市场 |
| 邮件序列 Day3/7/14 | 每日 11:00 | 自动跟进 |
| CRM 快照备份 | 每日 12:00 | L4 灾难恢复 |
| 记忆健康检查 | 每日 14:00 | Supermemory + ChromaDB |
| 竞品动态 | 每周五 14:00 | Beltwin + 行业动态 |
| 培育/休眠检查 | 每周一 08:30 | 售后关怀 + 季度跟进 |

详见 `HEARTBEAT.md`

---

## 渠道规则总结

- **客户用哪个渠道发起，就用哪个渠道回复**（渠道一致性）
- WhatsApp 72h 窗口过期 → 自动切换 Telegram 或 Email
- 大文件（PDF catalog > 10MB / 视频 / 认证文档）→ Telegram 或 Email 附件
- 正式文件（合同 / PI / 技术规格书）→ Email + WhatsApp/Telegram 简短通知
- 敏感讨论（价格/条款）→ Email 留书面记录（WhatsApp 可同步简短确认）

---

*基于 OpenClaw v2026.4.24 · B2B-SDR Template TOOLS.md 同步 · 红龙工业设备定制版*
