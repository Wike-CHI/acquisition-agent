---
name: FBS-BookWriter 文档索引
description: FBS-BookWriter 完整文档导航与分类索引
last_updated: "2026-03-24"
---

# FBS-BookWriter 文档索引

> **索引范围**：`references/` 各子目录 + 根级规范文件 + 根目录 `SKILL.md`
> **文档与代码对照**：[`../05-ops/doc-code-consistency.md`](../05-ops/doc-code-consistency.md) · **增效落地**：[`../05-ops/efficiency-implementation.md`](../05-ops/efficiency-implementation.md) · 自检：`node scripts/audit-fbs-efficiency.mjs`
> **全局交付一致性**（含 **§4.1** 体验 / 防卡顿 / 防偷懒）：[`../05-ops/global-delivery-consistency.md`](../05-ops/global-delivery-consistency.md)

---

## 🤖 AI 与宿主：技能快速学习路径（优先入口）

> **适用**：用户说「读取你自己 skill 的文档」「先学习技能」「技能能力概览」「规范在哪」等。  
> **禁止**：无导航时随机只打开某一深章（如仅 `section-3-workflow`）代替对技能包的整体理解。  
> **写作者注意**：不必读「维护者专区」与发版类文档；边界说明见 [`user-vs-maintainer-scope.md`](../05-ops/user-vs-maintainer-scope.md)。

| 顺序 | 文档 | 目的 |
|------|------|------|
| 1 | [`SKILL.md`](../../SKILL.md)（**技能加载后的行为约定** + §0 总纲） | 触发词首响、身份自述、路径自认知 |
| 1b | [WorkBuddy × 本 Skill 全局洞察](../05-ops/workbuddy-skill-foundation.md) | **宿主优先**：官方用户旅程与本书工作流对齐；助手与朋友式终局验收 |
| 1c | [承诺×建议×代码（全局对照）](../05-ops/promise-code-user-alignment.md) | 文档承诺、用户建议、随包脚本 **一张表**；避免「读了规范以为全自动」 |
| 2 | 本页 **快速导航 → 核心规范** | 一次看清 P0 文件清单 |
| 3 | [工作流设计](./section-3-workflow.md)（**§3.0.55** 阶段顺序、**§3.0.5** 检索、**S2→S3 硬性门禁**） | 流程、门禁、大纲确认 |
| 4 | [联网检索策略](../05-ops/search-policy.json) | 阶段与每章最少检索次数 |
| 5 | 按需 | [质量检查](../02-quality/quality-check.md)、[引用格式](../02-quality/citation-format.md)、[跨章一致性](../02-quality/cross-chapter-consistency.md)、[指令系统](./section-nlu.md)、[策略矩阵](../04-business/strategy.md) |
| — | 维护/上架前 | 运行 `node scripts/audit-skill-consistency.mjs`（技能根目录）；见 [Canonical 路径](../05-ops/canonical-paths.md) |

---

## 🚀 产品化双路线（P0 快速入口）

> 用于销售、交付、运营快速定位；默认控制阅读深度，减少首轮 token 消耗。

| 路线 | 最短阅读路径（建议） | 输出建议（防卡顿） |
|------|-----------------------|--------------------|
| Route-E 企业高附加值 | [总蓝图](../05-ops/productization-blueprint.md) → [定价包](../05-ops/pricing-packages.md) → [KPI 字典](../05-ops/kpi-dictionary.md) | 先给里程碑与风险，再展开细节 |
| Route-G 增长规模 | [90天计划](../05-ops/go-to-market-90d.md) → [定价包](../05-ops/pricing-packages.md) → [KPI 字典](../05-ops/kpi-dictionary.md) | 先给周计划与指标，再展开动作 |

补充：

- 对外统一口径模板见 [external-visible-release-template.md](../05-ops/external-visible-release-template.md)。
- 发布前一键检查：`.\scripts\prepublish-workbuddy-skill.ps1`。

---

## 📋 快速导航

### 🔴 核心规范文档（必读）

