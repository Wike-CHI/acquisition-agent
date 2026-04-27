# Changelog

All notable changes to the acquisition-agent workspace are documented here.

Changes synced from upstream (b2b-sdr-agent-template) are labeled with the originating version.

---

## [Unreleased]

### Added (2026-04-27 #2 — b2b 模板借鉴批次)

- **竞品情报追踪系统** — `.sync/competitor-intel.md` 皮带/工业设备外贸竞品日报，跟踪 Beltwin + 同品类设备厂 + 阿里国际站 + OpenClaw 上游，格式: Changes Detected → Analysis → Action Items → Metadata
- **上游自动同步脚本** — `scripts/daily-sync.sh` GitHub API 驱动的 OpenClaw 提交监控，RELEVANT/WATCH/SKIP 分类 + 自动报告生成
- **OpenClaw 升级指南** — `deploy/UPGRADE.md` 安全升级流程（备份→升级→验证→回滚），含各版本已知问题和 acquisition-agent 影响评估清单
- **产品目录 JSON** — `product-kb/catalog.json` 8 大品类 40+ 产品的结构化目录，含编码规则、电压选项、交期数据
- **PI 生成器** — `product-kb/scripts/generate-pi.js` 形式发票 CLI 工具，支持按产品 ID 生成 PI JSON，适配红龙编码体系

---

## 2026-04-27 — v2026.4.24 Initial Full Sync

> 首次基于 b2b-sdr-agent-template v2026.4.24 全量同步。

### New Features

- **14 项心跳巡检** — HEARTBEAT 从 13 项扩展到 14 项，新增多语言客户回复全渠道检测（WhatsApp/Email/Telegram/LinkedIn）
- **4 层防遗忘记忆协议** — MEMORY.md 完整实现 L0-L4 记忆架构，含回退链、监控指标、验证清单
- **ANTI-AMNESIA.md** — 新增独立可执行记忆系统规范，含 MemOS API Schema、ChromaDB 命令、部署指南
- **Operator 双语模式** — AGENTS.md 支持中文内部对话 + 客户语言对外沟通的混合模式
- **Active Memory 插件** — TOOLS.md 添加 v2026.4.10+ Active Memory 配置指南（L1.5 级自动记忆召回）
- **Graphify 知识图谱** — TOOLS.md 添加知识图谱查询配置（产品图谱 + 客户图谱 + 市场图谱）
- **Telegram 深度集成** — TOOLS.md 增加 Bot 命令、内联键盘模板、大文件策略、多账号配置
- **ICP 评分维度分解** — USER.md ICP 评分细化为 5 个维度（企业规模 30%、行业匹配 25%、采购历史 20%、付款能力 15%、决策链 10%）
- **Admin 白名单** — USER.md 增加系统级命令的管理员白名单机制
- **授权矩阵扩展** — USER.md 从 5 个参数扩展到 9 个（增加 MOQ、质保、配色/标识、包装）

### Enhanced

- **安全协议** — SOUL.md 安全协议从单一说明扩展为 6 项详细策略（注入防御、最小权限、数据边界、GDPR、频率检测、Admin-Only）
- **跨文件联动** — 所有 workspace 文件增加跨文件联动表，明确各文件的查询时机和依赖关系
- **Pipeline 状态流** — IDENTITY.md 增加完整的 11 种状态定义和进入条件
- **.sync/ 上游追踪** — 建立 .sync/ 目录系统，追踪 b2b-sdr-agent-template 版本变更
- **CHANGELOG.md** — 新增版本变更记录

### Structure

- `SOUL.template.md` — AI 人格规范（核心特质 + 沟通风格 + 安全协议 + 铁律执行协议）
- `AGENTS.template.md` — 10 阶段 Pipeline 操作手册
- `HEARTBEAT.template.md` — 14 项定时自动巡检
- `MEMORY.template.md` — 4 层防遗忘记忆协议
- `IDENTITY.template.md` — 公司身份和快速参考
- `USER.template.md` — 所有者档案 + ICP + 授权矩阵 + Admin 白名单
- `TOOLS.template.md` — 完整工具配置和 A2UI 交互式卡片
- `ANTI-AMNESIA.md` — 独立可执行记忆系统实施规范

---

*基于 b2b-sdr-agent-template CHANGELOG.md 格式 · 红龙工业设备定制版*
