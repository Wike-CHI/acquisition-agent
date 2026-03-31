# 外部技能赋能分析

> 分析已安装但未被引用的技能，评估对获客流程的赋能潜力

---

## 📊 技能分类统计

| 类别 | 数量 | 说明 |
|------|------|------|
| 总安装技能 | 102 个 | - |
| 已引用技能 | 9 个 | 获客核心技能 |
| **可赋能获客** | **8 个** | 本文档重点 |
| 内部协作 | 5 个 | 日常办公 |
| 纯开发技能 | 80 个 | 与获客无关 |

---

## 🎯 可赋能获客的技能（8个）

### 1️⃣ tavily-search（高优先级）⭐⭐⭐⭐⭐

**功能**: LLM 优化的网页搜索，支持新闻、时间范围、域名过滤

**赋能点**:
| 获客环节 | 用途 |
|----------|------|
| 客户发现 | 搜索行业关键词，获取最新客户信息 |
| 竞品监控 | 搜索竞品动态、新产品发布 |
| 市场趋势 | 搜索行业新闻、市场报告 |
| 决策人定位 | 搜索 LinkedIn + 公司名 |

**优势 vs exa-search**:
| 指标 | tavily-search | exa-search |
|------|---------------|------------|
| 新闻搜索 | ✅ 支持 | ⚠️ 有限 |
| 时间范围 | ✅ 天/周/月 | ❌ 不支持 |
| 域名过滤 | ✅ 支持 | ✅ 支持 |
| 结果格式 | LLM 优化 | LLM 优化 |

**建议**: 与 `exa-search` 互补使用
- `exa-search` → 深度搜索、学术内容
- `tavily-search` → 新闻、实时信息

**集成命令**:
```bash
# 新闻搜索
tvly search "conveyor belt industry news" --topic news --time-range week

# 竞品监控
tvly search "Flexco new product" --topic news --time-range month

# 决策人搜索
tvly search "site:linkedin.com purchasing manager conveyor" --max-results 20
```

---

### 2️⃣ brave-web-search（中优先级）⭐⭐⭐⭐

**功能**: Brave 搜索 API，高质量搜索结果

**赋能点**:
| 获客环节 | 用途 |
|----------|------|
| 客户发现 | 补充搜索渠道 |
| 背调验证 | 验证公司信息 |
| 竞品分析 | 搜索竞品网站 |

**优势**:
- 独立搜索引擎，非 Google/Bing
- 支持 Goggles 自定义排名
- 支持新鲜度过滤

**建议**: 作为第三搜索渠道（exa → tavily → brave）

**集成命令**:
```bash
# 基础搜索
curl -s "https://api.search.brave.com/res/v1/web/search?q=conveyor+belt+manufacturer" \
  -H "X-Subscription-Token: ${BRAVE_SEARCH_API_KEY}"

# 新鲜度过滤
curl -s "https://api.search.brave.com/res/v1/web/search?q=conveyor+belt+news&freshness=pm"
```

---

### 3️⃣ article-writing（中优先级）⭐⭐⭐⭐

**功能**: 长篇内容写作，支持品牌风格匹配

**赋能点**:
| 获客环节 | 用途 |
|----------|------|
| 开发信润色 | 提升开发信质量和一致性 |
| 内容营销 | 撰写博客、案例研究 |
| 邮件序列 | 生成跟进邮件内容 |
| LinkedIn 文章 | 撰写思想领导力内容 |

**核心规则**:
1. 用具体例子开头，不是空话
2. 短句优于长句
3. 使用真实数据
4. 不虚构客户案例

**建议**: 用于开发信质量提升

**示例**:
```
用户: 润色这封开发信，匹配专业但不失亲和的风格

AI: [使用 article-writing 技能]
1. 分析原文风格
2. 提取品牌语调
3. 重写开发信
4. 检查禁用模式（"In today's rapidly evolving landscape"等）
```

---

### 4️⃣ content-engine（中优先级）⭐⭐⭐⭐

**功能**: 多平台内容适配，一次创作多平台发布

**赋能点**:
| 获客环节 | 用途 |
|----------|------|
| LinkedIn 内容 | 生成帖子、文章 |
| 邮件序列 | 生成跟进邮件 |
| 社媒营销 | X/TikTok/YouTube 内容 |
| 内容日历 | 规划发布节奏 |

**平台适配规则**:
| 平台 | 特点 |
|------|------|
| **X** | 快速开头，一帖一想法，少链接 |
| **LinkedIn** | 强首行，短段落，显式结论 |
| **TikTok** | 前3秒抓注意力，视觉导向 |
| **Newsletter** | 深度内容，可扫描结构 |

**建议**: 用于 LinkedIn 营销和邮件序列

**示例**:
```
用户: 把这篇产品介绍适配到 LinkedIn 和邮件

AI: [使用 content-engine 技能]
1. 提取核心信息
2. 生成 LinkedIn 版（强首行 + 短段落）
3. 生成邮件版（专业 + CTA）
```

---

### 5️⃣ email-skill（高优先级）⭐⭐⭐⭐⭐

**功能**: 邮件发送和管理，支持多邮箱

**赋能点**:
| 获客环节 | 用途 |
|----------|------|
| 开发信发送 | 自动化邮件发送 |
| 批量触达 | 批量发送开发信 |
| 跟进邮件 | 自动跟进序列 |

**已配置邮箱**:
| 邮箱 | SMTP | 状态 |
|------|------|------|
| 163邮箱 | smtp.163.com:465 | ✅ 已配置 |

**建议**: 替代 `projects/email-sender/send_email.py`