| 文档 | 主题 | 用途 | 优先级 |
|------|------|------|--------|
| [SKILL.md](../../SKILL.md) | FBS-BookWriter 完整规范 | 总纲和核心定义 | **P0** |
| [质量检查体系](../02-quality/quality-check.md) | 四层检查单 + 评分公式 | 质量标准参考 | **P0** |
| [引用格式](../02-quality/citation-format.md) | A/B/C 标注与并行写作约定 | 多 Writer 统一引用 | **P0** |
| [跨章一致性](../02-quality/cross-chapter-consistency.md) | 全书 **CX** 审查清单 | 多路并行合稿 | **P0** |
| [Book Auditor 模板](../03-product/book-auditor-prompt.md) | CX 审校提示词（可复制） | 多路并行 | **P0** |
| [架构模式说明](../05-ops/architecture-modes.md) | 单智能体 vs 多成员并行边界 | 主编 / 集成 | **P1** |
| [产品框架](../03-product/05-product-framework.md) | 产品定位与质量门禁 | 战略决策依据 | **P0** |
| [工作流设计](./section-3-workflow.md) | 七阶段执行流程 | 项目管理规范 | **P0** |
| [技术实现](./section-6-tech.md) | MCP评估 + 心跳协议 + 变现执行 | 技术方案参考 | **P0** |
| [WorkBuddy × 本 Skill（全局洞察）](../05-ops/workbuddy-skill-foundation.md) | 官方用户旅程 × S0–S6；Skill 在任务中的位置；助手与朋友 | WorkBuddy 用户入手必读 | **P0** |
| [多智能体委派话术](./workbuddy-agent-briefings.md) | S3/S5 自然语言模板（WorkBuddy 等） | 宿主侧并行审查 | **P0** |
| [Coordinator / Arbiter 话术](./coordinator-arbiter-briefs.md) | 调度门禁与冲突仲裁（文档级角色，测试报告 07·10） | team-lead | **P1** |
| [联网检索策略](../05-ops/search-policy.json) | 强制检索阶段与每章次数 | 质量门禁配置 | **P0** |
| [主题一致性门禁](../05-ops/topic-consistency-gate.md) | 防上下文跳变；与 `topicLock`、C0-4、NLU 对齐 | 长会话 / 多书并行 | **P0** |
| [WorkBuddy 用户记忆策略](../05-ops/workbuddy-user-memory-strategy.md) | 记忆演进下的 opt-in 摄取、CLI、与主题锁关系 | WorkBuddy 深度用户 / 集成 | **P1** |
| [首次使用与环境迭代（分级策略）](../05-ops/workbuddy-first-use-environment-tiered-strategy.md) | 冷启动 + 环境指纹（**v1.18.5 已落地** Tier 0–2） | 产品 / 集成 / 主编 | **P1** |
| 环境指纹 CLI | `integration/workbuddy-environment-snapshot.mjs`（`search-policy` **environmentSnapshot**） | 宿主升级 / 路径变化后 | **P1** |
| [多路审计·隐私·竞争力](../05-ops/multi-agent-audit-privacy-competitiveness.md) | 五路并行审计框架、扫描结论、**待批代码项** | 发版前 / 主编验收 | **P1** |
| [承诺×建议×代码（全局对照）](../05-ops/promise-code-user-alignment.md) | 文档承诺、用户建议、代码落实一张表；最小可行清单 | 用户/交付/集成 **入手必读** | **P0** |
| [文档与代码对照](../05-ops/doc-code-consistency.md) | 规范声称 vs 仓库可执行代码；含多智能体/联网/记忆 **triage** | 上架与集成前必读 | **P0** |
| [一致性洞察归档](../05-ops/consistency-insights.md) | 实录偏差与整改项；`integration/*.mjs` 对照 | 质量复盘 / 宿主钩子设计 | **P1** |
| [CodeBuddy 上架交付](../05-ops/codebuddy-skill-delivery.md) | 目录结构、Frontmatter、打包 zip | CodeBuddy 发布前必读 | **P0** |
| [Skill 创建工具产品设计](../05-ops/skill-creation-tool-product-design.md) | 宿主无关内核 + 能力探测 + 向导/规则引擎 | 平台/工具链规划参考 | **P2** |
| [可见性边界与防泄露](../05-ops/visibility-boundary.md) | 公开/内部边界与阻断规则 | 发布前必读 | **P0** |
| [品牌克制露出](../05-ops/brand-outputs.md) | 版权页/页脚等品牌露出约束 | 对外发布必读 | **P1** |
| [全局交付一致性](../05-ops/global-delivery-consistency.md) | 术语、链接、触发词、交付边界 | 发布前交叉校验 | **P0** |
| [规范同步检查表](../05-ops/spec-sync-checklist.md) | 改子规范时必勾同步项 | 防 SKILL 与子文档漂移 | **P0** |
| [国家标准与编校清单](../05-ops/national-standards-editorial-checklist.md) | CY/T 266、GB/T 15834/35、7714 与代码落地审计 | Proofer / 上架承诺「编校合格」前 | **P1** |
| [Canonical 路径索引](../05-ops/canonical-paths.md) | 根级 stub ↔ 权威文件 | 维护、上架前路径核对 | **P0** |
| [Task 角色别名表](./task-role-alias.md) | Critic-* / Researcher 与用户话术 | 多智能体编排对齐 | **P1** |
| [禁用词维护流程](../02-quality/forbidden-words-maintenance.md) | 按季/发版更新词表 | 去 AI 味可持续 | **P1** |
| [FBS-QualityChecker 拆分规格](../05-ops/FBS-QualityChecker-skill-spec.md) | 可选独立质检 Skill | 复用质量模块 | **P2** |
| [记忆与本书项目（CodeBuddy）](../05-ops/codebuddy-memory-workbuddy-integration.md) | `CODEBUDDY.md`、条件规则、按需 `@` | 降 token、与 Skill 协同 | **P1** |

