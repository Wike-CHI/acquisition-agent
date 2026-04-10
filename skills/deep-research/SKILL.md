---
name: deep-research
version: 1.0.0
description: "深度多源调研技能。系统性调研公司、市场、行业，方法论追踪、来源评估、迭代深入。是 in-depth-research 的别名入口。"
always: false
triggers:
  - 深度调研
  - 深度背调
  - deep research
  - 系统调研
  - 全面调研
---

# Deep Research - 深度多源调研

系统性调研，不是表面搜索 — 通过方法论追踪、来源评估、迭代深入来回答问题。

> **注意**：本技能是 `in-depth-research` 的别名入口，确保 `global-customer-acquisition` 中声明的 `deep-research` 依赖可正确解析。
>
> **🚨 强制搜索规则（与 in-depth-research 一致）**：必须使用 Exa MCP（`mcporter call exa.xxx`），禁止使用内置 web_search。Exa 不可用时必须告知用户并获许可后方可降级。完整规则见 `skill://in-depth-research/HONGLONG-OVERRIDE.md`。

## 核心方法

```
1. 定义调研范围 → 明确需要回答的问题
2. 制定搜索策略 → 选择搜索引擎组合
3. 多源采集 → 至少3个独立来源交叉验证
4. 来源评估 → 评估可信度（官方>行业媒体>论坛）
5. 迭代深入 → 发现新线索后追踪
6. 结构化输出 → 按模板输出报告
```

## 调研模板

### 公司背调
```
## 公司概况
- 全名 / 总部 / 成立年份
- 业务范围 / 主要产品
- 员工规模 / 年营收（估算）

## 采购分析
- 历史采购记录（特易海关数据）
- 当前供应商（公开信息）
- 采购决策链（LinkedIn 挖掘）

## 匹配度评估
- ICP 评分（6维度）
- 推荐产品组合
- 接触策略建议
```

### 市场调研
```
## 市场概况
- 市场规模（TAM/SAM/SOM）
- 增长趋势
- 主要参与者

## 竞品格局
- 主要竞争对手
- 价格区间
- 差异化机会

## 进入策略
- 渠道建议
- 定价策略
- 风险评估
```

## 与获客系统集成

- `acquisition-coordinator` → 派发深度调研任务
- `customer-intelligence` → ICP 评分依赖调研数据
- `in-depth-research` → 本技能的具体实现
- `exa-search` / `tavily-search` → 调研数据来源
