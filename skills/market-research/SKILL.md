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

> **Skill Graph：** 领域 → [[_index-discovery|客户发现与调研领域]] | 上游 ← [[_index-discovery|客户发现领域]] | 下游 → [[market-development-report|市场开发报告]]


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

---

## 详细参考

> 以下内容已拆分到 [[references/extended-guide.md]]，仅在需要时读取：
> - 四、竞争格局
> - 五、客户画像
> - 六、进入策略
> - 执行摘要
> - Output Format
> - 🔴 NAS 资料路径（权威来源）
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