---

### 🟠 质量体系文档（检查与评分）

| 文档 | 内容 | 何时使用 | 相关章节 |
|------|------|---------|---------|
| [质量检查](../02-quality/quality-check.md) | S/P/C/B/V1 检查单 + **C0 全书门禁** + 评分公式 | 全阶段 / **S5 终稿前** | §1-§4、C0 |
| [全书级一致性](../02-quality/book-level-consistency.md) | 破折号全书总账、术语表、Writer↔S6 闭环 | **合稿 / 多路并行汇编 / S5** | C0-1—C0-3 |
| [S层规则](../02-quality/quality-S.md) | 句级自扫描规则（6条） | S3阶段 Critic-S任务 | 6条规则 |
| [P/C/B层规则](../02-quality/quality-PLC.md) | 段级(4条) + 章级(4条) + 篇级(5条) | S3阶段 Critic-L1/L2/L3 | §P §C §B |
| [指标体系](../02-quality/metrics.md) | 20分模型 → 10分折算 + 指标追踪 | 评分计算时 | 7个维度 |
| [L3语义接口](../02-quality/L3-semantic-interface.md) | B2B语义相关性评分规范 | 企业对接场景 | 接口标准 |

---

### 🟡 执行流程文档（工作规范）

| 文档 | 主题 | 适用阶段 | 关键内容 |
|------|------|---------|----------|
| [工作流设计](./section-3-workflow.md) | S0前置调研 + 七阶段流程 | 全流程 | S1-S6执行步骤 |
| [策略矩阵](../04-business/strategy.md) | 联网搜索策略 + 运行经验 | S1阶段 + 全流程 | 三大铁律 |
| [前置调研](../05-ops/S0-research-module.md) | S0调研模块设计 | S0阶段 | 需求分析 |
| [指令系统](./section-nlu.md) | 核心意图 + 64 条短指令分类 | 任意阶段 | 指令参考 |
| [心跳协议](../05-ops/heartbeat-protocol.md) | Task心跳 + 阶段播报 | 全流程监控 | 心跳机制 |

---

### 🟢 产品与交付文档（用户侧）

| 文档 | 主题 | 文档类型 | 面向对象 |
|------|------|---------|----------|
| [UX设计](../03-product/07-ux-design.md) | 等待体验 + 透明度设计 | 用户体验 | 产品团队 |
| [交付体系](../05-ops/delivery.md) | 一键导出 + 4种交付选项 | 产品功能 | 最终用户 |
| [交付指南](../05-ops/delivery-guide.md) | 从MD/HTML到多格式输出 | 用户指南 | 最终用户 |
| [用户安装指南](../03-product/01-user-install-guide.md) | npm包安装 + 配置验证 | 安装指南 | 开发者用户 |
| [内容模板](../03-product/04-templates.md) | Markdown模板系统 | 内容参考 | 内容创作者 |

---

### 🔵 架构与配置文档（系统侧）

| 文档 | 主题 | 层级 | 用途 |
|------|------|------|------|
| [协同机制](../04-business/team-protocol.md) | 协作角色映射 + 多Agent协作 | 系统架构 | 多Agent编排 |
| [拟人化配置](../03-product/03-persona.md) | 组织/成员/风格切换 | 系统配置 | 定制化设置 |
| [风格预设](../03-product/02-presets.md) | 千书千面 - 五个快捷预设 | 配置样板 | 快速开始 |
| [排版规范](../03-product/06-typography.md) | 中文排版底线规范 | 文档规范 | 质量检查 |
| [视觉资产](../03-product/08-visual.md) | 封面 + 插图 + 图表生成策略 | 美学规范 | 视觉生成 |
| [构建系统](../05-ops/build.md) | 构建流程 + 降级策略 | 技术规范 | 部署实施 |

---

### 🟣 战略与分析文档（决策支持）

