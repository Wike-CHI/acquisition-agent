# TOOLS — 红龙获客系统工具配置

> 版本: v1.0 | 日期: 2026-03-31
> 适配红龙工业皮带设备制造有限公司，专注文工业皮带 B2B 外贸场景。

---

## 工具全景图

```
红龙获客系统工具层
├── 数据层
│   └── CRM（孚盟MX / Google Sheets）— 单一事实来源
├── 沟通层
│   ├── Gmail — 外贸正式沟通、冷邮件、报价单
│   ├── LinkedIn — B2B 发现、决策人触达
│   ├── Facebook — 行业群组发现
│   └── Instagram — 品牌展示、产品推广
├── 智能层
│   ├── Exa API — 语义搜索（客户发现、背调）
│   ├── DeepSeek API — 开发信生成、润色
│   ├── Supermemory — 研究记忆层（L1增强）
│   └── ChromaDB — 对话向量存储（L3+L4）
├── 外部技能层（20个技能）
│   ├── Office生成 — docx（报价单/合同）、pptx（演示）、xlsx（表格）
│   ├── 搜索能力 — tavily-search（AI搜索）、brave-web-search（网页搜索）
│   ├── 邮件系统 — email-skill（SMTP发送）
│   ├── PDF处理 — pdf（生成/处理）、pdf-skill（基础操作）
│   ├── 笔记记忆 — memos-memory-guide（Memos）、notion-skill（Notion）
│   ├── 日程规划 — calendar-skill（日历）、planning-with-files（任务规划）
│   └── 开发工具 — github-skill、ssh-skill、agent-reach等
└── 工具层
    ├── delivery-queue — 分段发送队列
    ├── sdr-humanizer — 开发信润色
    └── 报价单 — DeepSeek API 生成 + external-skills/docx 生成 docx
```

---

## 1. CRM — 单一事实来源

### 目标系统：孚盟MX CRM

> 孚盟MX（fumamx.com）是红龙当前使用的 CRM 系统。
> 配置方式参考 `skills/fumamx-crm/`。

### 备选方案：Google Sheets

当孚盟MX不可用时，使用 Google Sheets 作为备用 CRM：

```bash
# 读取客户列表
gws sheets spreadsheets.values get \
  --params '{"spreadsheetId":"{{SHEETS_ID}}","range":"Leads!A:R"}'

# 追加新客户
gws sheets spreadsheets.values append \
  --params '{"spreadsheetId":"{{SHEETS_ID}}","range":"Leads!A:R","valueInputOption":"USER_ENTERED"}' \
  --body '{"values":[["{{公司}}","{{联系人}}","{{邮箱}}","{{电话}}","{{阶段}}","{{来源}}","{{日期}}"]]}'
```

### CRM 数据字段（红龙标准）

| 字段 | 说明 | 示例 |
|------|------|------|
| `company` | 公司名称 | Al Rashid Industries |
| `contact` | 联系人姓名 | Mohammed Hassan |
| `email` | 邮箱（铁律：无邮箱不进入开发信）| {{SALES_EMAIL}} |
| `phone` | 电话 | +966-11-xxx-xxxx |
| `source` | 来源渠道 | LinkedIn / Google / 展会 / Facebook |
| `country` | 国家 | Saudi Arabia |
| `industry` | 行业 | Tire Manufacturing |
| `stage` | 当前阶段 | discovering / qualifying / proposal / negotiation / closed |
| `products` | 感兴趣的产品 | 打齿机, 分层机 |
| `last_contact` | 上次联系日期 | 2026-03-28 |
| `next_action` | 下一步行动 | 发送报价单 |
| `notes` | 备注 | 目标月产能5000条皮带 |

### 重要原则
- **仅使用 `append`（追加）和 `update`（更新）操作**
- **绝不覆盖整行数据**
- 每次变更后记录 `last_update` 时间戳

---

## 2. 沟通渠道配置

### A. Gmail（主要外贸沟通渠道）

**用途**：冷邮件序列、客户回复监控、正式文件（报价单/合同）发送。

#### 核心操作

```bash
# 读取收件箱（监控客户回复）
gmail list --maxResults 20 --query "from:{email} after:{date}"

# 发送邮件
gmail send --to "{email}" --subject "{subject}" --body "{body}"

# 发送附件（报价单）
gmail send \
  --to "{email}" \
  --subject "HOLO Industrial Belt Equipment - Quotation #{quote_id}" \
  --body "{body}" \
  --attachments "Y:/报价单/{quote_id}.docx"   # 报价单输出目录（需手动创建）
```

