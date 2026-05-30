---
name: operations-domain
description: 运营自动化领域 MOC。心跳巡检、主动 Agent、日程调度、报告生成、数据自动化——让系统自己运行。触发词：心跳、巡检、定时、自动、日报、报告。
version: 1.0.0
capability: core
priority: 60
---

# 运营自动化

> **"Pipeline 健康吗？今天要做什么？"** — 本领域让系统自主运行，减少人工检查。

## 技能节点

### 心脏起搏
- **[[holo-heartbeat-executor]]** — 心跳执行器。执行 14 项 Pipeline 自动巡检：客户跟进状态、邮件回复、WhatsApp 消息、CRM 同步等。每 15 分钟自动触发一次。**系统自动运行的核心。**
- **[[proactive-agent]]** — 主动式 AI Agent 框架。将被动 AI 转变为主动合作伙伴，含 WAL 协议、工作缓冲区、自主定时任务。

### 调度与监控
- **[[hot-monitor]]** — 热点话题监控。监控行业热点和技术趋势，发现获客新机会。

### 日志与报告
- **[[holo-activity-log]]** — 业务操作日志。记录操作到 NAS 共享活动日志（CSV），供 Boss 监控页面读取。
- **[[daily-report-writer]]** — 日报生成。根据当日活动输入生成日报 Markdown 草稿，写入 reports 目录。
- **[[market-development-report]]** — 市场开发报告 → 详见 [[_index-discovery]]。

### 自动化工具
- **[[routing-table-audit]]** — 路由表审计。检查 ROUTING-TABLE.yaml 路由规则完整性和冲突。

## 遍历指引

- 启动心跳 → [[holo-heartbeat-executor]]
- 查看 Pipeline 健康 → [[holo-heartbeat-executor]] → [[sales-pipeline-tracker]]
- 查看日程 → [[hot-monitor]]
- 写日报 → [[daily-report-writer]]
- 记录操作 → [[holo-activity-log]]
- 启用主动模式 → [[proactive-agent]]

---

## 关联领域

- 心跳发现问题 → 根据问题类型进入 [[_index-outreach]] 或 [[_index-conversion]]
- 日报涉及的产品 → [[_index-intelligence]] (honglong-products)