| 文档 | 主题 | 分析维度 | 决策类型 |
|------|------|---------|----------|
| [竞品分析](../04-business/competitors.md) | 竞品全景 + 功能对比 | 市场竞争 | 产品决策 |
| [全球化战略](../04-business/global.md) | 国际化 + 本地化方案 | 地域拓展 | 市场决策 |
| [定价策略](../04-business/pricing.md) | 定价框架 + 收益模型 | 商业模式 | 收入决策 |
| [风险管控](../04-business/risk.md) | 四类风险 + 响应策略 | 合规管理 | 风险决策 |
| [积分系统](../04-business/points-system.md) | 功能开关 + 积分计算 | 用户激励 | 运营决策 |
| [用户画像模板](../03-product/09-user-profile-template.md) | 自动生成模板 | 用户分析 | 运营数据 |

---

### ⚪ 专项参考文档（补充资料）

| 文档 | 内容 | 何时查阅 | 深度 |
|------|------|---------|------|
| [案例库](../03-product/10-case-library.md) | 真实写作素材库 | 需要参考案例时 | 示例库 |
| [关键词库](../02-quality/keywords.md) | 学术风险关键词 | S1阶段扫描配置 | 配置表 |
| [资产矩阵](../04-business/asset-matrix.md) | 内容资产衍生体系 | 变现策略规划时 | 系统设计 |
| [新手引导](./section-8-onboarding.md) | 新用户学习路径 | 用户成长阶段 | 教学资料 |
| [新手指令](./section-4-commands.md) | 64 条指令完整列表 | 指令查询时 | 参考手册 |

---

## 🔗 文档关系网络

### 质量保障链路

```
质量检查.md (总体规范)
    ├── S层规则.md (句级检查)
    ├── P/C/B层规则.md (段篇章级)
    ├── 指标体系.md (评分计算)
    └── L3语义接口.md (B2B对接)
```

### 执行流程链路

```
SKILL.md §3 (工作流总纲)
    ├── 前置调研.md (S0阶段)
    ├── 策略矩阵.md (搜索策略)
    ├── 工作流设计.md (七阶段详解)
    ├── 心跳协议.md (过程监控)
    └── 交付体系.md (最终输出)
```

### 产品配置链路

```
产品框架.md (产品总定位)
    ├── 协同机制.md (Agent配置)
    ├── 拟人化配置.md (组织配置)
    ├── 风格预设.md (快速模板)
    ├── 内容模板.md (文档模板)
    └── 排版规范.md (质量规范)
```

### 商业决策链路

```
竞品分析.md (市场理解)
    ├── 全球化战略.md (地域拓展)
    ├── 定价策略.md (收入模型)
    ├── 积分系统.md (用户激励)
    └── 资产矩阵.md (变现体系)
```

---

## 📊 文档统计

| 类别 | 数量 | 总行数 | 用途 |
|------|------|--------|------|
| 核心规范 | 5 | ~1500 | 战略决策 + 质量标准 |
| 质量体系 | 5 | ~2000 | 检查评分 + 技术规范 |
| 执行流程 | 5 | ~1800 | 项目管理 + 工作规范 |
| 产品交付 | 5 | ~2500 | 用户体验 + 实操指南 |
| 架构配置 | 6 | ~2200 | 系统架构 + 定制化 |
| 战略分析 | 6 | ~2500 | 商业决策 + 市场分析 |
| 参考资料 | 2 | ~500 | 补充资料 |
| **总计** | **34** | **~13,000** | - |

---

## 🎯 使用指南

### 按角色查找文档

**📌 产品经理**
- 🟴 [产品框架](../03-product/05-product-framework.md) - 定位与目标
- 🟡 [工作流设计](./section-3-workflow.md) - 执行规范
- 🟣 [竞品分析](../04-business/competitors.md) - 市场分析
- 🟣 [定价策略](../04-business/pricing.md) - 商业模型

**🔧 开发工程师**
- [技术实现](./section-6-tech.md) - 技术架构
- [多智能体委派话术](./workbuddy-agent-briefings.md) - S3/S5 可复制模板（WorkBuddy 等）
- [Coordinator / Arbiter 话术](./coordinator-arbiter-briefs.md) - 并行调度与仲裁（文档级）
- [联网检索策略 JSON](../05-ops/search-policy.json) - 阶段与每章门禁配置
- [协同机制](../04-business/team-protocol.md) - 系统设计
- [心跳协议](../05-ops/heartbeat-protocol.md) - 监控机制

**✍️ 内容创作者**
- 🟢 [内容模板](../03-product/04-templates.md) - 创作模板
- 🟢 [排版规范](../03-product/06-typography.md) - 排版标准
- 🟢 [视觉资产](../03-product/08-visual.md) - 美学指南
- 🟠 [质量检查](../02-quality/quality-check.md) - 自检清单