**集成方式**:
```python
# 直接使用 email-skill
from email_skill import send_email

send_email(
    to="customer@company.com",
    subject="Conveyor Belt Equipment Inquiry",
    body=email_content,
    smtp_server="smtp.163.com",
    port=465,
    username="your@email.com",         # 填写你的发件邮箱
    password="YOUR_SMTP_AUTH_CODE"     # 填写邮箱授权码（非登录密码）
)
```

---

### 6️⃣ videodb + video-editing（低优先级）⭐⭐⭐

**功能**: 视频理解、编辑、生成

**赋能点**:
| 获客环节 | 用途 |
|----------|------|
| 产品演示 | 生成产品演示视频 |
| 客户案例 | 剪辑客户案例视频 |
| 培训视频 | 制作操作教程 |
| 展会记录 | 记录展会现场 |

**建议**: 长期规划，用于内容营销

**流程**:
```
原始素材 → AI 剪辑 → 多平台适配
    ↓           ↓           ↓
  屏幕录制    FFmpeg      TikTok/YouTube
  客户访谈    Remotion    LinkedIn
  展会视频    ElevenLabs  微信视频号
```

---

### 7️⃣ database-migrations（不推荐）❌

**功能**: 数据库迁移

**评估**: 与获客无关，属于开发工具

---

## 📋 内部协作技能（5个）

| 技能 | 功能 | 获客用途 |
|------|------|----------|
| `daily-report` | 日报生成 | ✅ Pipeline 日报 |
| `planning-with-files` | 文件规划 | ⚠️ 间接 |
| `calendar-skill` | 日历管理 | ⚠️ 间接 |
| `notion-skill` | Notion 集成 | ⚠️ 间接 |
| `memos-memory-guide` | 记忆管理 | ⚠️ 间接 |

**建议**: 集成 `daily-report` 到 HEARTBEAT 日报

---

## 🚀 集成建议

### 优先级排序

| 优先级 | 技能 | 集成点 | 预期效果 |
|--------|------|--------|----------|
| **P0** | `email-skill` | 邮件发送 | 统一发送接口 |
| **P1** | `tavily-search` | 客户发现 + 竞品监控 | +30% 搜索质量 |
| **P2** | `article-writing` | 开发信润色 | +20% 回复率 |
| **P2** | `content-engine` | LinkedIn + 邮件序列 | +25% 内容效率 |
| **P3** | `brave-web-search` | 补充搜索 | +10% 覆盖率 |
| **P4** | `videodb` | 内容营销 | 长期规划 |
| **P4** | `video-editing` | 内容营销 | 长期规划 |

---

## 📝 更新 SKILL.md

### 新增依赖技能

```yaml
skills:
  # 核心技能（已安装）
  - company-background-check
  - market-research
  - cold-email-generator
  
  # 搜索发现
  - exa-search
  - search-first
  - tavily-search        # 新增
  - brave-web-search     # 新增
  
  # 深度调研
  - deep-research
  
  # 浏览器自动化
  - scrapling
  - agent-browser
  
  # 数据抓取
  - data-scraper-agent
  
  # 内容生成
  - article-writing      # 新增
  - content-engine       # 新增
  
  # 邮件发送
  - email-skill          # 新增
```

---

## 📈 预期效果

| 指标 | 当前 | 集成后 | 提升 |
|------|------|--------|------|
| **搜索渠道** | 2 个 | 4 个 | +100% |
| **内容质量** | 中 | 高 | +30% |
| **邮件效率** | 手动 | 自动 | +50% |
| **LinkedIn 覆盖** | 无 | 有 | 新增 |
| **视频营销** | 无 | 有 | 新增 |

---

## ⚠️ 注意事项

### 移除的技能

| 技能 | 原因 | 替代方案 |
|------|------|----------|
| `database-migrations` | 与获客无关 | 不集成 |

### 需要配置的 API

| 技能 | API | 获取方式 |
|------|-----|----------|
| `tavily-search` | Tavily API Key | https://tavily.com |
| `brave-web-search` | Brave Search API Key | https://api.search.brave.com |
| `videodb` | VideoDB API Key | https://videodb.io |

---

## 🔄 集成后的获客流程

```
┌─────────────────────────────────────────────────────────────┐
│  引导式获客流程（技能增强后）                                │
├─────────────────────────────────────────────────────────────┤
│  0. 智能路由 → search-first 优化搜索策略                    │
│                                                             │
│  1. 客户发现 → exa-search / tavily-search / data-scraper    │
│     ├── Exa: 深度搜索、学术内容                             │
│     ├── Tavily: 新闻、实时信息 ⭐ 新增                      │
│     └── Brave: 补充搜索 ⭐ 新增                             │
│                                                             │
│  2. 客户查重 → ContextManager 内置                          │
│                                                             │
│  3. 企业背调 → deep-research + company-background-check     │
│                                                             │
│  4. LinkedIn 决策人 → agent-browser                         │
│                                                             │
│  5. 竞品分析 → scrapling + tavily-search ⭐ 新增            │
│                                                             │
│  6. 开发信生成 → cold-email-generator                       │
│     └── 润色 → article-writing ⭐ 新增                      │
│                                                             │
│  7. 邮件发送 → email-skill ⭐ 新增                          │
│                                                             │
│  8. 跟进管理 → HEARTBEAT + content-engine ⭐ 新增           │
│     └── 内容生成 → content-engine                          │
│                                                             │
│  9. 日报生成 → daily-report ⭐ 新增                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 更新日志

### 2026-03-27 外部技能分析

- ✅ 分析 8 个可赋能获客的技能
- ✅ 评估每个技能的赋能潜力
- ✅ 制定集成优先级
- ✅ 规划更新 SKILL.md
- ⏳ 待执行：更新 SKILL.md
- ⏳ 待执行：测试新技能集成

---

_更新时间: 2026-03-27 17:10_
