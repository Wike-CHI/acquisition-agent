---
description: 基于 Agent 团队架构的全项目代码安全审计，支持 Light / Deep 自适应分级扫描
argument-hint: "[file_path...] [--include *.py,*.js] [--exclude node_modules,dist] [--scan-level light|deep]"
allowed-tools: Bash, Read, Glob, Write, Grep, Task, Edit, LSP
---

# 全项目安全审计

> **[语言要求]** 所有面向用户的输出（进度提示、摘要、说明、错误信息）必须使用**简体中文**。Agent 提示词中的结构化标签保持中文。JSON 字段名和技术标识符（Agent 名称、文件路径等）保持英文不变。

采用混合调度模式执行全项目安全审计：轻量任务由编排器内联执行，重 Workload 委派独立 Agent 处理。支持**自适应分级扫描**（Light / Deep），根据项目规模自动选择最优策略。阶段 0 通过 `AskUserQuestion` 交互式确认环境状态；阶段 1-2 自动执行；用户交互在阶段 3 进行。

> **分级扫描策略**：参见 `references/strategies/scan-level-strategy.md` 了解完整的级别定义、阈值和参数差异。

---

## 架构概览（Deep 模式）

> 以下为 Deep 模式（>15 文件）的架构。Light 模式的流水线见「分级扫描分支」章节。

```
阶段 0（初始化）          阶段 1（侦察）           阶段 2（扫描 + 流式验证）                    阶段 3（修复）
──────────────           ─────────────           ──────────────────────────                  ──────────
0.1 插件授权检查           契约提取 + 规则加载       quick-scan ─────────────────┐              内联 remediation
0.2 LSP 探活              按级别分流               recon-deep → deep-scan ──────┤              + 报告生成
0.3 recon-lite + 模式选择      └→ quick-scan 提前启动                            │
0.4 初始化摘要                                      verification (流式验证) ←─────┘
```

---

## 阶段 0：初始化

> 本阶段在扫描前前置执行环境就绪检查，通过 `AskUserQuestion` 交互式确认环境状态，让用户在扫描前知晓全貌。

### 0.1 插件根目录定位 + 权限预检

**插件根目录定位**：

执行 skill `plugin-root-resolution` 中的定位脚本，确定 `plugin_root`。

- `OK` → 记住 `plugin_root` 绝对路径，后续按隔离规则使用；将 `$plugin_root/resource/default-rules.yaml` 和 `$plugin_root/resource/anti-hallucination-rules.yaml` 的路径记录到 `stage1-context.json`
- `WARN` → 无插件资源可用，跳过所有需要 `plugin_root` 的步骤，继续执行扫描

**插件白名单授权检查**：

读取 `~/.codebuddy/settings.json`，检查 `enabledPlugins`：

1. **security-scan 插件本身**：检查是否包含 `security-scan@codebuddy-plugins-official`
   - 未授权 → 通过 `AskUserQuestion` 提示：
     ```
     question: "security-scan 插件未在白名单中启用，功能可能受限。请在 CodeBuddy 设置中启用后重启 CodeBuddy。"
     header: "插件授权"
     options:
       - label: "我已启用并重启，继续扫描"
         description: "确认已在设置中启用 security-scan 插件并重启 CodeBuddy"
       - label: "继续扫描（可能受限）"
         description: "跳过授权检查，部分功能可能不可用"
     ```
2. **LSP 插件**：检测到项目语言后（在 0.2 中执行），对应 LSP 插件（如 `jdtls-lsp@codebuddy-plugins-official`）的授权状态一并在 0.2 中处理

**扫描工具权限预配置**（Ref: `references/guides/permission-preconfig.md`）：

> 安全扫描过程中需要频繁调用分析脚本和写入扫描结果，未配置工具权限白名单时每次扫描需要手动确认约 70 次授权弹窗。预配置后可减少约 90% 的授权确认，仅保留代码修复等关键操作的手动确认。

