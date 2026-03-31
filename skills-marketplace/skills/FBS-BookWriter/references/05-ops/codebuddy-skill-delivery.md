# CodeBuddy Code 技能上架与交付包

> 官方文档：[CodeBuddy Code Skills（技能系统）](https://www.codebuddy.cn/docs/cli/skills)

## 交付物内容（建议最小上架包）

| 路径 | 是否纳入 | 说明 |
|------|----------|------|
| `SKILL.md` | **必选** | 技能入口；含 YAML Frontmatter |
| `references/` | **必选** | 规范全文；与 `SKILL.md` 内相对链接一致 |
| `LICENSE` | 建议 | 许可证 |
| `assets/` | 可选 | 本地 MD→HTML/PDF/DOCX 构建；需 Node 与可选依赖 |
| `integration/`、`scenarios/` | **最小文档 zip** 可省略；**生产包**（`package-production.mjs`）在目录存在时**会打入** | 集成骨架与场景参考实现，见 [`doc-code-consistency.md`](./doc-code-consistency.md)、[`efficiency-implementation.md`](./efficiency-implementation.md) |

## 目录结构（与官方一致）

将下列内容放到**项目**的：

`.codebuddy/skills/FBS-BookWriter/`

```
FBS-BookWriter/
├── SKILL.md
├── references/
│   ├── 01-core/
│   ├── 02-quality/
│   ├── 05-ops/
│   └── …
├── LICENSE          （可选）
└── assets/          （可选）
```

用户级安装则为：`~/.codebuddy/skills/FBS-BookWriter/`（同上结构）。

**注意**：`SKILL.md` 与 `references/` 的相对路径（如 `./references/01-core/skill-index.md`）必须以 **`FBS-BookWriter` 为根** 保持一层目录关系，勿把 `references/` 挪到与 `SKILL.md` 不同层级。

## Frontmatter 对照（上架前自检）

| 字段 | 本技能当前 | 说明 |
|------|------------|------|
| `name` | `FBS-BookWriter` | 未填时可用目录名；建议与文件夹一致 |
| `description` | 多行中文 + **触发词（精选）** | 影响模型是否自动选用本 Skill；触发词与正文 **§0「模型触发词（精选说明）」** 表应同步更新 |
| `allowed-tools` | `Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch` | 与宿主实际工具名一致；若报错可尝试将 `Edit` 与 `Write` 按文档合并为宿主支持的写法 |
| `user-invocable` | `true` | `false` 时从 `/` 菜单隐藏，仅供模型内部引用 |
| `disable-model-invocation` | 未设 | 设为 `true` 时仅能通过 `/skill-name` 手动触发 |
| `context` / `agent` | 未设 | 需要子代理隔离时再设 `context: fork` 等 |

## WorkBuddy 生产环境与官方头文件：对照与优化建议

WorkBuddy 侧技能形态与 [Skills 官方说明](https://www.codebuddy.cn/docs/cli/skills)一致（目录 + `SKILL.md` + YAML Frontmatter）；下列为**当前 FBS-BookWriter** 与官方字段的对比及可选优化，**不改变**正文写作规范与交付质量。

### 1. 官方支持字段 vs 本包现状

| 官方字段 | 本包 | 说明 |
|----------|------|------|
| `name` | ✅ `FBS-BookWriter` | 与文件夹名一致即可 |
| `description` | ✅ 多行（能力 + 触发词） | 模型**选用 Skill** 的首要依据；`/skills` 会展示并计入预估 token |
| `allowed-tools` | ✅ 列表 | 与宿主实际工具名一致；官方支持子集/模式（如 `Bash(git:*)`），可按需收紧 |
| `user-invocable` | ✅ `true` | 与「写书」显式选用一致 |
| `disable-model-invocation` | 未设 | 若希望**仅** `/FBS-BookWriter` 手动触发、不自动选用，可设 `true`（一般**不建议**本书场景） |
| `context` / `agent` | 未设 | 本书需连续对话与全书上下文，**不宜**对整 Skill 设 `context: fork`；局部子任务可用宿主并行能力代替 |
| `description_zh` / `description_en` | ✅ 扩展字段 | **非**官方表内字段；若宿主只认 `description`，仍以主 `description` 为准，双语作备份/搜索优化 |
| `tags` | ✅ 数组 | 同上，属扩展；确认 WorkBuddy 是否索引，否则可视为文档性元数据 |
| `license` | ✅ `MIT` | 官方未列；利于分发与合规，可保留 |

### 2. 建议优化点（按优先级）

1. **`description` 首因效应（P1）**  
   官方强调「任务与 description 的匹配度」决定选用。当前首行含 `福帮手出品|` 与长能力串，**信号略分散**。可选：首行改为 **一句话场景**（例如「中文长文档著书：书/手册/白皮书/指南，联网查证与分层审校」），品牌与细则保留在第二行或正文 §0，避免削弱「写书、白皮书」等触发匹配。

2. **控制 Frontmatter 体积（P1）**  
   `/skills` 会显示**预估 token**；`description` 过长会增加每次加载成本。可选：触发词保留在 `description`（宿主强依赖），其余叙事性口号迁入正文「价值承诺」块。

3. **扩展字段兼容性（P2）**  
   `description_zh` / `description_en` / `tags` 若遇严格 YAML 消费者忽略未知键，**无功能损失**；若某环境报错，可合并为单字段 `description` 或移入正文。

4. **Frontmatter 内注释（P2）**  
   首行 `---` 后的 `# 与 CodeBuddy…` 为合法 YAML 注释；若个别工具只认「纯键值」可改为正文首段链接，减少解析差异风险。

5. **`allowed-tools` 最小权限（P2）**  
   官方建议只授必需工具。长文档场景若无需 `Bash`，可评估收窄；若需 `node assets/build.mjs` 等再保留 `Bash`。

6. **与审计脚本一致（P0）**  
   改 `description` 内触发词时，须同步 `SKILL.md` 正文价值块、§0 模型触发词表，并跑 `audit-skill-consistency`（项目内已有校验）。

### 3. 不建议的改法

- **不要**为整本 Skill 开启 `context: fork`：会切断 S0–S6 连续语境与已确认大纲。  
- **不要**在未改宿主工具名的前提下随意重命名 `allowed-tools` 中的工具（易触发权限错误）。

## 上架前检查清单

- [ ] 已按 [`visibility-boundary.md`](./visibility-boundary.md) 完成目录隔离：`internal/product-design`、`internal/business-plan` 不得进入交付包。
- [ ] `node scripts/audit-visibility-boundary.mjs` 通过（命名/路径/标记防泄露）。
- [ ] 已读并完成 [`global-delivery-consistency.md`](./global-delivery-consistency.md) §4 核对项（含触发词三处一致、`audit-fbs-efficiency`）。
- [ ] `SKILL.md` 中所有 `./references/...` 链接在打包目录下可解析。
- [ ] `references/05-ops/search-policy.json` 为合法 JSON。
- [ ] 已阅读 [`doc-code-consistency.md`](./doc-code-consistency.md)，不在上架说明中声称 `integration/`「已就绪可跑」；可选源码附带 `integration/`、`scenarios/` 时见 [`efficiency-implementation.md`](./efficiency-implementation.md)。
- [ ] 仓库根 **`node scripts/audit-fbs-efficiency.mjs`** 通过（开发者/CI 自检）。
- [ ] 安装后在本机执行 **`/skills`**，确认出现 **Project skills → FBS-BookWriter**，并关注预估 token。
- [ ] 用触发词试跑一句（如「写白皮书大纲」），确认模型能匹配 `description`。

## 对外可见说明模板（P0）

为避免误承诺，建议对外发布时复用模板：

- [`external-visible-release-template.md`](./external-visible-release-template.md)

推荐实践（降 token / 防卡顿 / 提体验）：

1. 首轮说明控制在 5 条内，仅讲“可见能力 + 边界 + 下一步”。
2. 不一次性贴完整手册，按用户追问分段展开。
3. 对长流程给出阶段进度与重试入口，避免静默等待。

## 本书仓库记忆模板（可选，与 Skill 同时用）

成书项目若与技能包**分目录**存放，可用 Node 脚本注入条件规则与 `CODEBUDDY.md` 片段（见 [`codebuddy-memory-workbuddy-integration.md`](./codebuddy-memory-workbuddy-integration.md)）：

```bash
node scripts/apply-book-memory-template.mjs --book "<本书根>" --skill "<本技能包根>"
```

## 生成 zip 交付包（Windows）

仓库内脚本（从仓库根目录执行）：

```powershell
.\scripts\package-codebuddy-skill.ps1
```

打包脚本在复制完成后会**自动**执行 `node scripts/audit-skill-package-completeness.mjs`：对比源仓库与 `dist/FBS-BookWriter-skill` 下 `references/`、`assets/` 的完整文件树，校验 `SKILL.md`（及存在时的 `LICENSE`）与源一致，并检查 `SKILL.md` 内指向 `references/`、`assets/` 的相对链接在包内可解析；任一项失败则打包中断。清单与关键路径见 `scripts/skill-package-manifest.json`。也可在已有 dist 上单独运行：`node scripts/audit-skill-package-completeness.mjs`。

输出目录：`dist/FBS-BookWriter-skill/`。将该文件夹**整体**重命名为 `FBS-BookWriter` 后，复制到目标项目的 `.codebuddy/skills/` 下；或直接压缩 `FBS-BookWriter-skill` 为 zip 分发，由使用方解压到 `.codebuddy/skills/FBS-BookWriter/`。

### 一键打「生产 zip」（本技能包内，推荐）

在**技能包根目录**（与 `SKILL.md` 同级）执行：

```bash
node scripts/package-production.mjs
```

- 会先运行 `audit-skill-consistency.mjs` 预检，失败则**不**出包。  
- 产出：`release/FBS-BookWriter-<policy版本>-production-<YYYYMMDD>.zip`，解压后顶层为 **`FBS-BookWriter/`**，内含 `SKILL.md`、`references/`、`LICENSE`、`assets/`、`scripts/`、`INSTALL.md`、`MANIFEST.json`。  
- 自定义输出目录：`node scripts/package-production.mjs --out D:/dist`
- **发版打包单一入口**：以本节的 **`node scripts/package-production.mjs`** 为准（`MANIFEST.json` 与 zip 名中版本取自 `references/05-ops/search-policy.json`）。其他 `.ps1` 封装（若存在）应视为可选编排层，避免与本文档并列「另一套」生产清单而不说明调用关系。

## 一键发布前检查（Windows）

若希望一条命令完成“边界审计 + 全量审计 + 打包”，可执行：

```powershell
.\scripts\prepublish-workbuddy-skill.ps1
```

该命令任一步失败都会立即中断，避免误发布。

## 参考链接

- [Skills 功能说明](https://www.codebuddy.cn/docs/cli/skills)（目录结构、Frontmatter、`!`command\`\`、权限与调试）
- [WorkBuddy 概述](https://www.codebuddy.cn/docs/workbuddy/Overview)、[Agent Teams](https://www.codebuddy.cn/docs/cli/agent-teams)（与本 SKILL 中多成员话术章节对应）
