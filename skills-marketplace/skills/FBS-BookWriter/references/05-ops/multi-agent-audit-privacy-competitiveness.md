# 多路并行智能体审计：一致性 · 用户无关性 · 隐私 · 防卡顿 · 体验 · 竞争力

> **版本**：1.1.0（与技能包 **v1.18.5+** 对齐）  
> **性质**：**审计报告 + 综合优化策略**；§6 所列 P1/P2 **已批准落地**（见下表与修订记录）。  
> **关联**：[`doc-code-consistency.md`](./doc-code-consistency.md) · [`promise-code-user-alignment.md`](./promise-code-user-alignment.md) · [`global-delivery-consistency.md`](./global-delivery-consistency.md) · [`workbuddy-user-memory-strategy.md`](./workbuddy-user-memory-strategy.md)

---

## 1. 多路并行「智能体」分工（可人工或宿主多 Task 执行）

以下为 **五条并行审计流**，共享同一仓库快照；汇合点为本节检查表与 §3 发现项。宿主可将每条流映射为独立子任务（话术骨架见 [`workbuddy-agent-briefings.md`](../01-core/workbuddy-agent-briefings.md)）。

| 代号 | 关注点 | 主要证据源 | 产出 |
|------|--------|------------|------|
| **A-Consistency** | 文档↔代码↔`search-policy` 是否同真 | `audit-skill-consistency.mjs`、`promise-code-user-alignment.md`、`integration/lib/*` | 漂移清单 |
| **B-UserAgnostic** | **禁止**把**个别用户**的路径、昵称、项目名写入**随包**条文/常量 | 全库 `grep`、PR diff、示例 MD/JSON | 违规候选 |
| **C-Privacy** | 日志/JSON/文档是否泄露本机路径或可归因 PII | `WorkbuddyMemoryDigest`、`workbuddy-environment-snapshot`、案例库 | 风险分级 |
| **D-LatencyUX** | 防卡顿、心跳、长静默预告是否闭环 | `SKILL.md` §0、`section-3-workflow.md` S3/S4、`SearchBundle`、`build.mjs` | 缺口 |
| **E-Compete** | 相对泛化「写书助手」的**可验证差异点**是否写清 | `SKILL.md`、质量链、WorkBuddy 策略、CLI 矩阵 | 对外一句话+证据链 |

**汇合规则**：任一流发现 **P0**（安全/隐私/错误承诺）→ **阻断发版**直至修复或文档降级。

---

## 2. 本轮仓库扫描结论（证据摘要）

**扫描范围**：`e:\fbs76\FBS-BookWriter\dist\FBS-BookWriter-skill`（生产技能包根）内 `*.md`、`*.js`、`*.mjs`、`*.json`（抽样模式 + 关键词）。

| 维度 | 结论 |
|------|------|
| **硬编码用户目录/UID** | **未发现** 如 `C:\Users\10171`、`D:\DU`、固定用户名等写入仓库条文（关键词检索无命中）。 |
| **`os.homedir()`** | 仅见于 `workbuddy-memory-digest.mjs`、`workbuddy-environment-snapshot.mjs` 的**运行时默认**，属合理用途；**不**写入技能包静态文件。 |
| **绝对路径进入随包产物** | **设计行为**：digest / 环境快照 JSON 含 `absolutePath`、`bookRoot` 等，**已**在 digest `warnings` 中提示脱敏；**仍属 P1 产品风险**（见 §3）。 |
| **防卡顿文档链** | `SKILL.md` §0、`section-3-workflow` S3/S4、`global-delivery-consistency` §4.1、`SearchBundle` 15s 超时、`build.mjs` `[S4/build]` — **链条闭合**。 |
| **全局一致性已知残留** | `global-delivery-consistency.md` §3 已列 **P2** 历史编码损坏、根级与子目录 **镜像重复**；**不阻塞**当前 zip，但影响「通读体验」。 |

---

## 3. 发现项与分级（问题清单）

> **2026-03-29**：下表 P1/P2 原始结论为**审计当时**快照；对应整改已在 **技能包 v1.18.3** 与 **§6** 落地（默认脱敏、`scan-packaging-pii-patterns.mjs`、audit 串联、对外模板 §2.4、NLU、`CHECKLIST` §3.3、全局稿中文导航）。本表保留作**历史语境**。

### P0 — 无（当前扫描未触发阻断级）

### P1 — 建议在下一版优先处理（审计归档；多数已闭合见 §6）

| ID | 问题 | 影响 | 建议方向（待批） |
|----|------|------|------------------|
| **P1-01** | digest / 环境快照 **默认输出明文绝对路径** | 用户误提交仓库或转发 JSON 时 **隐私泄露** | CLI 增加 **`--redact-paths`**（哈希或相对化 + 保留 basename）；默认行为变更需你拍板 |
| **P1-02** | **无自动化**「发版前扫描用户路径模式」 | 维护者会话粘贴路径入 PR 时 **B-UserAgnostic** 失效 | `scripts/scan-packaging-pii-patterns.mjs`（regex：`Users\\\\[^\\\\]+`、`/home/[^/]+` 等）+ 可选接入 `package-production.mjs` |
| **P1-03** | 竞争力 **对外叙事**分散在多文档 | 上架/商务 **一句话差异**不醒目 | 在 [`external-visible-release-template.md`](./external-visible-release-template.md) 或单列 **「可验证差异清单」**（主题锁、C0-4、digest、环境指纹、质检 CLI）— **以文档为主** |

