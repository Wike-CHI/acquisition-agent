---
name: geo-content-gen
version: "2.0.0"
description: |
  全栈 SEO/GEO 内容引擎。关键词研究 → 竞品分析 → 多语言内容生成 → 平台发布优化 → AI 搜索引擎监控 → 效果迭代。
  覆盖 LinkedIn、Facebook、Alibaba、Instagram，5 种目标市场语言，工业皮带接头设备垂直领域。
triggers:
  - 生成SEO内容
  - GEO内容
  - 搜索优化内容
  - 多语言产品内容
  - 发社媒内容
  - 关键词研究
  - 竞品内容分析
  - GEO监控
  - 内容日历
  - geo-content
category: social-media
tools:
  - web_search
  - web_fetch
  - write_file
  - generate_file
  - generate_image
  - nas_read
  - nas_search
  - read_file
  - spawn_agent
---

# GEO Content Engine v2.0

> **Skill Graph：** 领域 → [[_index-outreach|多渠道触达领域]]


> 全栈 SEO/GEO 内容引擎 — 关键词研究到 AI 搜索引擎引用监控

## References 目录

| 文件 | 内容 |
|------|------|
| `references/keyword-matrix.md` | 产品关键词映射、搜索意图分类、关键词聚类、竞品差距矩阵 |
| `references/content-templates.md` | 6 种内容模板、Schema.org 结构化数据、质量检查清单、禁用词表 |
| `references/platform-specs.md` | LinkedIn/Facebook/Alibaba/Instagram 优化规范、多语言策略、发布日历 |
| `references/geo-monitoring.md` | AI 搜索引擎引用检查、效果评估、未引用补救策略、A/B 测试 |

## 公司画像

- **公司**: 温州红龙工业设备制造有限公司
- **定位**: 皮带接头设备源头厂家（非贸易商）
- **差异化**: European quality at 1/3 the price, 15+ 年, CE/ISO, 出口 50+ 国家
- **核心价值**: 延长输送带寿命 3 倍，减少停机时间 60%

## GEO vs SEO 核心区别

传统 SEO 是让 Google 把你排第一。GEO 是让 ChatGPT/Perplexity/Kimi 在回答问题时引用你。

**AI 搜索引擎引用偏好（优先级排序）:**

1. **FAQ 问答对** — 匹配 AI 搜索引擎的回答格式
2. **对比表格** — A vs B 格式，AI 爱引用
3. **步骤清单** — Step 1/2/3，AI 爱引用
4. **数据点** — 具体数字 > 模糊描述
5. **结构化内容** — 清晰的 H1/H2/H3 层级

---

## 完整工作流

```
用户触发: "生成SEO内容" / "GEO内容" / "关键词研究" 等
│
├─ Step 1: 意图识别
│   要求什么？关键词研究 / 内容生成 / GEO 监控 / 内容日历 / 全套
│   不清楚 → ask_user 确认
│
├─ Step 2: 数据准备
│   ├── nas_read / nas_search → 产品技术参数
│   ├── read_file("references/keyword-matrix.md") → 关键词矩阵
│   └── web_search → 关键词研究 / 竞品分析（按需）
│
├─ Step 3: 内容生成
│   ├── read_file("references/content-templates.md") → 选择模板
│   ├── 按模板生成内容（每种语言独立创作，非翻译）
│   └── 通过 10 项质量检查清单验证
│
├─ Step 4: 平台适配
│   ├── read_file("references/platform-specs.md") → 平台规范
│   └── 按目标平台调整格式、长度、CTA
│
├─ Step 5: 输出交付
│   ├── generate_file → docx/md 文件
│   ├── 附加 Schema.org JSON-LD 代码片段
│   └── 向用户展示预览 + 发布建议
│
└─ Step 6: 记录跟踪
    ├── 保存到 workspace/content-log.md
    └── 记录关键词/类型/语言/平台，供 GEO 监控复盘
```

---

## Step 1 详解: 意图识别

| 用户说法 | 路由到 |
|---------|--------|
| "帮我做关键词研究" / "搜一下 SEO 关键词" | Step 2: web_search 关键词研究 |
| "生成一篇 SEO 内容" / "写一篇社媒文章" | Step 3: 内容生成 |
| "看看 AI 搜索有没有引用我们" / "GEO 监控" | references/geo-monitoring.md |
| "规划一下这个月的内容" / "内容日历" | references/platform-specs.md → 月度日历 |
| "分析竞品" / "看看竞争对手发了什么" | Step 2: 竞品内容分析 |