检测项目 `.codebuddy/settings.json` 和用户 `~/.codebuddy/settings.json` 是否已配置扫描工具权限白名单（Ref: `references/guides/permission-preconfig.md > 检测逻辑`）。

- **已配置或已 bypass**（`permissionsConfigured: true`）→ 跳过权限配置引导，继续 0.2
- **未配置** → 通过 `AskUserQuestion` 引导配置：

```
AskUserQuestion:
  question: "检测到未配置扫描权限白名单。安全扫描过程中需要频繁调用分析脚本和写入扫描结果，未配置白名单时每次扫描需要手动确认约 70 次授权弹窗。配置后可减少约 90% 的授权确认，仅保留代码修复等关键操作的手动确认。请选择如何处理？"
  header: "权限配置"
  options:
    - label: "自动配置（推荐）"
      description: "在项目 .codebuddy/settings.json 中添加扫描工具白名单，可提交 Git 与团队共享"
    - label: "跳过，后续手动配置"
      description: "不自动配置。如需全局生效，可稍后手动编辑 ~/.codebuddy/settings.json"
```

用户选择「自动配置」时，执行权限写入（Ref: `references/guides/permission-preconfig.md > 自动配置写入`）。

### 0.2 语言检测 + LSP 探活

复用 `references/guides/lsp-setup.md` 的完整逻辑，前置执行：

1. **语言检测**：通过 Glob 检查标记文件（Ref: `references/guides/lsp-setup.md > 语言检测`）
2. **快速路径检查**：binary in PATH + 插件已安装已启用 → 1 次 hover（Ref: `references/guides/lsp-setup.md > 快速路径`）
3. **失败则走完整流程**：PATH 检查 → 插件状态检查 → 探活 → 自动安装（Ref: `references/guides/lsp-setup.md > 完整探活流程`）
4. **安装后需重启**的情况，通过 `AskUserQuestion` 提示：
   ```
   question: "LSP 安装完成，需重启 CodeBuddy 生效。请选择："
   header: "LSP 状态"
   options:
     - label: "我已重启，继续扫描"
       description: "重启后将再验证 1 次 LSP 可用性"
     - label: "跳过 LSP，以降级模式继续"
       description: "以 Grep + Read 模式继续扫描，检测深度降低"
   ```
   - 用户选择"我已重启" → 再执行 1 次验证探活
     - 成功 → `lspStatus = "available"`
     - 失败 → `lspStatus = "unavailable"`
   - 用户选择"跳过 LSP" → `lspStatus = "unavailable"`

将探活结果写入 `stage1-context.json` 的 `lspProbe` 字段（格式参见 `references/guides/lsp-setup.md > 探活结果记录`）。

> **并行优化**：0.2 LSP 探活可以与 0.3 中的 recon-lite 并行执行。

### 0.3 扫描模式选择（recon-lite + 用户确认）

**启动 recon-lite**（不等待 LSP 或规则加载——recon-lite 不依赖它们）：

- 通过 Task 后台模式启动 **recon-lite** -- 文件枚举、技术栈识别（max_turns=5）

**并行时间线**：
```
0.2 LSP 探活 (并行)
0.3 recon-lite (并行, 后台)
    → 等待 recon-lite 完成
```

按 `references/strategies/orchestrator-rules.md > 等待期轮询协议` 轮询 recon-lite 状态，向用户播报进度。完成后从 `agents/recon-lite.json` 读取 `fileList`、`fileCount`、`totalLines`、`maxFileLines`、`largeFiles`、`projectInfo`，写入 `stage1-context.json`。

**分级决策**（Ref: `references/strategies/scan-level-strategy.md > 级别判定逻辑`）：

根据 `fileCount`（文件数量）+ `totalLines`（总行数修正）+ 用户参数 `--scan-level`，复合判定推荐扫描级别。

**用户确认模式选择**——通过 `AskUserQuestion` 展示检测结果并让用户选择扫描模式：

