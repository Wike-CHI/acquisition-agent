---
description: 基于 Agent 团队架构的 Git diff 增量安全审计，支持纯配置快速通道与变更影响范围关联分析
argument-hint: [--commit <hash>] [--mode staged|unstaged|all]
allowed-tools: Bash, Read, Glob, Write, Grep, Task, Edit, LSP
---

# Git Diff 增量安全审计

> **[语言要求]** 所有面向用户的输出（进度提示、摘要、说明、错误信息）必须使用**简体中文**。Agent 提示词中的结构化标签保持中文。JSON 字段名和技术标识符（Agent 名称、文件路径等）保持英文不变。

通过 Agent 团队对 Git 变更执行增量安全审计。针对 Diff 场景做了两项专项优化：**纯配置 / 依赖变更快速通道** + **变更影响范围扩展（关联文件分析）**。阶段 0 通过 `AskUserQuestion` 交互式确认环境状态；阶段 1-2 自动执行；用户交互在阶段 3 进行。

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
2. **LSP 插件**：检测到项目语言后（在 0.2 中执行），对应 LSP 插件的授权状态一并在 0.2 中处理

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

### 0.3 获取变更文件 + 扫描模式确认

**获取 git diff 文件列表**：

```bash
git diff <hash>^ <hash> --name-only --diff-filter=ACMR  # specific commit
git diff HEAD --name-only --diff-filter=ACMR              # --mode all (default)
git diff --cached --name-only --diff-filter=ACMR           # --mode staged
git diff --name-only --diff-filter=ACMR                    # --mode unstaged
git diff HEAD^ HEAD --name-only --diff-filter=ACMR         # fallback: clean tree
```

**空文件列表快速退出**：如果所有 diff 命令均返回空结果（无变更文件），立即终止并输出友好提示：

```
未检测到任何代码变更，无需执行安全扫描。

请确认：
  - 当前分支是否有未提交的修改（git status 查看）
  - 或指定具体 commit：/security-scan:diff --commit <hash>
  - 或切换模式：--mode staged / --mode unstaged
```

> 此路径不创建审计批次目录、不启动任何 agent，直接结束命令。

**对变更文件进行分类**：
- **依赖文件**（供应链审计）：`pom.xml`、`package.json`、`go.mod`、`requirements.txt` 等
- **配置文件**（配置基线）：`application.yml`、`.env`、`settings.py`、`config.json` 等
- **代码文件**（漏洞审计）：`.java`、`.kt`、`.py`、`.go`、`.js`、`.ts`、`.tsx`、`.php`、`.rb`、`.cs`、`.cpp`、`.c`、`.rs`、`.swift`、`.vue`
- **运维文件**（凭据扫描）：`Dockerfile`、`docker-compose.yml`、`.env`（非示例文件）

**分流判断 + 信息展示**：

```
hasCodeChanges = 代码文件列表非空?
```

- **`hasCodeChanges = false`**（纯配置/依赖变更）→ 直接告知用户走配置快速通道，无需选择：
  ```
  输出：
    变更文件 {n} 个（均为配置/依赖文件，无代码变更）
    ⚡ 将启用配置快速通道：仅执行密钥检测 + CVE 扫描 + 配置基线检查
  ```

- **`hasCodeChanges = true`** → 输出检测结果后，通过 `AskUserQuestion` 让用户选择扫描模式：
  ```
  输出检测结果：
    变更文件总数：{totalFiles} 个
    代码文件：{codeFiles} 个
    配置/依赖文件：{configFiles} 个
    技术栈：{language}

  AskUserQuestion:
    question: "请选择扫描模式："
    header: "扫描模式"
    options:
      - label: "快速扫描（Light）"
        description: "聚焦高危漏洞，轻量验证，快速输出风险报告"
      - label: "深度扫描（Deep）"
        description: "将项目代码结构索引化，全面推理潜在风险，尽可能覆盖更多漏洞类型"
  ```

将分类后的 fileList、`hasCodeChanges` 标志和用户选择的 `scanLevel` 写入 `stage1-context.json`。

### 0.4 初始化摘要

所有检查完成后，输出一次性摘要：

```
═══ 初始化完成 ═══
  权限配置：✓ 已配置扫描工具白名单 / ⚠ 未配置（扫描过程将频繁弹出授权确认）
  插件状态：✓ security-scan 已授权 / ⚠ security-scan 未授权（受限模式）
  LSP 状态：✓ {language} LSP 可用 / ⚠ 降级模式（Grep + Read）
  扫描模式：{完整 diff 流水线|配置快速通道}（变更文件 {n} 个）
═══════════════════
```

---

## 阶段 1：侦察

> 进度输出参见 `references/strategies/orchestrator-rules.md > 进度输出`
>
> 本阶段使用阶段 0 的产出：`plugin_root`、`lspProbe`、`hasCodeChanges`、分类后的 `fileList`。

### 1.1 初始化批次目录

```bash
audit_batch_id="diff-audit-$(date +%Y%m%d%H%M%S)"
mkdir -p security-scan-output/$audit_batch_id
```