#### 铁律
- **无邮箱不进入开发信步骤**
- 发送前验证邮箱格式和域名
- 报价单发送后更新 CRM 状态

---

### B. LinkedIn（决策人发现与触达）

**用途**：发现决策人、获取公司背景、LinkedIn 消息触达。

#### 方案1：Exa Free via mcporter（无需API Key，已验证可用）
```bash
# 检查 Exa Free 服务状态
mcporter list exa

# LinkedIn 决策人搜索（穿透公开档案）
mcporter call "exa.web_search_exa(query: 'linkedin profile gerente compras banda transportadora Colombia', numResults: 8, includeDomains: ['linkedin.com'])"

# 公司主页搜索
mcporter call "exa.web_search_exa(query: 'linkedin company banda transportadora Colombia vulcanizadora', numResults: 5, includeDomains: ['linkedin.com'])"

# 南美工业皮带关键词模板
# 西班牙语: gerente compras（采购经理），operaciones（运营），banda transportadora（传送带）
# 葡萄牙语: gerente de compras（巴西）
# 英语: procurement manager conveyor belt
```

#### 方案2：Exa API（需要 EXA_API_KEY）
```bash
# 搜索目标公司决策人（通过 Exa，不直接爬 LinkedIn）
exa-search --query "site:linkedin.com {company_name} procurement manager OR purchasing director OR CEO" \
  --numResults 5
```

# LinkedIn 个人主页背调
fetch-webpage --url "{linkedin_url}" --extract "name,title,company,connections"

#### 决策人识别关键词

| 职位关键词 | 适用场景 |
|-----------|---------|
| `CEO`, `Managing Director`, `Owner` | 小型公司决策人 |
| `Procurement Manager`, `Purchasing Director` | 中大型公司采购决策 |
| `Production Manager`, `Factory Manager` | 工厂设备采购 |
| `Technical Director`, `Engineering Manager` | 技术规格评估 |

---

### C. Facebook（行业群组发现）

**用途**：发现行业群组、挖掘公司主页、获取潜在客户线索。

```bash
# 搜索工业皮带相关群组
facebook search-groups --query "industrial belt OR conveyor belt OR rubber manufacturing" --limit 10

# 获取群组成员公司
facebook group-members --groupId "{group_id}" --limit 50
```

#### 目标群组关键词
- `Industrial Belt Manufacturers`
- `Conveyor Belt Solutions`
- `Rubber & Tire Manufacturing`
- `Auto Parts Wholesale`

---

### D. Instagram（品牌展示）

**用途**：产品图片/视频发布、Reels 展示、客户互动。

```bash
# 发布产品图片
instagram post \
  --image "Y:/3..产品图册.产品单页.折页 产品海报/机器海报/{product_image}.jpg" \
  --caption "{caption}" \
  --hashtags "#industrialbelt #conveyor #manufacturing"

# 发布 Reels
instagram reel \
  --video "Y:/7.企业介绍宣传视频 企业宣传手册/{product_video}.mp4" \
  --caption "{caption}"
```

---

## 3. 智能层工具

### A. Exa API — 语义搜索（L3 发现层）

**用途**：客户发现、公司背调、竞品分析、LinkedIn 决策人搜索。

#### 选项优先级：
1. **Exa Free via mcporter**（无需API Key，已验证可用）— 首选
2. **Exa API**（需要 EXA_API_KEY）— 备选
3. **web_search**（Google搜索，LinkedIn受限）— 最后降级

```bash
# 客户发现搜索（通用）
exa-search \
  --query "tire manufacturing companies Saudi Arabia OR UAE OR Egypt" \
  --numResults 10 \
  --type "company"

# LinkedIn 决策人搜索（穿透公开档案）
mcporter call "exa.web_search_exa(query: 'linkedin profile procurement manager conveyor belt industrial equipment Brazil', numResults: 8, includeDomains: ['linkedin.com'])"

# 公司背调
exa-search \
  --query "{company_name} annual report revenue factory location" \
  --numResults 5

# 检查工具状态
mcporter list exa  # 检查 Exa Free 可用性
echo $EXA_API_KEY  # 检查 API Key 是否配置
```

#### 执行前检查规则：
1. 检查 `mcporter list exa` → 如果有exa服务，用Exa Free
2. 检查 `EXA_API_KEY` 环境变量 → 如果存在，用exa-search技能  
3. 降级到 `web_search` → 告知用户LinkedIn可能受限