```
输出检测结果：
  源文件：{fileCount} 个
  代码量：{totalLines} 行
  技术栈：{framework}
  推荐级别：{scanLevel}（{reason}）
  {如果存在大文件：提示：{largeFileWarning}}

AskUserQuestion:
  question: "请选择扫描模式："
  header: "扫描模式"
  options:
    - label: "快速扫描（Light）"
      description: "聚焦高危漏洞，轻量验证，快速输出风险报告"
    - label: "深度扫描（Deep）"
      description: "将项目代码结构索引化，全面推理潜在风险，尽可能覆盖更多漏洞类型"
```

用户选择的级别作为最终 `scanLevel`。如用户传入了 `--scan-level` 参数，跳过 `AskUserQuestion`，直接使用用户指定级别。

### 0.4 初始化摘要

所有检查完成后，输出一次性摘要：

```
═══ 初始化完成 ═══
  权限配置：✓ 已配置扫描工具白名单 / ⚠ 未配置（扫描过程将频繁弹出授权确认）
  插件状态：✓ security-scan 已授权 / ⚠ security-scan 未授权（受限模式）
  LSP 状态：✓ {language} LSP 可用 / ⚠ 降级模式（Grep + Read）
  扫描模式：{Light|Deep}（{自动推荐|用户指定}）
═══════════════════
```

---

## 阶段 1：侦察

> 进度输出参见 `references/strategies/orchestrator-rules.md > 进度输出`
>
> 本阶段使用阶段 0 的产出：`plugin_root`、`lspProbe`、`scanLevel`、recon-lite 的 `fileList`/`fileCount`/`totalLines`/`projectInfo`。

### 1.1 初始化批次目录

```bash
audit_batch_id="project-audit-$(date +%Y%m%d%H%M%S)"
mkdir -p security-scan-output/$audit_batch_id
```

### 1.2 契约提取 + 条件规则加载

- **提取契约摘要**：从 anti-hallucination-rules.yaml 中提取 4 行契约核心，用于 agent 提示词注入（Ref: `references/contracts/anti-hallucination-contract.md`）

**条件规则加载**（此时已有文件列表，可精确判断）：

- 检查认证风险信号（Controller/Handler/路由定义、权限检查）
- 如果触发：Read `$plugin_root/resource/logic-audit-rules/authentication-bypass.yaml`
- 检查自定义规则：`$plugin_root/resource/custom/*.yaml`
- 将已加载的规则写入 `stage1-context.json` 的 `auditRules` 字段

**按技术栈加载框架安全知识**（Ref: `references/strategies/orchestrator-rules.md > 按技术栈加载框架安全知识`）：基于 projectInfo 中的 framework 信息加载对应知识文件。

### 1.3 按级别分流

使用阶段 0.3 确定的 `scanLevel` 直接分流执行：

- Light → 跳转到「Light 模式分支」
- Deep → 继续执行 1.4（当前流水线）

### 1.4 并行启动 quick-scan + recon-deep（Deep 模式）

**关键优化**：recon-lite 完成后，**同时并行启动**：

- **quick-scan** -- 仅需 fileList 即可工作（max_turns=30）
- **recon-deep** -- 完成端点矩阵、攻击面等深度侦察（max_turns=18）

```
recon-lite 完成 → quick-scan (并行)
               → recon-deep (并行)
```

### 1.5 探索检查点

> Ref: `references/strategies/orchestrator-rules.md > 检查点逻辑 > 探索检查点`

在 recon-deep 完成后执行探索检查点。

---

## 阶段 2：扫描 + 流式验证（并行）（Deep 模式）

### 2.1 等待 recon-deep + 写入完整 stage1-context

按 `references/strategies/orchestrator-rules.md > 等待期轮询协议` 轮询 recon-deep 状态。当完成条件满足后，从 `agents/recon-deep.json` 中读取关键指标，追加到 `stage1-context.json`：`entryPoints`、`endpointPermissionMatrix`、`attackSurfaceMapping`、`cloudServices`、`dependencies`。

