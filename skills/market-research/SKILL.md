---
name: market-research
slug: market-research
version: 1.2.0
description: 市场研究技能的红龙定制包装入口。检测到 HONGLONG-OVERRIDE.md 时优先使用定制内容。六维度市场分析框架：市场规模、市场增长、市场细分、竞争格局、客户画像、进入策略。
triggers:
  - 市场分析
  - 竞争分析
  - 市场规模
  - TAM SAM SOM
  - industry research
  - 市场调研
  - 竞品分析
  - 竞争对手分析
  - 开发XX市场
  - 开发非洲
  - 开发东南亚
  - 开发南美
---

# 技能路由入口 — Market Research

> 本文件为 market-research 技能的路由入口。
> **不随社区技能更新覆盖**，保持红龙定制逻辑。

## 路由逻辑

AI Agent 执行以下检测：

```
本文件所在目录是否存在 HONGLONG-OVERRIDE.md？
    │
    ├─ 是 → 读取 HONGLONG-OVERRIDE.md 内容作为完整技能指令
    │         （跳过以下原始社区技能内容）
    │
    └─ 否 → 读取下方原始社区技能内容执行
```

> **为什么这样设计**：HONGLONG-OVERRIDE.md 是独立文件，社区技能更新只覆盖 SKILL.md，
> 不覆盖 HONGLONG-OVERRIDE.md，红龙定制内容得以保留。

---

## 原始社区技能内容

> 以下为原始 clawdhub 技能内容（仅当 HONGLONG-OVERRIDE.md 不存在时使用）

<!-- honglong-override: original community skill metadata
name: Market Research
description: "Research markets with sizing, segmentation, competitor mapping, pricing checks, and demand validation that turn fuzzy ideas into decision-ready evidence."
-->

# Market Research

Research markets with **six-dimensional analysis framework**:
1. Market Sizing (TAM/SAM/SOM)
2. Market Growth (CAGR & Drivers)
3. Market Segmentation (Industry/Geography/Customer)
4. Competitive Landscape (Direct/Indirect/Potential)
5. Customer Profile (ICP/Decision Chain/Pain Points)
6. Entry Strategy (Priority/Tactics/Risk)

## Dimension 1: Market Sizing

### TAM/SAM/SOM Framework

- **TAM** (Total Addressable Market): Full market demand
- **SAM** (Serviceable Addressable Market): Segment you can serve
- **SOM** (Serviceable Obtainable Market): Realistic share in near term

### Data Sources

| Level | Sources |
|-------|---------|
| TAM | Industry associations, government statistics, global reports |
| SAM | Regional data, trade publications, company filings |
| SOM | Historical win rates, sales capacity, market share data |

## Dimension 2: Market Growth

### Growth Analysis

- **CAGR**: Compound Annual Growth Rate
- **Drivers**: What fuels the market?
- **Risks**: What could slow it down?

### For HOLO Belt Equipment:

| Driver Type | Examples |
|-------------|----------|
| Mining expansion | Nickel, coal, copper mining |
| Infrastructure | Belt conveyors in ports, factories |
| Manufacturing | Automotive, rubber, palm oil |
| Maintenance | Repair/replace cycles |

## Dimension 3: Market Segmentation

### B2B Segmentation Variables

| Variable | Options |
|----------|---------|
| Industry | Mining, Manufacturing, Logistics, Energy |
| Company size | SMB, Mid-Market, Enterprise |
| Geography | Country, Region, City tier |
| Customer Type | End user, Distributor, Service provider |

### Customer Priority Matrix

| Grade | Criteria | Development Priority |
|-------|----------|---------------------|
| A | Active mining + mentions competitors | Immediate |
| B | Stable demand + technical buyer | Short-term |
| C | Potential but uncertain | Long-term |

## Dimension 4: Competitive Landscape

### Framework

1. **Direct competitors** — Belt splicing equipment brands
2. **Indirect competitors** — Alternative solutions
3. **Potential competitors** — Could enter your space

### HOLO Competitive Position

