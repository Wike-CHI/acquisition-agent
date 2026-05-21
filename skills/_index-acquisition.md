---
name: acquisition-domain
description: 核心获客流程领域 MOC。编排、初始化、工作流定义——所有获客任务的起点。进入此领域表示需要开始或协调获客活动。
version: 1.0.0
capability: core
priority: 100
---

# 核心获客流程

> **领域入口。** 收到获客任务时，通常从这里开始。[[global-customer-acquisition]] 是总入口，[[acquisition-coordinator]] 负责任务分解。

## 技能节点

### 主入口
- **[[global-customer-acquisition]]** — HOLO 获客系统总入口。整合所有获客能力的顶层技能，理解用户意图后路由到子技能。大多数获客对话的起点。
- **[[acquisition-coordinator]]** — 任务编排器。将复杂获客任务拆解为子任务、调度子技能、整合结果。5 阶段工作流：搜索→验证→背调→筛选→触达。

### 流程定义
- **[[acquisition-workflow]]** — 端到端流程规范。定义 10 步标准流程、各阶段质量检查点、输出格式标准。
- **[[acquisition-init]]** — 系统初始化引导。首次使用时配置凭据、挂载 NAS、测试邮箱、安装依赖。

### 依赖与质量
- **[[acquisition-dependencies]]** — 跨平台依赖安装。检测 Linux/Windows/macOS，安装 Python/npm 系统依赖。
- **[[acquisition-evaluator]]** — 独立验收 Agent。评估背调报告、开发信质量、报价准确性，输出评分和修改建议。
- **[[acquisition-development-notes]]** — 开发笔记。记录技能开发中的踩坑经验、已知 bug、工作流规范。

## 遍历指引

- 新会话 → [[global-customer-acquisition]]
- 复杂多步任务 → [[acquisition-coordinator]]
- 环境问题 → [[acquisition-dependencies]]
- 系统初始化 → [[acquisition-init]]
- 质量检查 → [[acquisition-evaluator]]

---

## 关联领域

完成编排后，通常进入：
- 找客户 → [[_index-discovery]]
- 写开发信 → [[_index-outreach]]
- 客户询价 → [[_index-conversion]]