### 2.2 启动 deep-scan

recon-deep 完成后，通过 Task 工具后台模式启动：

- **deep-scan** -- LSP 语义数据流追踪（max_turns=35）

> 注意：此时 quick-scan 已在运行中（1.4 启动），deep-scan 与 quick-scan 并行。

### 2.3 启动流式 verification（关键优化）

**不等待 Stage 2 全部完成**。在 deep-scan 启动后，立即启动：

- **verification（流式模式）** -- 流式验证 findings，边扫描边验证（max_turns=30）

提示词中注入流式模式指令：
```
[消费模式] streaming
[上游输出] agents/deep-scan.json, agents/quick-scan.json（增量轮询）
[去重规则] file+lineNumber+riskType 三元组；重复取 deep-scan 版本
```

### 2.4 等待 quick-scan 完成

按 `references/strategies/orchestrator-rules.md > 等待期轮询协议` 轮询 quick-scan 状态。完成条件满足后打印摘要。

### 2.5 等待 deep-scan 完成

按 `references/strategies/orchestrator-rules.md > 等待期轮询协议` 轮询 deep-scan 状态。完成条件满足后打印摘要。

### 2.6 等待 verification 完成

按 `references/strategies/orchestrator-rules.md > 等待期轮询协议` 轮询 verification 状态。verification 在检测到上游 agent 全部完成后，会自动执行全局审计质量评估并结束。完成条件满足后打印摘要。

### 2.7 校验阶段 2 产物完整性（强制）

> Ref: `references/strategies/orchestrator-rules.md > 检查点逻辑 > 阶段 2 产物完整性检查`

在进入合并前，必须先确认 `quick-scan`、`deep-scan`、`verification` 已实际写出产物文件，且 `status` 为 `completed` 或 `partial`：

```bash
python3 "$plugin_root/scripts/checkpoint_verify.py" verify-artifacts \
  --batch-dir security-scan-output/{batch} \
  --agents quick-scan,deep-scan,verification
```

处理规则：
- `status: "ok"`：继续 2.8
- `status: "fail"`：仅允许重试缺失/损坏的 agent **1 次**
- 重试后仍失败：终止本批次，禁止编排器手工接管扫描或直接拼装结果

### 2.8 合并扫描结果

> Ref: `references/strategies/orchestrator-rules.md > 检查点逻辑 > 扫描合并`

```bash
python3 "$plugin_root/scripts/merge_findings.py" merge-scan \
  --batch-dir security-scan-output/{batch}
```

### 2.9 漏洞链检测

合并后，分析 `merged-scan.json` 中的跨文件漏洞链：

- 识别多文件攻击路径
- 将同一路径的发现关联为 `vulnerabilityChain` 条目
- 提升严重级别
- 将链数据写入 `merged-scan.json` 的 `chains` 字段

### 2.9.5 覆盖率评估 + 补漏调度（可选）

> Ref: `references/strategies/orchestrator-rules.md > 覆盖率评估与补漏调度`

### 2.10 合并验证结果

```bash
python3 "$plugin_root/scripts/merge_findings.py" merge-verify \
  --batch-dir security-scan-output/{batch}
```

仅解析 stdout JSON。

### 2.11 扫描检查点

> Ref: `references/strategies/orchestrator-rules.md > 检查点逻辑 > 扫描检查点`

### 2.12 跨仓库来源关联

> Ref: `references/strategies/orchestrator-rules.md > 检查点逻辑 > 跨仓库源关联`

---

## 阶段 3：修复（所有模式共享）

### 3.1 内联修复（编排器直接执行）

> **不启动独立 Agent**。修复逻辑足够轻量，在编排器上下文内直接执行。

**修复资格**：`ahAction=pass` 且 `RiskConfidence>=90` 且 `challengeVerdict` 为（confirmed 或 escalated）。

**执行步骤**：