| Brand | Price Range | Strength | Weakness |
|-------|-------------|----------|----------|
| Flexco | $20K-$50K+ | Brand, quality | Long lead time |
| Almex | $20K-$45K | Technology | Inflexible |
| HOLO | $8K-$20K | Flexibility, price | Brand awareness |
| China local | $3K-$10K | Price | Quality unstable |

## Dimension 5: Customer Profile

### ICP (Ideal Customer Profile)

**For HOLO belt equipment:**

| Attribute | A-Class Customer |
|-----------|------------------|
| Industry | Mining, Cement, Palm Oil, Rubber |
| Size | Annual output > 500K tons |
| Behavior | Mentions Flexco/Almex |
| Need | Fast delivery, customization |
| Has | Own maintenance team |

### Decision Chain

```
End User (Mine Manager)
    ↓ requests
Procurement (Cost focus)
    ↓ evaluates
Technical (Quality focus)
    ↓ approves
Management (ROI focus)
    ↓ decides
```

### Pain Points

| Pain Point | Description |
|------------|-------------|
| Long lead time | Flexco 4-8 weeks |
| Quality issues | Local brands fail often |
| Poor after-sales | Slow response |
| Limited customization | Standard models only |

## Dimension 6: Entry Strategy

### Priority Matrix

| Priority | Market | Reason |
|----------|--------|--------|
| P0 | Top 2 countries | Fastest growth |
| P1 | Emerging markets | High potential |
| P2 | Stable markets | Maintain presence |

### Tactics

1. **Target**: A-class customers with Flexco/Almex mentions
2. **Angle**: "Flexco quality, faster delivery, flexible customization"
3. **Channels**: Trade shows, LinkedIn, direct outreach
4. **Proof**: Case studies, certifications

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Political instability | Medium | High | Diversify markets |
| Currency fluctuation | Medium | Medium | USD pricing |
| New competitors | High | Medium | Build relationships |

---

## 六维度分析模板

> ⭐ 生成报告时的完整模板，确保每个维度都覆盖

### 模板示例：东南亚市场六维度分析

```markdown
# [市场名称] 皮带设备市场六维度分析报告

> **报告日期**: YYYY-MM-DD
> **分析范围**: [国家列表]
> **目标产品**: 皮带接头机、分层机、打齿机及相关硫化设备

---

## 一、市场规模

### 1.1 总体市场容量
- **TAM**: US$ XX亿/年
- **SAM**: US$ XX万-XX万/年
- **SOM**: US$ XX万-XX万/年

### 1.2 重点国家分布
| 国家 | 市场容量 | 占比 | 优先级 |
|------|---------|------|--------|
| XX国 | US$ XX | XX% | ⭐⭐⭐ |

---

## 二、市场增长

### 2.1 增长率
| 国家 | CAGR | 趋势 |
|------|------|------|
| XX国 | XX% | ↑上升/↓下降/→平稳 |

### 2.2 核心驱动因素
| 因素 | 影响程度 | 说明 |
|------|---------|------|
| 采矿扩张 | ⭐⭐⭐ | [具体描述] |
| 基础设施建设 | ⭐⭐ | [具体描述] |

### 2.3 风险因素
- ⚠️ [风险1]: [描述]
- ⚠️ [风险2]: [描述]

---

## 三、市场细分

### 3.1 行业分布
| 行业 | 占比 | 年需求 | 增长趋势 |
|------|------|--------|---------|
| 采矿 | XX% | US$ XX | ↑ |
| 水泥 | XX% | US$ XX | → |
| 制造 | XX% | US$ XX | ↑ |

### 3.2 地理分布
- 🥇 **[国家A]**: [描述市场特征]
- 🥈 **[国家B]**: [描述市场特征]
- 🥉 **[国家C]**: [描述市场特征]

### 3.3 客户类型分布
| 类型 | 占比 | 特征 |
|------|------|------|
| 采矿企业 | XX% | [特征] |
| 皮带服务商 | XX% | [特征] |
| 代理商 | XX% | [特征] |

---

## 四、竞争格局

### 4.1 主要竞争对手
| 品牌 | 国家 | 价格带 | 市场份额 | 弱点 |
|------|------|--------|---------|------|
| Flexco | 美国 | $20K+ | XX% | 交期长 |
| Almex | 加拿大 | $18K+ | XX% | 定制不灵活 |
| HOLO | 中国 | $8K-$20K | XX% | 品牌认知 |

### 4.2 价格带分布
```
$20K+  ═══════════════ Flexco, Almex
$10K-20K ════════════ [中端品牌]
$5K-10K  ════════════ [中低端品牌]
$3K-5K   ════════════ [本地品牌]
           ↑ HOLO机会区间