**🎓 运营/增长**
- 🟡 [策略矩阵](../04-business/strategy.md) - 运营经验
- 🟣 [全球化战略](../04-business/global.md) - 拓展计划
- 🟣 [积分系统](../04-business/points-system.md) - 用户激励
- 🟢 [UX设计](../03-product/07-ux-design.md) - 用户体验

### 按场景查找文档

**🚀 项目启动**
1. [产品框架](../03-product/05-product-framework.md) - 理解产品定位
2. [工作流设计](./section-3-workflow.md) - 了解执行流程
3. [协同机制](../04-business/team-protocol.md) - 配置协作机制

**✨ 内容创作**
1. [内容模板](../03-product/04-templates.md) - 选择合适模板
2. [排版规范](../03-product/06-typography.md) - 遵循排版规则
3. [质量检查](../02-quality/quality-check.md) - 自检内容质量

**📊 质量评审**
1. [质量检查](../02-quality/quality-check.md) - 查看检查清单
2. [S/P/C/B层规则](../02-quality/quality-S.md) & [质量PLC](../02-quality/quality-PLC.md) - 具体检查规则
3. [指标体系](../02-quality/metrics.md) - 评分计算方法

**🎨 视觉设计**
1. [风格预设](../03-product/02-presets.md) - 选择风格
2. [视觉资产](../03-product/08-visual.md) - 资产生成策略
3. [排版规范](../03-product/06-typography.md) - 排版合规

**🌍 全球化拓展**
1. [竞品分析](../04-business/competitors.md) - 市场现状
2. [全球化战略](../04-business/global.md) - 拓展计划
3. [定价策略](../04-business/pricing.md) - 收入模型

---

## 🔍 索引快速查询

### 按关键词查找

**"质量"** → [质量检查](../02-quality/quality-check.md) | [指标体系](../02-quality/metrics.md) | [质量PLC](../02-quality/quality-PLC.md)

**"执行"** → [工作流设计](./section-3-workflow.md) | [策略矩阵](../04-business/strategy.md) | [前置调研](../05-ops/S0-research-module.md)

**"用户"** → [UX设计](../03-product/07-ux-design.md) | [新手引导](./section-8-onboarding.md) | [用户画像](../03-product/09-user-profile-template.md)

**"配置"** → [协同机制](../04-business/team-protocol.md) | [拟人化配置](../03-product/03-persona.md) | [风格预设](../03-product/02-presets.md)

**"商业"** → [定价策略](../04-business/pricing.md) | [积分系统](../04-business/points-system.md) | [资产矩阵](../04-business/asset-matrix.md)

**"技术"** → [技术实现](./section-6-tech.md) | [构建系统](../05-ops/build.md) | [协同机制](../04-business/team-protocol.md)

**"部署"** → [构建系统](../05-ops/build.md) | [用户安装指南](../03-product/01-user-install-guide.md) | [交付体系](../05-ops/delivery.md)

---

## 🔧 维护者专区（发版 / 审计 / 与写书正文无关）

> **写作者可跳过本节**。仅打包、CI、文档维护时需要。

| 文档 / 脚本 | 用途 |
|-------------|------|
| [用户 vs 维护者边界](../05-ops/user-vs-maintainer-scope.md) | 默认读什么、不必读什么 |
| [规范同步检查表](../05-ops/spec-sync-checklist.md) | 改子规范后的勾选 |
| [包内一致性审计](../../scripts/audit-skill-consistency.mjs) | `node scripts/audit-skill-consistency.mjs` |
| [生产打包](../../scripts/package-production.mjs) | `node scripts/package-production.mjs` |
| [全局交付一致性](../05-ops/global-delivery-consistency.md) | 发版前交叉核对 |
| [实录洞察归档](../05-ops/consistency-insights.md) | 质量复盘，非用户教程 |

---

## ✅ 检查清单

在使用本索引前，确保：

- [ ] 已阅读 [SKILL.md](../../SKILL.md) 主文档
- [ ] 理解了[产品框架](../03-product/05-product-framework.md) 的定位
- [ ] 熟悉了[工作流设计](./section-3-workflow.md) 的执行流程
- [ ] 了解了[质量检查](../02-quality/quality-check.md) 的评分体系

---

## 🤝 维护

本索引随仓库文档变更修订；结构为 `01-core` / `02-quality` / `03-product` / `04-business` / `05-ops` 五类子目录与根级引用文件。**用户路径与发版路径解耦**见 [user-vs-maintainer-scope.md](../05-ops/user-vs-maintainer-scope.md)。
