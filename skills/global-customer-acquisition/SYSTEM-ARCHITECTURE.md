# 红龙获客系统 - 完整架构报告

**生成时间**: 2026-03-28 14:45
**位置**: `~/.openclaw/workspace/skills/`

---

## 📊 总体架构

### 技能总数：**97个**

**分类**:

| 分类 | 数量 | 示例 |
|------|------|------|
| **获客核心** | 6 | global-customer-acquisition, acquisition-coordinator, acquisition-init, acquisition-workflow, customer-intelligence, customer-deduplication |
| **LinkedIn & 邮件** | 6 | linkedin, linkedin-writer, email-outreach-ops, email-sender, email-marketing, cold-email-generator |
| **社交媒体** | 2 | facebook-acquisition, instagram-acquisition |
| **企业研究** | 3 | company-research, market-research, marketing-strategy-pmm |
| **工具支持** | 8 | browser-automation, playwright, crm, multi-search-engine, sales-pipeline-tracker, mcporter, teyi-customs, nas-file-reader |
| **内容处理** | 5 | document-pro, excel-xlsx, pdf-extract, pdf-smart-tool-cn, pptx |
| **记忆 & 报告** | 6 | memory, elite-longterm-memory, humanoid-memory, smart-memory, daily-report-writer, openclaw-memory |
| **红龙专用** | 2 | honglong-products, honglong-assistant |
| **开发工具** | 6 | acp, claude-code, agentic-coding, skill-developer, skill-creator, gitai-skill |
| **其他支持** | 53 | autoresearch, business-development, cicd-pipeline, credential-manager, delivery-queue, elevenlabs, release-manager, sdr-humanizer, self-improving-agent, web-pilot, 等等... |

---

## 🎯 主技能：global-customer-acquisition

**文件数**: 21个文件 + 6个目录

**大小**: 394.2 KB

---

## 🔄 获客流程：8步

