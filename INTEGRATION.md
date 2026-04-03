# 🔌 多平台接入指南 (Integration Guide)

> 本仓库的技能集群（skills/）是**平台无关**的：知识（Markdown）+ 指令（SKILL.md）+ 脚本（PowerShell/Python/Bash）。
> 任何能读文件的 AI Agent 都能消费这些技能，区别只在于自动化程度不同。

---

## 技能结构速览

```
skills/<skill-name>/
├── SKILL.md              ← 核心指令文件（frontmatter 元数据 + Markdown 正文）
├── scripts/              ← 可执行脚本（.ps1 / .py / .sh）
├── references/           ← 参考文档、模板、知识库
└── assets/               ← 图片、资源文件（可选）
```

**SKILL.md frontmatter 说明：**

```yaml
---
name: skill-name
version: 1.0.0
description: 技能描述（含触发词）
triggers:                 # 触发关键词
  - 找客户
  - 客户搜索
dependencies:             # 依赖的其他技能
  - company-research
---
```

---

## 各平台接入方式

### 1. WorkBuddy（原生支持）

最完整的使用体验，自动路由 + 触发词匹配。

```bash
# 技能目录
~/.workbuddy/skills/<skill-name>/

# 使用方式
# 直接对话即可，触发词自动匹配路由
# 也可手动引用：@skill://skill-name
```

**特性**：skill:// 协议引用、自动触发词路由、子技能调度、dist 副本同步。

---

### 2. Claude Code

通过 CLAUDE.md 引入技能指令。

**步骤：**

```bash
# 1. Clone 仓库到项目目录
git clone https://github.com/Wike-CHI/acquisition-agent.git

# 2. 在项目根目录创建/编辑 CLAUDE.md
```

**CLAUDE.md 示例：**

```markdown
# 项目说明

本仓库是红龙获客系统技能集群。

## 技能使用

当用户请求涉及以下场景时，读取对应技能的 SKILL.md 作为执行指令：

| 场景 | 技能路径 |
|------|---------|
| 获客流程 | skills/global-customer-acquisition/SKILL.md |
| 客户搜索 | skills/linkedin/SKILL.md |
| 企业背调 | skills/company-research/SKILL.md |
| 开发信 | skills/cold-email-generator/SKILL.md |
| 邮件发送 | skills/email-sender/SKILL.md |
| 报价 | skills/honglong-products/SKILL.md |

### 使用规则

1. 收到匹配请求时，先读取对应 SKILL.md
2. 严格按 SKILL.md 中的指令执行
3. 需要脚本支持时，执行 scripts/ 目录下的对应脚本
4. 参考资料在 references/ 目录

### 核心铁律

- 邮箱铁律：必须用决策人邮箱，禁用 info@
- ICP 评分 ≥ 75 分才发邮件
- 开发信评分 ≥ 9.0 分才发送
- 禁止矿业客户
```

**限制**：无自动触发词路由，需在 CLAUDE.md 中手动映射。

---

### 3. OpenClaw / OpenSpace

OpenClaw 有自己的 skill 注册机制，可适配接入。

**步骤：**

```bash
# 1. Clone 仓库
git clone https://github.com/Wike-CHI/acquisition-agent.git

# 2. 将 skills/ 目录注册为 skill 源
# 在 OpenClaw 配置中指定 skill_dirs 指向 clone 的 skills/ 目录
```

**配置示例：**

```json
{
  "skill_dirs": [
    "/path/to/acquisition-agent/skills"
  ]
}
```

**或使用 OpenSpace MCP 接入：**

```
# 通过 MCP execute_task 的 skill_dirs 参数
execute_task(
    task="搜索LinkedIn上的木工设备买家",
    skill_dirs=["/path/to/acquisition-agent/skills"]
)
```

**特性**：支持 skill 注册、BM25 + embedding 搜索、自动进化（FIX/DERIVED/CAPTURED）。

---

### 4. Codex (OpenAI)