### P2 — 体验与完整性（审计归档；对应项见 §6）

| ID | 问题 | 建议 |
|----|------|------|
| **P2-01** | `global-research-scenario.md` 等历史编码损坏 | 修复或 **stub + canonical** 指向可读替代（与 `global-delivery-consistency` §3 一致） |
| **P2-02** | NLU 未单列「卡住/没反应」**降级话术**与宿主 UI 协同 | `section-nlu.md` 增补 **STATUS / 进度焦虑** 类意图与 **心跳** 对齐 |
| **P2-03** | `integration/CHECKLIST.md` 与最新 CLI 矩阵 | 定期与 `section-4-commands.md` **64 条** 对表 |

### P3 — 竞争力增强（战略）

| ID | 方向 |
|----|------|
| **P3-01** | 与 WorkBuddy **官方能力**对齐表（版本注入就绪时 Tier 3）— 见 [`workbuddy-first-use-environment-tiered-strategy.md`](./workbuddy-first-use-environment-tiered-strategy.md) |
| **P3-02** | **可选**「审计编排器」：`multiagent-orchestrator` 输出 **五路审计子任务** 提示块（仅模板，不调用外部 API） |

---

## 4. 综合优化策略（目标：功能完整 · 质量 · 竞争力）

1. **一致性**：以 `search-policy.version` 为**单版本锚**；发版必跑 `audit-skill-consistency.mjs` + `package-production.mjs`；重大改 `integration/lib` 必回写 `promise-code` + `efficiency-implementation`。  
2. **用户无关性**：**规范条文与示例**只用占位符（`<本书根>`、`%USERPROFILE%` 文字说明）；**禁止**将真实对话中的路径/人名写入 `references/` 随包文件；PR 层用 **P1-02** 扫描兜底。  
3. **隐私**：默认教育用户「digest/环境 JSON **勿入库**」；产品上提供 **脱敏开关**（P1-01）；宿主侧日志不落全文 `combinedExcerpt`。  
4. **防卡顿 + 体验**：保持 S3/S4 **可见心跳与预告**；集成方必须传 `onProgress` / 转述 `[S4/build]`（已在 `doc-code-consistency` 写明）。  
5. **竞争力**：对外统一 **三条硬证据**：① 主题锁 + C0-4 文档链；② 可运行 `integration/*.mjs` 门禁；③ WorkBuddy 记忆与环境 **opt-in 且可审计**。

---

## 5. 多路审计执行清单（可复制）

- [ ] **A**：`node scripts/audit-skill-consistency.mjs` 通过（已含 `scan-packaging-pii-patterns.mjs --fail`，除非 `--skip-packaging-pii-scan`）；`search-policy` 与 `SKILL` 触发词一致。  
- [ ] **B**：全库检索 `Users\\`、`/home/`、`@`+邮箱样例；检查 `references/` 示例无真实项目名；并与 **`node scripts/scan-packaging-pii-patterns.mjs --fail`** 结果交叉核对。  
- [ ] **C**：运行 digest/snapshot 后检查 JSON 是否需脱敏再分享。  
- [ ] **D**：对照 `section-3-workflow` S3/S4 与 `SearchBundle` 超时配置。  
- [ ] **E**：更新对外模板中「与泛化写书助手的差异」3 条 bullet + 链接到本包 canonical 路径。

---

## 6. 已落地的代码/脚本项（P1 / P2）

| 优先级 | 交付物 | 落地说明 |
|--------|--------|----------|
| **P1** | digest / 快照路径脱敏 | `integration/lib/PathRedaction.js`；`--write` **默认脱敏**，`--no-redact` 调试；`init-project-memory.mjs` 透传 `--no-redact` |
| **P1** | `scripts/scan-packaging-pii-patterns.mjs` | 扫描 `references/`、`SKILL.md`、`integration/`、`scripts/`、`scenarios/`；反例/说明行 allowlist |
| **P1** | 发版串联 | `package-production.mjs` **先**跑 `audit-skill-consistency.mjs`（内嵌 **`scan-packaging-pii-patterns.mjs --fail`**）；故 zip 路径与 audit 一致 |
| **P1** | 审计串联 | `audit-skill-consistency.mjs` 在其它检查通过后 **默认** 同上扫描；`--skip-packaging-pii-scan` 仅排障 |
| **P2** | `section-nlu.md` | `STATUS` 行已含「卡住/没反应/还在吗/无响应」等，**不新增意图计数**（仍 9 个核心意图） |
| **P2** | 全局英文稿导航 | `global-research-scenario.md`、`global-region-language-matrix.md` 文首 **中文 canonical 指向** `global.md` |
| **P2** | 集成清单 | `integration/CHECKLIST.md` **§3.3** 与 64 条中技能包落地 CLI 对齐 |

---

## 7. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-03-29 | 初版：五路并行审计框架 + 仓库扫描证据 + 分级问题与待批代码项。 |
| 2026-03-29 | v1.1.0：§6 P1/P2 已全部落地（脱敏、扫描、打包/审计串联、NLU、全局稿导航、CHECKLIST）。 |
