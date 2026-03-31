# Skill 创建工具 · 产品设计（宿主无关内核 + 能力自动探测）

> **定位**：支撑「用工具创建/升级 Skill」的产品级方案；**内核与具体 IDE/CLI 解耦**，通过**标准化探测与适配层**自动挖掘当前宿主能力。  
> **对齐**：与本包当前实践一致——`SKILL.md` + `references/`、`canonical-paths`、stub 策略、`audit-skill-consistency.mjs`、`package-production.mjs`、[`CodeBuddy Skills 规范`](https://www.codebuddy.cn/docs/cli/skills) 语义。  
> **非目标**：替代宿主官方 Skill 市场后台；不实现大模型训练。

---

## 1. 背景与问题

| 现状 | 痛点 |
|------|------|
| Skill 多靠手工复制目录、改 Frontmatter | 易与 `search-policy`、索引、stub 不同步 |
| CodeBuddy / WorkBuddy / 未来宿主并存 | 工具若写死一家，迁移成本高 |
| 宿主能力差异大（Teams、MCP、记忆路径、工具名） | 创建时无法「按需打开能力」，要么全关要么写假承诺 |

**目标**：用户在同一套「创建向导」里，得到**可上架、可审计、可打包**的 Skill 目录；工具在运行时**自动识别**当前环境能做什么，并**只生成与能力匹配的片段**（可选模块），避免文档越权承诺。

---

## 2. 设计原则

1. **宿主无关内核（Host-Agnostic Core）**  
   - 只依赖：**文件系统、JSON/YAML 解析、可插拔「宿主探测 API」**。  
   - 核心产出物结构固定：`SKILL.md`、`references/`、`LICENSE`（可选）、`assets/`（可选）、`scripts/`（可选），与 [`codebuddy-skill-delivery.md`](./codebuddy-skill-delivery.md) 一致。

2. **能力来自探测，不来自猜测（Discover, Don’t Assume）**  
   - 启动时执行 **Capability Probe Pipeline**，写入结构化 **`host-profile.json`**（可随 Skill 仓库 `.fbs/` 或工具缓存，不入 zip 亦可）。  
   - 向导文案与生成模板**根据 profile 分支**，未探测到的能力**不出现或显式标为不可用**。

3. **规范优先于花哨（Spec-First）**  
   - 生成后默认跑 **`audit-skill-consistency.mjs` 同类规则**（工具内嵌或子进程调用），失败则阻断「完成」或强提示。  
   - 对齐本包：**canonical 路径、S5 与 policy、短指令条数、stub 完整性**等可配置扩展。

4. **渐进式披露（Progressive Disclosure）**  
   - 新手：模板 + Frontmatter + 最小 `references/`。  
   - 进阶：记忆模板、`agents` 片段、Teams 话术块、MCP 声明占位、打包发布。

---

## 3. 用户与场景

| 角色 | 典型目标 |
|------|----------|
| **技能作者** | 从空白或模板生成可维护 Skill，少踩链接与双份文档坑 |
| **企业集成** | 批量生成「行业 Skill」，接入内部 MCP/记忆规范 |
| **FBS 维护者** | 从本仓库「黄金模板」派生子技能（如 QualityChecker），保持审计规则一致 |

**核心场景**

- **S1 新建 Skill**：选类型（通用 / 质检子技能 / 写作扩展）→ 填 name、description、触发词 → 生成目录。  
- **S2 升级 Skill**：导入现有包 → diff Frontmatter 与 policy → 合并 canonical 建议。  
- **S3 打包发布**：调用与 `package-production.mjs` 等价的流水线 → zip + `MANIFEST.json`。  
- **S4 宿主自检**：一键输出「当前环境能力报告」（给运维/作者，非终端读者）。

---

## 4. 总体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Skill Creation Studio                     │
│  (CLI / 桌面 / Web，实现可替换；通过同一 Core API 调用)      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Host-Agnostic Core Engine                    │
│  · 模板引擎（Handlebars/Mustache 类，零宿主 API）               │
│  · 文件布局与命名校验（FBS-BookWriter 规则库可插拔）             │
│  · 一致性规则引擎（audit 规则 JSON 化）                        │
│  · 打包与 MANIFEST                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────────┐
│ Probe Provider│  │ Probe Provider│  │ Probe Provider    │
│  "generic"    │  │ "codebuddy"   │  │ "workbuddy"       │
│  仅 FS+环境变量 │  │ 读标准路径与   │  │ 读 .workbuddy 等  │
│               │  │ 可选 CLI      │  │                   │
└───────────────┘  └───────────────┘  └───────────────────┘
```

- **Core** 不 import 任何宿主 SDK；只认 **`IHostProbe` 接口**返回的数据结构。  
- 新宿主 = 新 Provider + 可选一份 **`probe-hints.yaml`**（路径模式、CLI 探测命令）。

---

## 5. 宿主能力模型（Host Profile Schema）

探测结果落盘为 **`host-profile.json`**（示例字段，可版本化 `schemaVersion`）：

```json
{
  "schemaVersion": "1.0",
  "detectedAt": "ISO8601",
  "hostFamily": "unknown | codebuddy-like | workbuddy-like | custom",
  "skillInstallRoots": [
    { "scope": "project", "path": ".codebuddy/skills", "writable": true },
    { "scope": "user", "path": "~/.codebuddy/skills", "writable": true }
  ],
  "tools": {
    "declared": ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "WebFetch", "WebSearch"],
    "source": "cli-json | env | manual"
  },
  "mcp": {
    "available": true,
    "servers": [{ "name": "...", "tools": ["..."] }]
  },
  "memory": {
    "userMemoryFile": "~/.codebuddy/CODEBUDDY.md",
    "projectRulesDir": ".codebuddy/rules",
    "supportsConditionalRules": true,
    "supportsAutoMemory": false
  },
  "multiAgent": {
    "subAgents": { "configDir": ".codebuddy/agents", "supported": true },
    "agentTeams": { "supported": true, "notes": "自然语言创建团队" }
  },
  "cli": {
    "binary": "codebuddy",
    "version": "2.66.x",
    "skillsCommand": "/skills"
  }
}
```

**设计要点**

- **`hostFamily` 仅作 UI 默认值**，逻辑分支以 **布尔/路径是否存在** 为准，避免「名字对但版本行为变」的硬编码。  
- **`tools.declared`**：优先从宿主提供的**机器可读清单**获取（若宿主无 API，则向导内**勾选 + 保存到 profile** 作为半自动探测）。

---

## 6. 自动探测流水线（Capability Probe Pipeline）

按顺序执行；任一步失败**降级**而非整体失败。

| 阶段 | 动作 | 宿主无关实现 |
|------|------|----------------|
| **P0** | 解析环境变量（如 `CODEBUDDY_*`、`WORKBUDDY_*`、通用 `SKILL_ROOT`） | 纯字符串 |
| **P1** | 探测常见技能根路径是否存在、可写 | FS stat |
| **P2** | 若配置 `probe.cliCommand`，执行 `host probe --json` 类命令并解析 stdout | `child_process`，超时与沙箱由 Studio 配置 |
| **P3** | 扫描 `mcp.json` / 合并路径（WorkBuddy、CodeBuddy 各自 Provider 实现路径列表） | FS + JSON |
| **P4** | 检测 `agents/`、`teams` 相关目录或文档标记 | FS glob |
| **P5** | 可选：读取当前工作区已加载 Skill 列表（若宿主写入了 project state 文件） | Provider 特化 |

**输出**：`host-profile.json` + **人类可读 `HOST_CAPABILITIES.md`**（生成在开发者目录，不进入 Skill zip，除非作者勾选「附带环境说明」）。

---

## 7. Skill 创建向导（与 FBS 当前版本对齐的生成策略）

### 7.1 模板分层

| 层 | 内容 | 是否依赖宿主 |
|----|------|----------------|
| **L0 最小 Skill** | `SKILL.md` + 空 `references/` + `LICENSE` | 否 |
| **L1 FBS 对齐包** | 复制本仓库规范子集：`spec-sync-checklist`、`canonical-paths`、审计脚本占位 | 否 |
| **L2 检索型 Skill** | `search-policy.json` 模板 + §3.0.5 风格的工作流节选 | 否 |
| **L3 记忆协同** | `CODEBUDDY.snippet`、条件规则模板；**仅当** `memory.supportsConditionalRules` | 依赖 profile |
| **L4 多智能体** | `workbuddy-agent-briefings` 类片段 / `agents` YAML 草稿；**仅当** `multiAgent` 真 | 依赖 profile |
| **L5 MCP** | Skill 正文增加「可调用 MCP 工具」说明 + `allowed-tools` 建议；**仅当** `mcp.available` | 依赖 profile |

### 7.2 Frontmatter 生成规则

- **必填**：`name`、`description`（含触发词段）。  
- **`allowed-tools`**：默认 **交集**（模板允许 ∩ `tools.declared`）；若探测不到工具列表，则生成**保守默认**并附注释「请与宿主核对」。  
- **`user-invocable` / `context: fork`**：向导问题驱动，**不**自动写 fork，除非用户选「仅调研子 Skill」。

### 7.3 与本包一致的「防漂移」生成物

新建 Skill 时**可选勾选**（默认推荐开启）：

- 生成 **`references/05-ops/spec-sync-checklist.md`**（缩小版，指向本 Skill 的 SKILL 章节锚点）。  
- 生成 **`scripts/audit-skill-consistency.mjs`** 的**精简版**或 **git submodule / npm 依赖**说明，指向 FBS 母版规则版本号。  
- 根级 **stub 策略说明**一页纸，避免作者再制造双份全文。

---

## 8. 与「充分挖掘宿主能力」的衔接（不做宿主插件也能做的事）

| 宿主能力 | 无原生 API 时的挖掘方式 | 生成侧利用 |
|----------|-------------------------|------------|
| 工具白名单 | 用户粘贴 `/skills` 截图 **OCR/手工** → 结构化录入；或导入宿主导出的 JSON | 写 `allowed-tools`、文档「可用工具」表 |
| MCP | 读 `mcp.json` | Skill 内增加「推荐 MCP 场景」段落；可选 `allowed-tools` 扩展说明 |
| 记忆 | 探测 `CODEBUDDY.md` / `.codebuddy/rules` | 一键生成书项目记忆安装命令（类似 `apply-book-memory-template` 文档链） |
| Agent Teams | 探测文档或目录 | 预置「可复制话术」Markdown 块，与 FBS `workbuddy-agent-briefings` 同构 |
| 子代理 | 探测 `agents/` | 生成 `agent-name.md` 草稿：`description`、`tools`、`skills` 字段 |

**原则**：**探测到则生成「启用型」内容；探测不到则生成「占位 + 条件注释」**，并在 UI 标明「当前环境未验证」。

---

## 9. 核心交互流程（线框级）

### 9.1 首次启动

1. 欢迎页 → **「检测环境」** / **「跳过（离线）」**。  
2. 检测完成 → 展示 **能力卡片**（可写技能目录、MCP、记忆、多智能体、已声明工具）。  
3. **「创建新 Skill」** 进入向导。

### 9.2 创建向导（6 步）

1. **元数据**：名称、描述、触发词、语言。  
2. **类型**：通用 / 质检子技能 / 写作类 / 从 FBS 模板派生。  
3. **工具与权限**：基于 profile 勾选；展示与宿主声明的冲突提示。  
4. **模块**：检索策略、记忆、多智能体、MCP 段落（按 profile 灰显不可用项）。  
5. **预览**：目录树 + `SKILL.md` diff。  
6. **校验与写出**：跑规则引擎 → 选择安装根（project/user）→ 写入磁盘 → 可选 **打 zip**。

### 9.3 升级与合并

- 导入现有 `FBS-BookWriter` 类包 → 解析 Frontmatter 与 `search-policy.json` → 与模板**规则集** diff → 输出合并建议（不自动覆盖，**三栏合并 UI**）。

---

## 10. 规则引擎（与 audit 脚本同构）

将 `audit-skill-consistency.mjs` 中的检查**抽为声明式规则**（示例）：

```yaml
rules:
  - id: policy-s5-in-stages
    when: fileExists("references/05-ops/search-policy.json")
    assert: jsonPath("$.mandatoryWebSearchStages").contains("S5")
  - id: skill-mentions-s5
    when: fileExists("SKILL.md")
    assert: fileContains("SKILL.md", "S5")