Codex 没有原生 skill 概念，但可以通过指令文件引入。

**步骤：**

```bash
# 1. Clone 仓库
git clone https://github.com/Wike-CHI/acquisition-agent.git

# 2. 在 Codex 项目配置中指定 instructions 文件
```

**AGENTS.md 或 codex.md 示例：**

```markdown
# 获客系统 Agent

本项目包含自动化获客技能集群，位于 skills/ 目录。

## 执行规则

- 收到获客相关请求时，读取 skills/global-customer-acquisition/SKILL.md
- 每个子技能的详细指令在各自的 SKILL.md 中
- 脚本在 scripts/ 子目录，PowerShell 脚本在 Windows 上运行
- 参考资料在 references/ 子目录

## 技能清单

- acquisition-coordinator — 任务编排
- linkedin — LinkedIn 客户搜索
- facebook-acquisition — Facebook 客户搜索
- company-research — 企业背调
- cold-email-generator — 开发信生成
- email-sender — 邮件发送
- honglong-products — 产品资料
```

**限制**：无 skill 路由，需手动指定；脚本执行需要系统权限。

---

### 5. 通用 AI Agent（Cursor / Windsurf / 等）

任何支持项目级指令文件的 IDE Agent 都能用。

**通用做法：**

1. Clone 仓库到 workspace
2. 在项目的指令文件（.cursorrules / .windsurfrules / .aidev 等）中加入技能引用规则
3. Agent 在处理请求时按规则读取对应 SKILL.md

**.cursorrules 示例：**

```
当用户请求涉及"获客"、"找客户"、"开发信"、"背调"等关键词时：
1. 读取 skills/global-customer-acquisition/SKILL.md 获取主入口
2. 根据任务类型读取对应子技能的 SKILL.md
3. 执行时遵循 SKILL.md 中的步骤和铁律
```

---

## 跨平台注意事项

### 脚本兼容性

| 脚本类型 | Windows | macOS/Linux | 说明 |
|---------|---------|-------------|------|
| `.ps1` (PowerShell) | ✅ 原生 | ⚠️ 需 pwsh | 推荐 Windows 环境 |
| `.py` (Python) | ✅ | ✅ | 跨平台，需装依赖 |
| `.sh` (Bash) | ⚠️ 需 WSL/Git Bash | ✅ 原生 | 推荐 Linux/macOS |

### 数据敏感

- `credentials/` 目录**不在此仓库**，凭据由各平台本地管理
- `honglong-products/` 包含公司产品参数，属内部资料
- NAS 连接信息需各平台自行配置

### 同步更新

如果在本仓库外修改了技能文件，需要同步回来：

```bash
# 方式1：直接 PR
fork → 修改 → Pull Request

# 方式2：本地同步（Windows）
.\scripts\sync-to-github.ps1 -CommitMessage "update: 技能描述"
```

---

## 技能快速索引

| 技能 | 用途 | 关键触发词 |
|------|------|-----------|
| global-customer-acquisition | 主入口，统一调度 | 获客、找客户、HOLO |
| acquisition-coordinator | 任务编排分解 | 批量获客、并行搜索 |
| acquisition-evaluator | 质量验收 | 验收、审核、质量控制 |
| acquisition-init | 初始化配置 | 初始化获客系统 |
| acquisition-workflow | 端到端流程 | 完整获客流程 |
| linkedin | LinkedIn 搜索 | LinkedIn、领英 |
| facebook-acquisition | Facebook 搜索 | Facebook、FB |
| company-research | 企业背调 | 背调、公司调研 |
| cold-email-generator | 开发信生成 | 开发信、cold email |
| email-sender | 邮件发送 | 发邮件、SMTP |
| honglong-products | 产品资料 | 产品参数、报价 |
| honglong-assistant | 人格身份 | 红龙小助手 |
| release-manager | 版本发布 | 打包、发布、GitHub同步 |

---

*本文档随技能集群持续更新。最后更新：2026-04-03*