```
┌─────────────────────────────────────────────────────────────┐
│  引导式获客流程（增强版）                                   │
├─────────────────────────────────────────────────────────────┤
│  0. 智能路由 → 自动选择最佳渠道 ⭐ (模式四)                 │
│     ├── 判断：国内/海外、需要采购记录/决策人/背调          │
│     └── 选择：微博/特易/LinkedIn/Exa/Jina                 │
│                                                             │
│  1. 客户发现 → 使用选定的渠道                               │
│     ├── ✅ 验证：至少1个客户 + 信息完整                    │
│     └── ❌ 失败 → 回退方案A (尝试其他渠道/关键词)          │
│                                                             │
│  2. 客户查重 → 防止重复开发                                 │
│     ├── ✅ 无重复 → 继续                                    │
│     ├── ⚠️ 有重复 → 合并记录                               │
│     └── ❌ 错误 → 回退方案B (跳过查重，标记)               │
│                                                             │
│  3. 企业背调 → ICP评分                                      │
│     ├── ✅ 验证：至少3个维度 + 评分完成                    │
│     ├── ⚠️ 信息不足 → 标记"待补充"                        │
│     └── ❌ 失败 → 回退方案C (初步评分 + 人工补充)          │
│                                                             │
│  4. LinkedIn 决策人 → 定位联系人                            │
│     ├── ✅ 找到 → 生成决策人报告                           │
│     ├── ⚠️ 未找到 → 标记"需人工查找"                      │
│     └── ❌ 渠道不可用 → 回退方案D (Exa索引)                │
│                                                             │
│  5. 竞品分析 → 识别竞争对手                                 │
│     ├── 从海关数据提取供应商                               │
│     └── 生成差异化销售话术                                 │
│                                                             │
│  6. 开发信生成 → 反复打磨 ⭐ (模式三)                       │
│     ├── 生成初稿                                           │
│     ├── 自动检查（AI感/个性化/专业性/语法/CTA）           │
│     ├── 不合格 → 自动修改（最多3轮）                       │
│     └── ✅ 验证：评分 >= 7.0                               │
│                                                             │
│  7. 邮件发送 → 记录触达                                     │
│     ├── ✅ 成功 → 进入跟进流程                             │
│     ├── ⚠️ 邮箱无效 → 尝试其他邮箱                        │
│     └── ❌ 发送失败 → 回退方案E (自动重试队列)             │
│                                                             │
│  8. 跟进管理 → 自动化跟进                                   │
│     └── HEARTBEAT 自动检查跟进时间点                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 6大核心功能模块

| # | 模块 | 文档 | 对应模式 | 功能 |
|---|------|------|----------|------|
| 1 | **智能路由** | CHANNEL-ROUTER.md | 模式四 | 自动选择最佳获客渠道 |
| 2 | **反复打磨** | EMAIL-QUALITY-CHECK.md | 模式三 | 开发信自动检查3轮 |
| 3 | **回退方案** | FALLBACK-PLAN.md | 模式一 | 每步失败后自动处理 |
| 4 | **竞品分析** | COMPETITOR-ANALYSIS-GUIDE.md | 模式五 | 自动识别竞争对手 |
| 5 | **LinkedIn决策人** | LINKEDIN-DECISION-MAKER-GUIDE.md | 模式二 | 精准定位决策人 |
| 6 | **自进化系统** | SELF-EVOLUTION-SYSTEM.md | 全模式 | 持续学习用户反馈 |

---

## 📦 依赖技能：12个

```
1. multi-search-engine      (多引擎搜索)
2. playwright              (浏览器自动化)
3. company-background-check (企业背调)
4. company-research        (企业研究)
5. market-research         (市场调研)
6. email-outreach-ops      (邮件触达)
7. marketing-strategy-pmm  (营销策略)
8. linkedin-writer         (LinkedIn内容)
9. browser-automation      (浏览器自动化)
10. sales-pipeline-tracker (销售管道)
11. crm                    (客户管理)
12. cold-email-generator   (冷邮件生成)
```

---

## 🛠️ 可用渠道：9个

| 渠道 | 状态 | 用途 | 优先级 |
|------|------|------|--------|
| **微博** | ✅ | 国内客户 | ⭐⭐⭐⭐⭐ |
| **Exa** | ✅ | 海外搜索 | ⭐⭐⭐⭐⭐ |
| **LinkedIn MCP** | ⚠️ | 决策人（需启动） | ⭐⭐⭐⭐⭐ |
| **特易海关** | ✅ | 采购记录 | ⭐⭐⭐⭐⭐ |
| **Jina Reader** | ✅ | 企业背调 | ⭐⭐⭐⭐ |
| **微信公众号** | ✅ | 国内内容 | ⭐⭐⭐⭐ |
| **V2EX** | ✅ | 技术客户 | ⭐⭐⭐ |
| **RSS** | ✅ | 内容聚合 | ⭐⭐⭐ |
| **抖音** | ⚠️ | 视频营销（需启动） | ⭐⭐⭐ |

---

## 📁 目录结构

```
~/.openclaw/workspace/skills/global-customer-acquisition/
├── 📄 SKILL.md                (79 KB) - 主技能文件
├── 📄 AGENTS.md               (8.9 KB) - 产品知识
├── 📄 ENHANCEMENT.md          (11.5 KB) - 增强功能
├── 📄 CHANNEL-ROUTER.md       (10 KB) - 智能路由
├── 📄 EMAIL-QUALITY-CHECK.md  (9 KB) - 邮件质量检查
├── 📄 FALLBACK-PLAN.md        (11.5 KB) - 回退方案
├── 📄 COMPETITOR-ANALYSIS-GUIDE.md (9 KB) - 竞品分析
├── 📄 LINKEDIN-DECISION-MAKER-GUIDE.md (5 KB) - LinkedIn决策人
├── 📄 SELF-EVOLUTION-SYSTEM.md (16 KB) - 自进化系统
├── 📄 AGENT-REACH-INTEGRATION.md (10 KB) - Agent Reach集成
├── 📄 integrations.md         (3 KB) - 集成文档
├── 📄 FILE-LIST.md            (5.8 KB) - 文件清单
├── 📄 README.md               (10 KB) - 项目说明
├── 📄 INSTALL.md              (6.5 KB) - 安装指南
├── 📄 QUICK-START.md          (2.7 KB) - 快速开始
├── 📁 config/                 - 配置文件
│   └── mcporter.json          (301 B)
├── 📁 data/                   - 数据文件
│   └── sample-customers.md    (2.3 KB)
├── 📁 dependencies/           - 依赖说明
│   └── README.md              (4.6 KB)
├── 📁 scripts/                - 脚本文件
│   ├── init.ps1               (5 KB)
│   ├── start-services.ps1     (4 KB)
│   ├── stop-services.ps1      (2 KB)
│   └── test.ps1               (2.7 KB)
└── 📁 templates/              - 模板文件
    ├── email-templates.md     (1.5 KB)
    ├── linkedin-decision-maker-report.md (6.7 KB)
    └── linkedin-templates.md  (1.2 KB)
```

---

## 🎯 核心设计模式

基于OpenClaw官方推荐的5种Skill设计模式：

| 模式 | 名称 | 应用 |
|------|------|------|
| **模式一** | 引导式流程 | 8步获客流程，每步有验证和回退 |
| **模式二** | 决策者定位 | LinkedIn多角度搜索，优先级排序 |
| **模式三** | 反复打磨 | 开发信自动检查3轮，评分>=7.0 |
| **模式四** | 智能路由 | 自动选择最佳获客渠道 |
| **模式五** | 竞品分析 | 从海关数据提取供应商，生成差异化话术 |

---

## 📊 统计总览

| 项目 | 数量 |
|------|------|
| **总技能数** | 97个 |
| **主技能文件** | 21个 |
| **获客流程** | 8步 |
| **核心功能** | 6大模块 |
| **依赖技能** | 12个 |
| **可用渠道** | 9个 |
| **模板文件** | 3个 |
| **脚本文件** | 4个 |
| **总大小** | 394.2 KB |

---

## 🚀 快速使用

### 一键获客
```
帮我找10个美国的工业皮带分销商并发开发信
```

### 海关数据
```
从海关数据查秘鲁的输送带采购商
```

### LinkedIn
```
在LinkedIn上搜索德国的皮带经销商
```

### 企业背调
```
背调这家公司: ABC Industrial
```

### 发开发信
```
给这5个客户发开发信
```

---

## 📞 系统管理

| 指令 | 功能 |
|------|------|
| `初始化获客系统` | 首次配置 |
| `检查获客系统状态` | 查看状态 |
| `配置所有账号` | 配置凭据 |
| `获客系统帮助` | 查看帮助 |

---

_生成时间: 2026-03-28 14:45_
_版本: v1.3.0_
_位置: ~/.openclaw/workspace/skills/_
