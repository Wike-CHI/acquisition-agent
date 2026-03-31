# 分级扫描策略（共享定义）

> 引用方：commands/project.md、commands/diff.md、references/strategies/orchestrator-rules.md

本文件统一定义：扫描级别判定逻辑、阈值、参数覆盖、级别间差异。

---

## 扫描级别定义

| 级别 | 适用场景 | 源文件数 | Agent 数量 | 预计耗时 | 核心特点 |
|------|---------|---------|-----------|---------|---------|
| **Light** | 小型项目 | <= 15 | 1（light-scan） | 约15-20t | 单 Agent 完成全部工作，消除 Agent 间通信开销 |
| **Deep** | 中大型项目 | > 15 | 5-6（完整流水线） | 约68-100t | 完整流水线，流式验证，分批策略 |

## 级别判定逻辑

### 自动判定（默认）——复合指标

在编排器阶段 0 完成 recon-lite（或文件枚举）后，基于 `fileCount`（文件数量）为主轴，`totalLines`（总有效代码行数）为修正因子，`maxFileLines`（最大单文件行数）为预警信号，复合判定：

```
fileCount  = stage1-context.json > fileCount（源文件总数，不含配置/依赖文件）
totalLines = stage1-context.json > totalLines（所有源文件的有效代码总行数）
maxFileLines = stage1-context.json > maxFileLines（最大单文件行数）

# 第一步：基于文件数量确定基准级别
if fileCount <= 15:
    baseLevel = "light"
else:
    baseLevel = "deep"

# 第二步：基于总行数修正——防止"文件少但代码量大"的降级风险
if baseLevel == "light" and totalLines > 2000:
    scanLevel = "deep"     # 文件少但代码量大，升级
    upgradeReason = "文件数量仅 {fileCount} 个，但总代码量达 {totalLines} 行，已升级为深度扫描"
else:
    scanLevel = baseLevel
    upgradeReason = null

# 第三步：标记大文件预警（不影响级别，影响扫描优先级）
largeFiles = [f for f in fileList if f.lines > 500]
if largeFiles:
    largeFileWarning = "发现 {len(largeFiles)} 个大文件（> 500 行），将优先进行深度分析"
else:
    largeFileWarning = null
```

### recon-lite 额外输出要求

recon-lite 在文件枚举阶段需额外统计并写入 `stage1-context.json`：

| 字段 | 说明 | 获取方式 |
|------|------|---------|
| `totalLines` | 所有源文件的总行数 | 枚举时批量 `wc -l`，零额外 turns 开销 |
| `maxFileLines` | 最大单文件行数 | 同上，取 max |
| `largeFiles` | 超过 500 行的文件列表（含路径和行数） | 同上，过滤 > 500 |

> 这些统计在 recon-lite 的 Glob 枚举阶段通过一次 `wc -l` 批量完成，不增加额外的 turns 开销。

### 用户选择（阶段 0 交互）

在阶段 0.3 中，通过 `AskUserQuestion` 让用户选择扫描模式：

```
AskUserQuestion:
  question: "请选择扫描模式："
  header: "扫描模式"
  options:
    - label: "快速扫描（Light）"
      description: "聚焦高危漏洞，轻量验证，快速输出风险报告"
    - label: "深度扫描（Deep）"
      description: "将项目代码结构索引化，全面推理潜在风险，尽可能覆盖更多漏洞类型"
```

用户也可通过参数显式指定扫描级别，跳过 `AskUserQuestion`：

```
/security-scan:project --scan-level light|deep
```

---

## 各级别流水线对比

### Light 模式流水线

```
阶段 0（初始化）               阶段 1（编排器内联）          阶段 2（单 Agent，≈15-20t）      阶段 3（编排器内联）
──────────────                ─────────────────            ──────────────────────          ──────────────────
├ 插件授权检查                 ├ 契约提取                    light-scan (25t)             ├ merge-verify
├ LSP 探活                    ├ 规则加载                    ├ 模式匹配 (D1-D5)              ├ 内联修复
├ recon-lite + 模式选择        └ stage1-context.json         ├ LSP 数据流追踪                ├ 报告生成
└ 初始化摘要                                                ├ 授权审计                      └ 用户交互
                                                           ├ 内联反幻觉验证
                                                           └ 置信度评分
```

**跳过的 Agent**：recon-lite（阶段 0 已执行）、recon-deep、quick-scan、deep-scan、verification（全部由 light-scan 替代）
**跳过的检查点**：verify-explore（无 recon-deep 产物）、verify-artifacts（仅 1 个 Agent）
**保留的脚本**：merge-verify（如有多个 finding 文件）、generate_report.py、report_upload.py

### Deep 模式流水线

与当前架构完全相同。参见 `commands/project.md` 原有流水线。

**优化**：
- verification 流式模式：初始等待从最多 3 轮降到 2 轮；超时保护从连续 5 轮降到 3 轮

---

## 各级别 Agent 参数差异

### light-scan（仅 Light 模式）

| 参数 | 值 |
|------|---|
| max_turns | 25 |
| totalCalls 收尾阈值 | 85 |
| Turn 预留 | 最后 3 轮 |

### quick-scan（仅 Deep 模式）

| 参数 | 值 |
|------|---|
| max_turns | 30 |
| totalCalls 收尾阈值 | 100 |

### deep-scan（仅 Deep 模式）

| 参数 | 值 |
|------|---|
| max_turns | 35 |
| totalCalls 收尾阈值 | 130 |
| 子任务 B 范围 | D3 + D9 全量 |

### verification（仅 Deep 模式，流式）

| 参数 | 值 |
|------|---|
| max_turns | 30 |
| totalCalls 收尾阈值 | 100 |
| 模式 | 流式（边扫描边验证） |
| 全局审计质量评估 | 完整版 |

---

## 阈值选择依据

> 以下内容仅供人类开发者参考，Agent 执行时无需阅读。

阈值设定的核心依据是各级别 Agent 组合的实际分析能力（turns × 每 turn 分析量）与项目规模的匹配关系。Light 上限 15 文件（单 Agent 25t 的注意力上限）、行数修正阈值 2000 基于每 turn 可精读行数反推。详细论证参见 `CONTRIBUTING.md > 设计决策记录`。

---

## 质量保障：不分级的部分

以下机制在所有扫描级别中**保持不变**，确保质量底线：

- [Y] 反幻觉合约（`references/contracts/anti-hallucination-contract.md`）
- [Y] 增量写入合约（`references/contracts/incremental-write-contract.md`）
- [Y] Read 工具调用规范（offset + limit，同文件去重）
- [Y] 攻击链合约（source + propagation + sink + traceMethod）
- [Y] 置信度评分公式和高置信度门控（>= 90 全部 7 条件）
- [Y] 修复资格标准（ahAction=pass + RiskConfidence>=90 + challengeVerdict confirmed/escalated）
