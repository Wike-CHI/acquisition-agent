# 红龙获客系统技能集群审查报告

> 审查时间：2026-04-09  
> 审查范围：87 个有效技能（含 SKILL.md）  
> 仓库版本：Wike-CHI/acquisition-agent main 分支

---

## 一、总览

| 指标 | 数值 |
|------|------|
| 审查技能总数 | 87 |
| 有 skill.yaml | ~12 |
| 缺少 skill.yaml | ~75 |
| 发现 ERROR | 42 |
| 发现 WARN | 35 |
| 发现 INFO | 若干 |

---

## 二、ERROR 级问题（必须修复）

### 2.1 安全问题

| # | 技能 | 问题 |
|---|------|------|
| 1 | global-customer-acquisition | NAS 凭据明文泄露：`用户: HOLO / 密码: Hl88889999`（dependencies/README.md） |

### 2.2 版本号不一致

| # | 技能 | 详情 |
|---|------|------|
| 2 | global-customer-acquisition | frontmatter 3.0.0 / 正文标题 v2.8.0 / 文末 v3.0.0 |
| 3 | understand-honglong-acquisition | frontmatter 3.3.0 / skill.yaml 3.2.0 / 正文 v3.2.0 |
| 4 | acquisition-coordinator | frontmatter 2.1.0 / 文末 2.0.0 |
| 5 | acquisition-init | frontmatter 1.0.0 / 文末 1.1.0 |
| 6 | acquisition-workflow | frontmatter 2.1.0 / 文末 2.0.0 |
| 7 | teyi-customs | frontmatter 2.1.0 / 正文 v2.2.0 |
| 8 | market-research | frontmatter `1.0.1-honglong-override` / skill.yaml `1.0.1` |
| 9 | in-depth-research | frontmatter `1.0.0-honglong-override` / skill.yaml `1.0.0` |
| 10 | honglong-assistant | frontmatter 2.0.0 / skill.yaml 2.0.1 / 正文 2.0.1 |
| 11 | pdf-smart-tool-cn | frontmatter 1.1.0 / 正文 v2.1 |
| 12 | skill-finder-cn | frontmatter 无 version / 正文 v1.0.1 |

### 2.3 name 与目录名不一致

| # | 技能目录 | frontmatter name |
|---|----------|-----------------|
| 13 | global-customer-acquisition | HOLO-AGENT |
| 14 | email-marketing | Email Marketing |
| 15 | linkedin-writer | LinkedIn Writer |
| 16 | WhatsApp | wacli |
| 17 | sales-pipeline-tracker | Sales Pipeline Tracker |
| 18 | crm | CRM |
| 19 | office | Office |
| 20 | excel-xlsx | Excel / XLSX |
| 21 | browser-automation | browser-use |
| 22 | playwright | playwright-automation |
| 23 | 内容分发 | content-repurposer |

### 2.4 缺少必填字段

**缺少 version：**
| # | 技能 |
|---|------|
| 24 | scrape |
| 25 | multi-search-engine |
| 26 | web-content-fetcher |
| 27 | gog |
| 28 | agentmail |
| 29 | WhatsApp |
| 30 | humanize-ai-text |
| 31 | smart-quote |
| 32 | daily-report-writer |
| 33 | office |
| 34 | nano-pdf |
| 35 | pdf-extract |
| 36 | desktop-control |
| 37 | data-automation-service |

**缺少 triggers：**
| # | 技能 |
|---|------|
| 38 | scrape, scrapling, exa-web-search-free, multi-search-engine, web-content-fetcher, gog, agentmail, WhatsApp, humanize-ai-text, smart-quote, daily-report-writer, office, nano-pdf, pdf-extract, sales-pipeline-tracker, crm, sales, autoresearch, skill-finder-cn, desktop-control |

### 2.5 引用不存在的文件/技能

| # | 技能 | 引用目标 | 状态 |
|---|------|----------|------|
| 39 | understand-honglong-acquisition | references/IRON-RULES.md | 文件在本技能下不存在 |
| 40 | multi-search-engine | references/advanced-search.md | 文件不存在 |
| 41 | market-research | 嵌入第二个 YAML frontmatter 块 | 解析异常 |
| 42 | in-depth-research | 嵌入第二个 YAML frontmatter 块 | 解析异常 |

### 2.6 重复技能

| # | 技能 A | 技能 B | 说明 |
|---|--------|--------|------|
| 43 | humanizer | 去AI味 | 同 name/version/正文，完全重复 |
| 44 | browser-automation | 浏览器自动化 | 同 name(browser-use)，内容重复 |
| 45 | deep-research | in-depth-research | deep-research 声明为 in-depth-research 的别名，但两者并存 |