```

### 4.3 HOLO差异化定位
| 维度 | Flexco | 本地品牌 | HOLO |
|------|--------|---------|------|
| 品质 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 交期 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 价格 | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 定制 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 五、客户画像

### 5.1 A级客户（优先开发）
| 特征 | 描述 |
|------|------|
| 行业 | [采矿/水泥/皮带服务商] |
| 规模 | 年产XX万吨以上 |
| 需求信号 | 主动提Flexco/关心交期 |
| 决策链 | [简要描述] |
| 核心痛点 | 交期长/定制需求/售后响应慢 |

### 5.2 ICP匹配度
满足以下2条以上 → A级客户：
- ✅ [条件1]
- ✅ [条件2]
- ✅ [条件3]
- ✅ [条件4]

### 5.3 典型客户案例
| 公司名称 | 国家 | 行业 | 年产值 | ICP评分 |
|---------|------|------|--------|--------|
| [公司A] | XX | 采矿 | US$ XX | ⭐⭐⭐⭐⭐ |

---

## 六、进入策略

### 6.1 市场优先级
| 优先级 | 国家 | 理由 | 预期收益 |
|--------|------|------|---------|
| 🥇 P0 | [国家A] | [原因] | US$ XX/年 |
| 🥈 P1 | [国家B] | [原因] | US$ XX/年 |
| 🥉 P2 | [国家C] | [原因] | US$ XX/年 |

### 6.2 目标客户名单
| 公司名称 | 国家 | 行业 | ICP评分 | 开发优先级 |
|---------|------|------|---------|-----------|
| [公司A] | XX | 采矿 | ⭐⭐⭐⭐⭐ | P0 |
| [公司B] | XX | 水泥 | ⭐⭐⭐⭐ | P0 |
| [公司C] | XX | 皮带服务 | ⭐⭐⭐ | P1 |

### 6.3 开发话术
**定位语**:
> "[竞争对手]品质，更快交期，更灵活方案"

**针对痛点**:
| 痛点 | 话术 |
|------|------|
| 交期长 | "我们交期比Flexco快50%，4周内交付" |
| 定制需求 | "支持非标规格，7天出方案" |
| 售后响应 | "24小时技术支持，48小时现场响应" |

### 6.4 渠道策略
| 渠道 | 优先级 | 预期效果 |
|------|--------|---------|
| 展会 | ⭐⭐⭐⭐ | [效果描述] |
| LinkedIn | ⭐⭐⭐ | [效果描述] |
| 海关数据 | ⭐⭐⭐ | [效果描述] |
| 现有客户推荐 | ⭐⭐⭐⭐⭐ | [效果描述] |

### 6.5 风险评估与应对
| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 政治风险 | 中 | 高 | 分散市场，优先政治稳定国家 |
| 汇率风险 | 中 | 中 | USD报价，对冲汇率 |
| 竞争加剧 | 高 | 中 | 建立客户关系，提高转换成本 |

### 6.6 时间规划
| 阶段 | 时间 | 目标 |
|------|------|------|
| 调研期 | 1-2周 | 完成客户名单 |
| 开发期 | 1-3月 | 联系P0级客户 |
| 跟进期 | 3-6月 | 转化首批客户 |
| 扩张期 | 6-12月 | 拓展P1级市场 |

---

## 执行摘要

```
市场机会: ★★★★☆
竞争强度: ★★★☆☆
HOLO适配度: ★★★★☆

