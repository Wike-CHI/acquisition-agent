# 架构模式说明：单智能体串行 vs 多智能体并行（测试报告 10 对齐）

> **版本**：1.18.9  
> **结论**：本技能包 **默认**仍为 **S0–S6 线性阶段**；**多 Writer 并行**为 **显式启用** 的增强模式，由宿主 Agent Teams + 本书 `.fbs/` 工件共同承载，而非内置全自动 DAG 引擎。

---

## 1. 模式对照

| 维度 | 单会话串行（默认） | 多成员并行（显式） |
|------|-------------------|-------------------|
| 触发 | 用户未组团队、单助手写书 | 用户创建多成员团队 + team-lead |
| 共享状态 | 会话上下文 | **必须**初始化 `.fbs/`（`init-fbs-multiagent-artifacts.mjs`） |
| 依赖与进度 | 顺序隐含 | `chapter-dependencies.json` + `sync-book-chapter-index.mjs` |
| G4 引用 | 随用户「启用合规检查」 | **默认启用**（见 `quality-check.md` §G） |
| CX 跨章审校 | S5 前可选 | **合稿后必须** |

---

## 2. 用户 / 主编可述口令（NLU 对齐）

- 「**多路并行写书**」「**多 Writer 并行**」→ 启用并行模式检查清单：`workbuddy-agent-briefings.md` + `.fbs/` 全套。  
- 「**单助手逐章**」→ 不强制 `chapter-dependencies.json`；仍建议 S5 前跑 **CX** 若曾拆章给不同会话。

---

## 3. 与 v2.0 愿景的边界

全自动 DAG 调度、Coordinator/Arbiter **代码内嵌角色**、工作窃取 **不在** 1.18.x 保证范围内；随包提供 **CLI 与文件契约** 降低人工 DAG 成本，见 `doc-code-consistency.md`。

---

## 4. `project-config.json` 模式开关（显式切换）

初始化脚本写入的 **`.fbs/project-config.json`** 含顶层字段：

| 字段 | 建议值 | 含义 |
|------|--------|------|
| `multiAgentMode` | `parallel_writing` | 多 Writer 并行：必须维护 `.fbs/` 台账 + 依赖门禁 |
| `multiAgentMode` | `single_writer` | 单会话逐章：仍建议 S5 前 **CX**；不强制 `chapter-dependencies.json` |

**注意**：该字段供 **人读与工具读**；宿主不会自动改模式。切换时由主编改 JSON 并在会话中声明。

---

## 5. 文档级 Coordinator / Arbiter

可复制任务模板见 [`coordinator-arbiter-briefs.md`](../01-core/coordinator-arbiter-briefs.md)（与测试报告 07·10 对齐）。