```

- **内核**解释 YAML，**宿主无关**。  
- **FBS 扩展包**可发布 `fbs-skill-rules@x.y.z` 供工具拉取。

---

## 11. 安全与合规

- **探测命令**默认只读；执行外部 CLI 需用户确认 + 超时 + 输出大小上限。  
- **写出路径**限制在用户选定根下，**禁止**默认写到系统目录。  
- **不上传**项目源码到云端（除非显式开启「云模板」功能）。  
- 生成内容带 **「能力边界」页**，与 [`doc-code-consistency.md`](./doc-code-consistency.md) 精神一致。

---

## 12. 里程碑（产品交付节奏）

| 阶段 | 交付 | 价值 |
|------|------|------|
| **MVP** | Core + Generic Probe + L0/L1 模板 + 磁盘写出 + zip | 任意环境可生成可装包 |
| **M1** | CodeBuddy-like / WorkBuddy-like Provider + profile 驱动 UI | 自动挖掘主流宿主 |
| **M2** | 声明式规则引擎 + FBS 规则包 | 与母仓库审计同源 |
| **M3** | 升级合并 + 子技能派生（QualityChecker） | 企业级维护 |

---

## 13. 成功指标（KPI）

- **生成包一次通过率**：首次 `audit`（或等价规则）通过率 ≥ 90%。  
- **宿主切换成本**：换新宿主仅换 Provider，**0 改 Core**。  
- **文档越权率**：生成 Skill 中「声称宿主必支持」的句段，**未经 profile 证实**的出现率 → 0（改为条件式表述）。

---

## 14. 与当前 FBS-BookWriter 版本的显式对齐点

| 本包实践 | 在产品中的体现 |
|----------|----------------|
| `canonical-paths` + 根级 stub | 模板库内置「stub + canonical」布局生成器 |
| `spec-sync-checklist` | 新建向导默认勾选生成缩小版 |
| `audit-skill-consistency.mjs` | 规则引擎同源或子进程调用 |
| `package-production.mjs` | 「发布」步骤对等实现 |
| S5 / `search-policy` / 单一联网禁令 | 「检索型模板」默认带 policy 片段与 SKILL 段落 |
| `task-role-alias` / Teams 话术 | 「多智能体模块」可插入块 |
| `INSTALL.md` + `MANIFEST.json` | zip 流水线标配 |

---

## 15. 附录：开放接口草案（实现参考）

```ts
interface IHostProbe {
  readonly id: string;
  probe(ctx: { cwd: string; home: string }): Promise<HostProfile>;
}

interface SkillGenerator {
  generate(opts: {
    templateId: string;
    manifest: SkillManifest;
    profile: HostProfile;
    outDir: string;
  }): Promise<GenerationResult>;
}
```

---

*文档版本：1.0.0*  
*关联：[`codebuddy-skill-delivery.md`](./codebuddy-skill-delivery.md) · [`canonical-paths.md`](./canonical-paths.md) · [`doc-code-consistency.md`](./doc-code-consistency.md)*