### 1.2 契约提取 + 条件规则加载

- **提取契约摘要**：从 anti-hallucination-rules.yaml 中提取 4 行契约核心，用于 agent 提示词注入（Ref: `references/contracts/anti-hallucination-contract.md`）

**条件规则加载**（此时已有文件列表，可精确判断）：

- 检查认证风险信号（Controller/Handler/路由定义、权限检查）
- 如果触发：Read `$plugin_root/resource/logic-audit-rules/authentication-bypass.yaml`
- 检查自定义规则：`$plugin_root/resource/custom/*.yaml`
- 将已加载的规则写入 `stage1-context.json` 的 `auditRules` 字段

### 1.3 决策分流

使用阶段 0.3 确定的 `hasCodeChanges` 直接分流：

```
hasCodeChanges = true?
  └─ true  → 完整 diff 流水线（含关联文件分析）→ 1.3a
  └─ false → 纯配置/依赖变更快速通道 → 1.3b
```

#### 1.3a 完整 diff 流水线（hasCodeChanges = true）

通过 Task 后台模式**同时并行**启动：
- **quick-scan** -- 对变更文件执行模式扫描
- **recon-deep** -- 对变更文件做入口点/端点分析 + **影响范围扩展**（见下方「变更影响范围扩展」）

**变更影响范围扩展（关联文件分析）**——diff 模式的核心差异化能力：

在 recon-deep 中增加**显式的影响范围分析**步骤，解决关联文件分析依赖隐式 LSP 行为的问题。

**执行策略**（在 recon-deep 的端点分析之后）：

```
对每个变更的代码文件：
  1. LSP findReferences → 找到所有直接引用该文件导出符号的文件
  2. LSP incomingCalls → 找到所有调用变更方法的上游文件（1 层）
  3. 将这些文件标记为 relatedFiles，写入 stage1-context.json

对 relatedFiles 的扫描策略（注入 deep-scan）：
  - 不做完整 D1-D9 扫描
  - 仅检查：变更方法的调用点上下文（±30 行）
  - 重点关注：权限检查、输入校验、数据流传递
  - 预算控制：关联文件分析不超过 deep-scan 总预算的 20%
```

**提示词注入 recon-deep**：
```
[影响范围分析] enabled
[变更文件] {changedCodeFiles}
[输出] stage1-context.json > relatedFiles[]
```

**提示词注入 deep-scan**：
```
[关联文件] stage1-context.json > relatedFiles[]
[关联文件扫描策略] focused（仅检查调用变更方法的上下文 ±30 行）
[关联文件预算上限] 20%
```

#### 1.3b 纯配置/依赖变更快速通道（hasCodeChanges = false）

当仅有配置/依赖文件变更时，启用精简流水线。**必须向用户输出快速通道通知**：

```
  [v] 探索完成：变更文件 {n} 个（均为配置/依赖文件，无代码变更）
  ⚡ 启用配置快速通道：仅执行密钥检测 + CVE 扫描 + 配置基线检查
```

通过 Task 后台模式启动：
- **quick-scan** -- 仅执行 D1（密钥）+ D2（CVE）+ D3（配置基线），跳过 D4（Sink 定位）和 D5（防御指标）

```
提示词注入 quick-scan：
[扫描范围] config-only
[跳过维度] D4, D5
[原因] 无代码变更，不需要 Sink 定位和防御指标
```

> **不启动** recon-deep 和 deep-scan（无代码变更时不需要端点分析和 LSP 追踪）。

快速通道的后续流程：跳转到「2.4 校验产物完整性」，仅校验 quick-scan → 合并 → 阶段 3。
verification 使用**批量模式（12t）**，仅执行代码存在性校验 + 置信度评分，跳过攻击链验证/对抗审查/全局审计质量评估。

### 1.4 等待 recon-deep + 加载框架知识（仅完整流水线）

按 `references/strategies/orchestrator-rules.md > 等待期轮询协议` 轮询 recon-deep 状态。完成条件满足后，追加数据到 `stage1-context.json`（含 `relatedFiles` 字段）。

**按技术栈加载框架安全知识**（Ref: `references/strategies/orchestrator-rules.md > 按技术栈加载框架安全知识`）：基于 recon-deep 产出的 projectInfo 中的 framework 信息加载对应知识文件。

### 1.5 探索检查点（仅完整流水线）

> Ref: `references/strategies/orchestrator-rules.md > 检查点逻辑 > 探索检查点`

在 recon-deep 完成后执行探索检查点。

### 并行时间线

**完整 diff 流水线（hasCodeChanges = true）：**
```
阶段 0 → 插件授权 + LSP 探活 + git diff 文件分类 + 模式确认
阶段 1 → 1.2 契约提取 + 规则加载
      → 1.3a quick-scan + recon-deep(含影响范围分析) (并行启动)
           → 1.4 等待 recon-deep + 加载框架知识
           → 1.5 探索检查点
```

**纯配置快速通道（hasCodeChanges = false）：**
```
阶段 0 → 插件授权 + LSP 探活 + git diff 文件分类（自动识别配置快速通道）
阶段 1 → 1.3b quick-scan(D1+D2+D3 only)
      → 等待 quick-scan → 2.4 校验 → 2.5 合并 → verification(批量, 12t) → 阶段 3
```