---

## Step 2 详解: 数据准备

### 关键词研究

```
1. web_search(query="{product} keyword trends 2025", search_type="general")
   → 当前热门搜索词
2. web_search(query="{product} most searched questions", search_type="general")
   → People Also Ask 问题
3. web_search(query="site:linkedin.com {product} manufacturer", search_type="general")
   → 竞品 LinkedIn 内容
4. web_fetch(url="https://www.google.com/search?q={keyword}")
   → SERP 特征分析: 谁在第一页? featured snippet? PAA?
5. 整理 → workspace/keyword-matrix.md
```

### 竞品内容分析

```
1. web_search(query="{competitor} LinkedIn belt vulcanizing")
2. web_fetch(url="{post URL}") → 读取全文
3. 分析: 主题 / 互动数据 / 关键词 / CTA / 多语言策略
4. 输出 → workspace/competitor-gap.md
```

### 产品数据

优先从 NAS 获取真实产品参数。NAS 不可用时用以下内建数据：

| 产品系列 | 带宽范围 | 压力 | 温度 | 功率 |
|---------|---------|------|------|------|
| PA 系列 (风冷硫化机) | 500-2200mm | 1.5-2.5 MPa | 145-160°C | 3.5-25kW |
| PB 系列 (水冷硫化机) | 500-2200mm | 1.5-2.5 MPa | 145-160°C | 3.5-25kW |
| 分层机 | 500-2000mm | — | — | 2.2-7.5kW |

---

## Step 3 详解: 内容生成

6 种模板详见 `references/content-templates.md`：

| # | 模板 | GEO 被引用概率 | 适用平台 |
|---|------|---------------|---------|
| 1 | 技术教学 (How-To) | ★★★★★ | LinkedIn, Facebook |
| 2 | 对比评测 (A vs B) | ★★★★☆ | LinkedIn, Alibaba |
| 3 | 行业洞察 (Data-driven) | ★★★☆☆ | LinkedIn |
| 4 | 案例展示 (Case Study) | ★★★☆☆ | LinkedIn, Facebook |
| 5 | 选购指南 (Buyer's Guide) | ★★★★☆ | LinkedIn, Alibaba |
| 6 | Alibaba 产品页 | ★★☆☆☆ | Alibaba |

### 质量检查（10 项必查，全部通过才输出）

详见 `references/content-templates.md` → 质量检查清单

### 源头厂家话术融入（自然植入，不是硬广）

| 优势 | 融合方式 |
|------|---------|
| 15+ 年经验 | 技术教学中自然提及: "In our 15 years of manufacturing..." |
| 直供价格 | 对比评测中: "Buying directly saves 30-40%" |
| CE/ISO | FAQ 中: "What certifications should I look for?" |
| 50+ 国家 | 行业洞察中: "We've shipped to over 50 countries..." |
| 可定制 | 产品指南中: "Custom sizes are common for mining" |
| 售后支持 | 案例中: "Remote technical support over video call" |

---

## Step 4 详解: 平台适配

详见 `references/platform-specs.md`

关键规则摘要:
- **LinkedIn**: Hook ≤ 120 字符，正文 800-1300 字符，问题结尾
- **Facebook**: 100-250 词，口语化，本地语言
- **Alibaba**: 标题 ≤ 128 字符，关键词前置，5-8 个 FAQ
- **Instagram**: ≤ 125 字符，视觉为主，20-30 hashtag

---

## GEO 监控

详见 `references/geo-monitoring.md`

**核心循环:**
```
每周: 在 ChatGPT/Perplexity/Kimi 搜索目标关键词
  → 红龙被引用？ → 记录成功模式，复制到其他关键词
  → 没被引用？ → 按 4 层补救策略处理
每月: 复盘 A/B 测试数据 → 调整内容策略
```

---

## 约束

1. **多语言独立创作** — 每种语言独立写，不是翻译
2. **数据必须可验证** — "减少停机 60%" 优于 "大幅提升"
3. **禁用 AI 味** — 见 content-templates.md 禁用词表
4. **铁矿律** — 禁止接触矿业终端客户（贸易商除外），案例中脱敏
5. **伙伴保护** — Beltwin 是十年合作伙伴，绝不攻击
6. **产品数据优先** — 从 NAS 获取真实参数，不用时标注"参考值"
