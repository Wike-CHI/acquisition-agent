# WorkBuddy × FBS-BookWriter：首次使用与环境迭代 — 分级优化策略

> **版本**：与 **`search-policy.json` `version`** 对齐（当前 **1.18.5**）。  
> **状态**：用户已确认 Tier 0–2 与隐私边界；**Tier 3** 视 WorkBuddy 后续是否提供版本/能力注入再定。  
> **关联**：[`workbuddy-user-memory-strategy.md`](./workbuddy-user-memory-strategy.md) · [`workbuddy-skill-foundation.md`](./workbuddy-skill-foundation.md) · [`topic-consistency-gate.md`](./topic-consistency-gate.md)

---

## 1. 两类核心场景（为何单独成策）

### 1.1 首次使用（冷启动）

**范围示例**：用户**第一次**在本机/本工作区选用本 Skill、**第一次**开写一本书、本书目录尚无 S0 产出或 `.fbs` 账本。

**痛点**：模型不知宿主侧 `USER.md`、工作区 `MEMORY.md` 等 → 易重复追问或话术冰冷；若过度依赖记忆又易与未锁定主题混淆。

**目标**：在**不破坏主题锁 P0** 前提下，**一次性、有界**拉齐进入前上下文。

### 1.2 每次使用时的「环境变化**

**范围示例**：WorkBuddy 升级、记忆路径变化、工作区布局调整。

**目标**：用**可降级**方式感知差异（路径存在性 + 策略版本），**stderr 提示**建议重跑 digest，而非静默失败。

---

## 2. 设计原则（与 1.18.x 对齐）

| 原则 | 说明 |
|------|------|
| **主题锁优先** | 记忆增强不绕过 S0/S1 与 C0-4 / GATE。 |
| **opt-in** | digest / 环境快照均为显式 CLI 或 `init-project-memory` 开关。 |
| **演进容忍** | 策略节在 `search-policy.json`；路径列表与 `userMemoryIntegration` 对齐。 |
| **环境快照隐私** | **仅**路径存在性布尔 + `search-policy.version`；**禁止**对 `USER.md` 等做**内容 hash**。 |

---

## 3. 分级策略与落地状态

### Tier 0 — 规范与话术（**已落地**）

| 项 | 落地位置 |
|----|----------|
| 首次写书 / 冷启动 | `SKILL.md` **「技能加载后的行为约定」→「首次写书（冷启动）」** |
| 记忆边界 | [`workbuddy-user-memory-strategy.md`](./workbuddy-user-memory-strategy.md) |

### Tier 1 — 有界摄取与启发字段（**已落地 · 1.18.2**）

| 项 | 落地位置 |
|----|----------|
| digest + `bookContextHeuristics` | `integration/lib/WorkbuddyMemoryDigest.js`（`firstRunBookProject` 等） |
| CLI | `integration/workbuddy-memory-digest.mjs` |
| 初始化串联 | `scripts/init-project-memory.mjs`（`--with-workbuddy-hint`） |
| 工作流提示 | `integration/workflow-progressor.mjs`（冷启动与脚本索引） |

### Tier 2 — 环境指纹与 diff（**已落地 · 1.18.2**）

| 项 | 落地位置 |
|----|----------|
| 策略节 | `search-policy.json` → **`environmentSnapshot`** |
| 库 | `integration/lib/WorkbuddyEnvironmentSnapshot.js` |
| CLI | `integration/workbuddy-environment-snapshot.mjs`（`--write` 写入 `.fbs/workbuddy-environment.json`，stdout 含 `diff`） |
| 初始化串联 | `init-project-memory.mjs`（`--with-environment-snapshot`；可与 `--workbuddy-hint-workspace-only` 联动 `--no-user-probes`） |

**不做**：Node 版本写入快照（保持「仅路径 + 策略版本」）；不稳定 JSON 状态文件解析。

### Tier 3 — 宿主契约（**待定**）

若 WorkBuddy 提供 Skill 可读 **版本/能力块**，优先消费官方字段，Tier 2 作兜底；本包保留 CLI 契约供集成方对接。

---

## 4. 首次使用：推荐用户旅程

1. 首响合并主题 + S0 说明 + **一句**可选 digest（见 `SKILL.md`）。  
2. 用户同意 → `workbuddy-memory-digest` 或 `init-project-memory ... --with-workbuddy-hint`。  
3. 主编审阅 `.fbs/workbuddy-memory-digest.json` 再注入。  
4. **并行完成 S0 主题锁定**（铁律与 GATE）。

---

## 5. 环境迭代：探测范围（实际实现）

| 探测对象 | 方式 | 说明 |
|----------|------|------|
| 本书 `.fbs`、`.workbuddy/memory`、`MEMORY.md` | `existsSync` | 与 `userMemoryIntegration.workspaceMemory` 对齐 |
| `%USERPROFILE%\.workbuddy` 及 USER/BOOTSTRAP/IDENTITY/SOUL | `existsSync` | **仅存在性**；**无**内容 hash |
| 技能策略版本 | `search-policy.version` | 与上次快照比对 |

---

## 6. 用户已确认事项（归档）

1. Tier 0：`SKILL.md` 专节 — **是**  
2. Tier 1：digest 启发字段 — **是**  
3. Tier 2：环境快照 CLI — **是**  
4. 隐私：仅路径存在性 + 策略版本 — **是**  
5. 宿主能力注入 — **不确定**（Tier 3 暂缓）  
6. 发版号 — **1.18.5**

---

## 7. 维护者检查清单

- 改 `userMemoryIntegration` 路径列表时 → 核对 `WorkbuddyEnvironmentSnapshot.collectProbes` 是否仍从 policy 读取同一套相对路径。  
- 发版 → `search-policy.version`、`quality-S.md` frontmatter、`promise-code-user-alignment.md` 修订表、`audit-skill-consistency.mjs`（默认含 **`scan-packaging-pii-patterns.mjs --fail`**）；`package-production.mjs` 预检即调用前者。  
- 短指令条数变更 → `section-4-commands.md` + `SKILL.md` + audit 中 **64** 对齐。

---

## 8. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-03-29 | 初稿：分级策略研究。 |
| 2026-03-29 | **v1.18.2**：用户确认 Tier 0–2；落地 digest 启发字段、环境快照 CLI、SKILL 冷启动专节、审计与索引同步。 |
| 2026-03-29 | **v1.18.3**：digest/快照 `--write` 默认路径脱敏；`PathRedaction`；随包隐私扫描与 audit/package 默认串联。 |
| 2026-03-29 | **v1.18.5**：SKILL `version`/`author`/`homepage` 与 CodeBuddy Skills 对齐。 |