## 阶段 2：扫描 + 流式验证

> 进度输出参见 `references/strategies/orchestrator-rules.md > 进度输出`

### 2.1 启动 deep-scan（在 recon-deep 完成后）

通过 Task 后台模式启动：
- **deep-scan** -- 仅在 `hasCodeChanges = true` 时启动

### 2.2 启动流式 verification

**不等待 Stage 2 全部完成**。在 deep-scan 启动后，立即启动：
- **verification（流式模式）** -- 流式验证 findings

### 2.3 等待全部完成

按 `references/strategies/orchestrator-rules.md > 等待期轮询协议` 分别轮询 quick-scan、deep-scan（如已启动）、verification（如已启动）的状态。各 agent 完成条件满足后打印摘要。

### 2.4 校验阶段 2 产物完整性（强制）

在进入合并前，必须先确认实际需要的 agent 已完成落盘：

- `hasCodeChanges = true`：

```bash
python3 "$plugin_root/scripts/checkpoint_verify.py" verify-artifacts \
  --batch-dir security-scan-output/{batch} \
  --agents quick-scan,deep-scan,verification
```

- `hasCodeChanges = false`：

```bash
python3 "$plugin_root/scripts/checkpoint_verify.py" verify-artifacts \
  --batch-dir security-scan-output/{batch} \
  --agents quick-scan
```

处理规则：
- `status: "ok"`：继续 2.5
- `status: "fail"`：仅允许重试缺失 agent 1 次
- 重试后仍失败：终止本批次，禁止编排器手工补扫

### 2.5 合并扫描结果

```bash
python3 "$plugin_root/scripts/merge_findings.py" merge-scan \
  --batch-dir security-scan-output/{batch}
```

### 2.6 合并验证结果

```bash
python3 "$plugin_root/scripts/merge_findings.py" merge-verify \
  --batch-dir security-scan-output/{batch}
```

### 2.7 扫描检查点（Ref: `references/strategies/orchestrator-rules.md > 检查点逻辑`）

### 2.8 跨仓库检查（Ref: `references/strategies/orchestrator-rules.md > 检查点逻辑`）

## 阶段 3：内联修复 + 报告

### 3.1 内联修复

> **不启动独立 Agent**。编排器直接执行修复逻辑。

修复资格：`ahAction=pass` 且 `RiskConfidence>=90` 且 `challengeVerdict` 为 confirmed/escalated。

对每个符合资格的 finding：
1. Read 漏洞上下文（Sink ±20 行）
2. Grep 项目安全组件
3. 生成 originalCode + fixedCode
4. 写入 `agents/remediation.json`

### 3.2 报告生成

```bash
python3 "$plugin_root/scripts/generate_report.py" \
  --input security-scan-output/"$audit_batch_id" \
  --audit-batch-id "$audit_batch_id" \
  --format html \
  --output security-scan-output/"$audit_batch_id"/security-scan-report.html
```

### 3.3 输出报告

> Ref: `references/strategies/post-audit-workflow.md` > Audit Summary Template, Report Upload

Diff 特有内容：
- 范围：`Changed files: {n}`
- 批次前缀：`diff-audit-`

### 3.4 执行用户选择
> Ref: `references/strategies/post-audit-workflow.md` > User Interaction

## Agent 团队概览

### 完整 diff 流水线（hasCodeChanges = true）

```
diff command (up to 4 agents)
  阶段 0: 插件授权 + LSP 探活 + git diff 文件分类 + 模式确认
  阶段 1: quick-scan + recon-deep(含影响范围分析) 并行
  阶段 2: deep-scan(含关联文件聚焦分析) + verification(流式) 并行
  阶段 3: 内联 remediation + 报告 + 用户交互
```

### 纯配置/依赖快速通道（hasCodeChanges = false）

```
diff command (1-2 agents)
  阶段 0: 插件授权 + LSP 探活 + git diff 文件分类（自动识别配置快速通道）
  阶段 1: quick-scan(D1+D2+D3 only)
  阶段 2: verification(批量, 12t, 仅代码存在性校验+置信度评分)
  阶段 3: 内联 remediation + 报告 + 用户交互

  预计耗时：≈10-12t（比完整流水线 35-55t 提速 ≈70-80%）
```

## 调度器上下文控制

> Ref: `references/strategies/orchestrator-rules.md`

## 注意事项

- 必须在 git 仓库中运行
- 依赖文件变更会触发 quick-scan CVE 检测（D2）
- 配置基线仅在配置文件变更时触发
- 所有 agent 使用 Task 后台模式
- 模式扫描与语义分析并发执行
- 规则按需 Read，不批量注入到提示词中
- diff 模式无需 recon-lite（文件列表来自 git diff）
- `hasCodeChanges = false` 时跳过 D4/D5/recon-deep/deep-scan，启用快速通道
- `hasCodeChanges = true` 时通过影响范围分析显式扩展扫描范围到关联文件