### 2.7 硬编码路径

| # | 技能 | 路径 |
|---|------|------|
| 46 | linkedin | `C:/Users/Administrator/.workbuddy/sessions/` |
| 47 | chroma-memory | `C:/Users/Administrator/chromadb/honglong-acquisition` |
| 48 | supermemory | `C:/Users/Administrator/lancedb/honglong` |
| 49 | agent-reach-setup | `/home/pan/.openclaw/skills/` |

### 2.8 BOM 字符

| # | 技能 |
|---|------|
| 50 | linkedin |
| 51 | linkedin-writer |
| 52 | sales-pipeline-tracker |
| 53 | crm |
| 54 | scrapling |
| 55 | company-research |
| 56 | autoresearch |

---

## 三、WARN 级问题（建议修复）

| # | 类别 | 涉及技能 | 说明 |
|---|------|----------|------|
| 1 | skill.yaml 声明目录不存在 | coordinator, evaluator, init, workflow, understand | 声明 scripts/references/assets 但均不存在 |
| 2 | 无 skill.yaml | ~75个技能 | 大量技能缺少标准化的包管理元数据 |
| 3 | MCP 配置重复 | coordinator, workflow, global-customer-acquisition | 三处包含几乎相同的 MCP 配置教程 |
| 4 | Drip Campaign D3 节点矛盾 | workflow vs understand | workflow 写 LinkedIn 连接，understand 写 WhatsApp 跟进 |
| 5 | ICP 评分标准不一致 | global-customer-acquisition vs 其他技能 | C级: 45-59分 vs 30-49分 |
| 6 | 铁律数量矛盾 | global-customer-acquisition (3条) vs understand (8条) |
| 7 | exa-search vs exa-web-search-free | 职责边界不清，内容重叠 |
| 8 | 浏览器自动化三连 | browser-automation + 浏览器自动化 + playwright 功能重叠 |
| 9 | 技能发现四连 | skill-creator + skill-discovery + skill-finder-cn + find-skills 功能重叠 |
| 10 | proactive-agent 备份残留 | SKILL-v2.3-backup.md, SKILL-v3-draft.md 应清理 |
| 11 | acquisition-workflow | SKILL.md.backup 文件残留 |
| 12 | non-semver 版本号 | market-research (1.0.1-honglong-override), in-depth-research (1.0.0-honglong-override) |
| 13 | global-customer-acquisition references 冗余 | 已迁移到 workflow/references/ 但旧文件未删除 |
| 14 | acquisition-init Windows 强绑定 | 大量 PowerShell，缺少跨平台说明 |
| 15 | acquisition-init dependencies 未声明 | 依赖 credential-manager, nas-file-reader 但 skill.yaml dependencies 为空 |
| 16 | smart-memory 子目录命名混淆 | smart-memory-v25 vs 主版本 v2.0 |
| 17 | data-automation-service 无 frontmatter | 完全缺少 YAML 头部 |
| 18 | acquisition-evaluator 评分体系混用 | 10分制 vs 百分制混用 |

---

## 四、优先修复建议

### P0 - 立即修复（安全/数据完整性）
1. **删除 NAS 凭据** — global-customer-acquisition/dependencies/README.md 中的明文密码
2. **消除嵌入 frontmatter** — market-research 和 in-depth-research 的第二个 YAML 块

### P1 - 高优先级（功能正确性）
3. **统一版本号** — 12 个技能的版本号不一致，逐个对齐
4. **统一 name 与目录名** — 11 个技能的 name 字段应改为 kebab-case 并与目录名匹配
5. **补齐缺失字段** — 14 个缺 version，20 个缺 triggers
6. **消除 BOM** — 6 个文件含 BOM 字符
7. **删除重复技能** — humanizer=去AI味, browser-automation=浏览器自动化

### P2 - 中优先级（一致性/可维护性）
8. **消除硬编码路径** — 4 个技能含 Windows/Linux 绝对路径，改用环境变量
9. **统一评分标准** — ICP 评分、铁律数量、Drip Campaign 节点描述
10. **删除残留文件** — backup 文件、已迁移的 references
11. **补齐 skill.yaml** — 75 个技能缺少标准化元数据

### P3 - 低优先级（优化）
12. **合并重叠技能** — 浏览器自动化三选一、技能发现四选一、exa 搜索二选一
13. **消除 MCP 配置重复** — 抽取为共享文件
14. **跨平台兼容** — 为 PowerShell-only 脚本提供 Python/Bash 替代

---

*报告由 Hermes Agent 自动生成*