#### Exa 搜索参数

| 参数 | 说明 |
|------|------|
| `--query` | 搜索查询语句 |
| `--numResults` | 返回结果数量 |
| `--type` | 结果类型：`company` / `article` / `person` |
| `--date` | 发布时间过滤（如 `2025-01-01`）|

---

### B. DeepSeek API — AI 生成

**用途**：开发信生成、润色、报价单内容、询盘解析。

```bash
# 生成开发信
deepseek call \
  --system "你是一位资深 B2B 外贸销售，专注工业皮带设备" \
  --prompt "为以下客户生成个性化开发信：公司{company}，产品兴趣{products}，国家{country}，痛点{pain_point}" \
  --temperature 0.7 \
  --maxTokens 500
```

#### DeepSeek 任务分类

| 任务 | temperature | maxTokens | 备注 |
|------|-----------|----------|------|
| 开发信生成 | 0.7 | 500 | 个性化，需要创意 |
| 开发信润色 | 0.3 | 300 | 保持原意，纠正语法 |
| 报价单生成 | 0.2 | 800 | 精确，参考产品数据 |
| 询盘解析 | 0.3 | 400 | 结构化输出 |

---

### C. Supermemory — 研究记忆层（L1 增强）

**用途**：存储市场情报、竞品分析、有效话术记录。

```bash
# 添加记忆
memory:add \
  --type "competitor_intel" \
  --content "{content}" \
  --tags ["{company}", "industrial_belt"]

# 搜索记忆
memory:search --query "{query}" --type "{type}" --limit 5

# 列出某类型记忆
memory:list --type "effective_script"

# 查看统计
memory:stats
```

#### 记忆类型与 TTL

| 类型 | TTL | 示例 |
|------|-----|------|
| `customer_fact` | 永久 | "Al Rashid 每月采购 2000 条皮带" |
| `conversation_insight` | 90天 | "客户对分层机更感兴趣" |
| `market_signal` | 30天 | "沙特阿拉伯皮带市场需求上升" |
| `effective_script` | 永久 | "以当地市场数据开场 → 3倍回复率" |
| `competitor_intel` | 永久 | "竞品A价格低10%，但交期更长" |

---

### D. ChromaDB — 对话向量存储（L3+L4）

详见 `ANTI-AMNESIA.md` 和 `skills/chroma-memory/`。

---

## 4. 工具层

### A. delivery-queue — 分段发送队列

避免触发垃圾邮件检测，模拟真人发送节奏。

```bash
# 调度信息发送
deliver:schedule \
  --customer "{email}" \
  --segments [3,5,2] \
  --content "{long_message}" \
  --timezone "{customer_timezone}" \
  --delayMs 3000

# 查看队列
deliver:list

# 取消发送
deliver:cancel --id "{delivery_id}"

# 立即发送（测试用）
deliver:flush
```

#### 配置参数

```yaml
default_delay_ms: 3000    # 片段间隔（毫秒）
max_segments: 10          # 最大片段数
timezone: "Asia/Shanghai" # 业务员时区
quiet_hours:
  start: "22:00"
  end: "07:00"
```

---

### B. 报价单生成

> 通过 DeepSeek API 生成报价内容，再由脚本输出为 .docx 文件。
> 报价单内容由业务员根据 `W:/报价参考表.xlsx` 的销售员内部价（未税）自行定价。
> ⚠️ 开票加13%，红龙利润率红线：印度≥20%、马来西亚≥20%、孟加拉≥10%

```bash
# 生成报价单（使用 DeepSeek API）
python scripts/generate_quote.py \
  --customer "{company}" \
  --products "打齿机-HOLO-FP2000,分层机-HOLO-PS750" \
  --currency USD \
  --output "Y:/报价单/{quote_id}.docx"   # 报价单输出目录（需手动创建）
```

---

### C. sdr-humanizer — 开发信润色

```bash
# 润色开发信
humanize \
  --text "{original_email}" \
  --target_country "{country}" \
  --tone "professional_but_friendly" \
  --output "improved"
```

---

## 5. 安全约束

| 约束 | 说明 |
|------|------|
| **禁止访问内网 IP** | 127.0.0.1, 192.168.* 等内网段 |
| **禁止覆盖 CRM 行数据** | 只追加和更新特定字段 |
| **铁律** | 无邮箱不进入开发信步骤 |
| **ECL 监控** | 所有工具调用受 ECL 轨迹追踪 |
| **外部操作需确认** | 发送邮件/消息前必须业务员确认 |
