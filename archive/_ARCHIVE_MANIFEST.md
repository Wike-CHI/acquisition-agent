# 归档清单

> 创建日期：2026-05-29
> 归档操作者：HOLO Agent 自主维护
> 本批次：17 个技能从 skills/ 移至 archive/

---

## 归档批次：2026-05-29 非核心渠道/冗余工具技能归档

### 背景

holo-desktop 运行时的渠道功能已通过 TypeScript 工具实现，不再需要独立的 SKILL.md 技能文件管理各渠道的获客操作。同时，部分通用工具技能与核心获客流程无关，且在 holo-desktop 中有更专业的替代方案。

---

### 归档技能列表

#### 一、社交媒体渠道技能（6 个）

这些技能针对特定社交平台的获客操作，功能已由 holo-desktop 的 TypeScript 工具实现。

| 技能 | 原因 |
|------|------|
| `instagram-acquisition` | Instagram 渠道获客，已由 holo-desktop TS 工具覆盖 |
| `facebook-acquisition` | Facebook 渠道获客，已由 holo-desktop TS 工具覆盖 |
| `telegram-toolkit` | Telegram 渠道获客，已由 holo-desktop TS 工具覆盖 |
| `ai-social-media-content` | 通用社媒内容生成，已由 holo-social-gen TS 工具链覆盖 |
| `social-publish` | 社媒自动发布，已由 holo-desktop TS 工具覆盖 |
| `social-content-review` | 社媒内容复盘，非核心获客流程 |

#### 二、冗余通用工具技能（7 个）

这些技能是通用工具类，与核心获客流程无直接关联，且多有更专业的替代方案。

| 技能 | 原因 |
|------|------|
| `calendar-skill` | 通用日历调度，非核心获客，holo-desktop 有独立调度系统 |
| `composio` | 第三方应用集成（Composio 平台），通用工具非获客专属 |
| `cli-anything-hub` | CLI 工具发现，通用工具，与获客无关 |
| `agent-reach-setup` | agent-reach 安装配置，一次性引导，不作为独立技能使用 |
| `data-automation-service` | 通用数据处理自动化，非获客专属 |
| `office` | 通用办公文档操作，过于宽泛，非获客专属 |
| `nano-pdf` | PDF 编辑，与 pdf-extract、pdf-smart-tool-cn 功能重叠 |

#### 三、冗余/重叠技能（4 个）

这些技能与保留的核心技能功能重叠，保留精简版本即可。

| 技能 | 原因 |
|------|------|
| `supermemory` | 与 humanoid-memory、smart-memory 功能重叠，3 套记忆系统减少至 2 套 |
| `evolver` | 元技能，与 skill-system-audit 等审计能力重叠 |
| `document-pro` | 与 pdf-extract、word-docx 等文档处理技能功能重叠 |
| `proactive-agent-lite` | 与 proactive-agent（完整版）功能重叠，轻量版冗余 |

---

### 归档后保留的技能

| 类别 | 技能 |
|------|------|
| 核心获客流程 | acquisition-coordinator, acquisition-workflow, acquisition-evaluator, acquisition-init, acquisition-dependencies, acquisition-development-notes |
| 客户调研与情报 | company-research, customer-intelligence, deep-research, five-step-bg-check, market-development-report, market-research, teyi-customs |
| 触达沟通 | cold-email-generator, email-sender, email-inbox, email-content-review, email-exhibition-invite, email-follow-up, email-product-recommendation, email-re-engagement, humanize-ai-text, inquiry-response, whatsapp-outreach, linkedin, linkedin-writer, sdr-humanizer, delivery-queue, follow-up-signal-monitor |
| 报价转化 | smart-quote, quotation-generator, holo-proposal-generator, sales-pipeline-tracker, sales-champion, sales, crm, customer-deduplication, fumamx-crm, fumamx-update, global-customer-acquisition, business-development, holo-sales-trainer, sdr-training-ground |
| 记忆知识 | humanoid-memory, smart-memory, knowledge-base, graphify, nas-file-reader |
| HOLO 特定 | honglong-products, honglong-assistant, holo-social-gen, holo-social-image, holo-social-infographic, holo-heartbeat-executor, holo-activity-log, holo-updater, geo-content-gen |
| 系统元技能 | skill-auditor, skill-creator, skill-discovery, skill-finder-cn, skill-system-audit, skill-onboarding-checklist, release-manager, credential-manager, routing-table-audit, bash-patch-safe, MCP管理器, config |
| 搜索浏览 | exa-web-search-free, web-access, web-content-fetcher, browser-automation, playwright |
| 文档处理 | pdf-extract, pdf-smart-tool-cn, excel-xlsx, excel-desktop, word-docx, chrome-desktop |
| 运营自动化 | proactive-agent, holo-heartbeat-executor, holo-activity-log, daily-report-writer, hot-monitor, routing-table-audit |

---

### 关联文件变更

| 文件 | 操作 |
|------|------|
| `skills/catalog.json` | 移除 17 个已归档技能的条目 |
| `skills/_index.md` | 移除 social-publish, document-pro, nano-pdf, office, supermemory, agent-reach-setup 引用 |
| `skills/_index-discovery.md` | 移除 facebook-acquisition, instagram-acquisition 引用 |
| `skills/_index-outreach.md` | 移除 telegram-toolkit 引用 |
| `skills/_index-intelligence.md` | 移除 supermemory 引用 |
| `skills/_index-meta.md` | 移除 evolver, agent-reach-setup, cli-anything-hub 引用 |
| `skills/_index-operations.md` | 移除 proactive-agent-lite, calendar-skill, data-automation-service, composio 引用 |