1. 从验证产物中提取符合资格的 findings 列表（Deep 模式读取 `agents/verification.json`；Light 模式读取 `agents/light-scan.json`），仅读取 `findingId`、`RiskConfidence`、`verificationStatus`、`challengeVerdict`、`ahAction` 字段
2. 对每个符合资格的 finding：
   - Read Sink 所在文件的漏洞上下文（目标行号 ±20 行）
   - Read Source 所在文件（理解数据入口）
   - Grep 项目中已有的安全组件（sanitizer、validator、encoder）
   - 按修复优先级选择修复层级（Sink 层 > 中间层 > Source 层 > 架构层）
   - 生成 `originalCode`（从 Read 逐字提取）和 `fixedCode`
3. 写入 `agents/remediation.json`

**修复原则**（与原 remediation agent 一致）：
- 复用优先——使用项目已有的安全组件
- 风格一致——匹配项目代码风格
- 最小变更——仅修改必要代码行
- 业务无损——不破坏业务逻辑
- 编译即通——包含所有必要 import
- 可逆安全——复杂修复拆分为独立步骤

**上下文控制**：内联修复的 Read 调用遵循 context-budget-contract.md 的 Read 规范（offset+limit，每文件最多 3 次）。如果待修复 findings 超过 10 个，仅修复 Top-10（按 RiskLevel 和 RiskConfidence 排序）。

### 3.2 报告生成

调用 `generate_report.py` 生成 HTML 报告。切勿手动生成 HTML。

```bash
python3 "$plugin_root/scripts/generate_report.py" \
  --input security-scan-output/"$audit_batch_id" \
  --audit-batch-id "$audit_batch_id" \
  --format html \
  --output security-scan-output/"$audit_batch_id"/security-scan-report.html
```

### 3.3 输出与报告

> Ref: `references/strategies/post-audit-workflow.md` for report upload, summary template, user interaction
> Ref: `references/contracts/output-schemas.md` for JSON output format

项目特有的附加内容：

```
扫描范围：{total_files} 个文件
```

### 3.4 执行用户选择

> Ref: `references/strategies/post-audit-workflow.md` > User Interaction

---

## 分级扫描分支

### Light 模式分支（≤ 15 文件）

当步骤 1.3 确定 `scanLevel = light` 时，跳过 1.4-1.5 和阶段 2 的 Deep 模式流水线，执行以下精简流水线：

#### L-阶段 1：标记完成

将 `stage1-context.json` 标记为完成（`scanLevel: "light"`）。文件枚举、技术栈识别、LSP 探活均已在阶段 0 中完成，条件规则加载已在 1.2 中完成。

#### L-阶段 2：单 Agent 扫描（≈15-20t）

通过 Task 后台模式启动唯一的 Agent：

- **light-scan** -- 融合模式匹配 + LSP 追踪 + 内联验证（max_turns=25）

```
提示词注入：
[扫描级别] light
[源文件数] {fileCount}
[stage1-context] security-scan-output/{batch}/stage1-context.json
```

按 `references/strategies/orchestrator-rules.md > 等待期轮询协议` 轮询 light-scan 状态。完成后打印摘要。

#### L-阶段 2.5：合并验证结果

```bash
python3 "$plugin_root/scripts/merge_findings.py" merge-verify \
  --batch-dir security-scan-output/{batch}
```

> Light 模式跳过 verify-artifacts（仅 1 个 Agent，无需校验多 Agent 产物完整性）和 merge-scan（light-scan 已内联去重）。

#### L-阶段 3：修复

跳转到「阶段 3：修复」，与 Deep 模式共享修复 + 报告 + 用户交互流程。

---

## 调度器上下文控制

> Ref: references/strategies/orchestrator-rules.md

## Agent 团队概览与执行时间线

> Ref: ARCHITECTURE.md > Agent 目录、执行时间线对比

## 大型项目批量策略

> Ref: references/strategies/batch-strategy.md（仅 Deep 模式 > 80 文件时适用）