核心结论:
1. [最重要结论]
2. [第二结论]
3. [第三结论]

立即行动:
□ 优先开发：[国家/客户]
□ 参加展会：[展会名称]
□ 准备资料：[资料清单]
```

---

*报告生成: YYYY-MM-DD HH:mm*
*分析师: HOLO-AGENT*
```

---

## Output Format

> ⭐ **六维度市场分析框架** — HOLO获客系统标准格式

每个报告必须包含以下六个维度：

| 维度 | 内容 | 必须包含 |
|------|------|---------|
| **一、市场规模** | TAM/SAM/SOM量化 | 重点国家分布 |
| **二、市场增长** | CAGR、驱动因素 | 风险因素 |
| **三、市场细分** | 行业/地理/客户类型 | 客户分级 |
| **四、竞争格局** | 竞争对手分析 | HOLO差异化 |
| **五、客户画像** | ICP、决策链、痛点 | 典型案例 |
| **六、进入策略** | 优先级、名单、话术 | 风险评估、时间规划 |

**报告必须包含执行摘要**：市场机会星级评分 + 核心结论 + 立即行动清单

---

## 🔴 NAS 资料路径（权威来源）

### 营销宣传资料

```
Y:\3..产品图册.产品单页.折页 产品海报\       # 产品图册/海报
Y:\7.企业介绍宣传视频  企业宣传手册\          # 宣传视频/画册
Y:\14.展会照片视频海报 素材.邀请函 促销海报节日海报\  # 展会物料
Y:\AI知识索引\honglong-products\              # AI知识索引（产品）
```

### 产品资料

```
Y:\1.HOLO机器目录（最终资料存放）\
```

### 调研前检查流程

> ⚠️ **市场调研前必须先检查 NAS 资料和已有报告**

```
用户请求："分析东南亚市场"
         ↓
┌─────────────────────────────────────────┐
│ 1. 检查AI知识索引                        │
│    读取 Y:\AI知识索引\honglong-products\ │
│    查找相关市场分析文件                   │
└─────────────────────────────────────────┘
         ↓
┌─ 找到相关文件 → 读取内容作为上下文
│
└─ 未找到 → 继续执行六维度市场调研
```

### 调研前查询（必检）

**触发时机**：用户请求调研市场时，**先执行查询**

```powershell
# 调研前：先查知识库
. "C:\Users\Administrator\.workbuddy\skills\knowledge-base\scripts\read-knowledge.ps1" -Type market -Name "东南亚市场"
```

### 调研后保存（自动）

**触发时机**：调研报告生成并保存到本地文件后

```powershell
# 调研后：保存到知识库
. "C:\Users\Administrator\.workbuddy\skills\knowledge-base\scripts\write-knowledge.ps1" -Type market -Name "东南亚市场" -Content $reportContent -Overwrite "yes"
```

### 钩子2：调研后保存（自动）

**触发时机**：调研报告生成并保存到本地文件后

```powershell
# 调研后：保存到知识库
. "$PSScriptRoot\..\knowledge-base\scripts\write-knowledge.ps1" -Type market -Name "东南亚市场" -Content $reportContent -Overwrite "yes"
```

### 知识库结构

```
\\192.168.0.194\home\knowledge\
└── market-research/
    ├── 东南亚市场.md        ← 中文文件名 ✅
    ├── 非洲市场.md
    └── ...
```

### 保存逻辑

1. 报告生成后 → 检查是否为有效调研报告（>500字符）
2. 调用 `write-knowledge.ps1` → 保存到NAS
3. 记录操作日志（holo-activity-log）
4. 告知用户报告已同步到知识库

### 调用示例

```powershell
# 调研前查询
$existing = . "$PSScriptRoot\..\knowledge-base\scripts\read-knowledge.ps1" -Type market -Name "东南亚市场"

# 调研后保存
. "$PSScriptRoot\..\knowledge-base\scripts\write-knowledge.ps1" -Type market -Name "东南亚市场" -Content $reportContent -Overwrite "yes"
```
