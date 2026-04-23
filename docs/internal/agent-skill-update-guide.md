# Agent 技能更新指南

> acquisition-agent 技能库的创建、修改、同步、归档全流程。
> 适用于 84+ 活跃技能 + OpenClaw Gateway 运行时。
> 2026-04-22 制定。

---

## 一、技能体系概览

```
acquisition-agent/skills/           ← 技能库源码（Git 管理）
  ├── catalog.json                  ← 技能目录索引（分类 + SHA-256 hash）
  ├── config/                       ← 共享配置
  │   ├── company-profile.json      ← 公司身份信息
  │   └── infrastructure.json       ← NAS 路径、数据库路径
  ├── <skill-name>/
  │   ├── SKILL.md                  ← 必需：技能定义
  │   ├── config.json               ← 可选：技能专属配置
  │   ├── skill.yaml                ← 可选：扩展元数据
  │   ├── metadata.json             ← 可选：发布元数据
  │   ├── references/               ← 可选：按需加载的参考文档
  │   ├── scripts/                  ← 可选：可执行脚本
  │   └── assets/                   ← 可选：模板、图片、字体
  └── ...
archive/                            ← 已归档技能（33 个）
```

### 运行时同步

```
源码: acquisition-agent/skills/<skill>/SKILL.md
        │
        │  holo-agent 启动时自动同步
        │  （SHA-256 增量比对，只复制变更）
        ▼
运行时: ~/.openclaw/skills/acquisition/<skill>/SKILL.md
        │
        │  OpenClaw Gateway 启动时加载
        ▼
内存:   Gateway 运行时（端口 18789）
```

**同步实现**：`holo-agent/electron/utils/acquisition-skubs.ts` → `configureAcquisitionSkillsDir()`

**为什么复制而不是 symlink？** OpenClaw 的 skill-loader 有 `isPathInside` 检查，拒绝指向 `~/.openclaw/` 外部的 symlink。

---

## 二、技能格式标准

> 完整标准见 [SKILL-FORMAT-STANDARD.md](../SKILL-FORMAT-STANDARD.md)

### Frontmatter 必填字段

```yaml
---
name: skill-name          # kebab-case
version: 1.0.0           # 语义化版本
description: "做什么 + 何时触发 + 关键词"  # 50-150 词
triggers:                # 3-10 个，中英文混合
  - 关键词1
  - keyword
---
```

### Body 结构（目标 ≤ 400 行）

1. 标题行（H1，含版本号）
2. 一句话说明
3. 何时使用 / 何时不使用
4. 核心流程（流程图或编号步骤）
5. 关键规则（3-5 条，带 Why 解释）
6. 输出格式（代码块模板）
7. 输入要求（表格）
8. 参考文档（表格：文件 + 何时读取 + 内容）
9. 踩坑记录（表格）
10. 版本页脚：`_Version: X.Y.Z | 更新: YYYY-MM-DD_`

### 三层信息架构

```
Layer 1: Frontmatter（始终在 AI 上下文中）
Layer 2: SKILL.md body（触发时加载，≤400 行）
Layer 3: references/（按需加载，无限制）
```

---

## 三、创建新技能

### 3.1 手动创建

```
1. 创建目录
   skills/<skill-name>/
     ├── SKILL.md
     └── references/   （如需要）

2. 编写 SKILL.md（遵循格式标准）

3. 注册到 catalog.json
   在对应分类的 skills 数组中添加条目：
   {
     "id": "<skill-name>",
     "name": "<显示名>",
     "description": "<简短描述>",
     "hash": "<SHA-256>"
   }

4. 如需被其他技能调用，在 ROUTING-TABLE.yaml 中注册
   skills_index:
     <skill-name>:
       path: skill://<skill-name>

5. 如技能需要触发其他技能，用 skill:// 协议引用
   在 SKILL.md 中写：skill://other-skill
```

### 3.2 用 skill-creator 脚本创建

```bash
# 初始化技能目录结构
python skills/skill-creator/scripts/init_skill.py <skill-name> --path skills/<skill-name>

# 验证格式
python skills/skill-creator/scripts/quick_validate.py skills/<skill-name>/SKILL.md

# 打包为 .skill 文件
python skills/skill-creator/scripts/package_skill.py skills/<skill-name>
```

### 3.3 创建检查清单

- [ ] 目录名 kebab-case
- [ ] SKILL.md 四个 frontmatter 字段齐全
- [ ] description 包含触发关键词且够"强势"
- [ ] 有"何时使用/何时不使用"章节
- [ ] 核心流程用流程图或编号步骤
- [ ] 有 Quick Reference Card
- [ ] 输出格式用代码块模板
- [ ] SKILL.md ≤ 400 行
- [ ] catalog.json 已注册
- [ ] 如需跨技能调用，ROUTING-TABLE.yaml 已注册
- [ ] 运行 `quick_validate.py` 通过

---

## 四、修改现有技能

### 4.1 修改流程

```
1. 编辑 SKILL.md
2. 更新 version 字段
   - 小修小补 → patch（1.1.0 → 1.1.1）
   - 功能变更 → minor（1.1.0 → 1.2.0）
   - 重大重构 → major（1.x → 2.0）
3. 更新底部版本页脚
4. 如有 references/ 变更，同步更新
5. 如有 config.json 变更，验证 JSON 格式
6. 更新 catalog.json 中的 hash（重新计算 SHA-256）
7. 测试验证（见 4.3）
8. 提交
```

### 4.2 catalog.json hash 更新

```bash
# 计算单个技能的 hash
sha256sum skills/<skill-name>/SKILL.md

# 或用 PowerShell
Get-FileHash skills/<skill-name>/SKILL.md -Algorithm SHA256
```

将 hash 值更新到 catalog.json 对应条目的 `"hash"` 字段。

### 4.3 测试验证

**技能验证层级**：

| 层级 | 方法 | 验证内容 |
|------|------|---------|
| 格式 | `quick_validate.py` | frontmatter 完整性、行数、结构 |
| 逻辑 | 在 OpenClaw 中手动触发 | 技能是否被正确触发、输出是否符合预期 |
| 集成 | 运行 `skill-auditor` | 跨技能引用、路由表一致性 |
| 回归 | 测试已知场景 | 踩坑记录中的问题是否复现 |

**手动测试步骤**：

```
1. 重启 holo-agent（触发技能同步到 ~/.openclaw/skills/acquisition/）
2. 在 Chat 中输入触发词，确认技能被触发
3. 验证输出格式符合 SKILL.md 中的模板
4. 如技能调用子技能（skill://），验证子技能也被正确触发
5. 检查 references/ 文件是否被正确加载
```

### 4.4 skill.yaml ↔ SKILL.md 同步

```bash
# 双向同步 version / triggers / description
python deploy/cli/sync_skill.py skills/<skill-name>

# 方向：
# skill.yaml → SKILL.md：同步 version
# SKILL.md → skill.yaml：同步 triggers 和 description（如果 SKILL.md 的更长）
```

---

## 五、技能依赖管理

### 5.1 skill:// 协议

技能之间通过 `skill://` 协议引用：

```markdown
在 SKILL.md 中：
- 调用子技能：skill://company-research
- 引用参考文档：skill://acquisition-workflow/references/ROUTING-TABLE.yaml
```

解析规则：
```
skill://<skill-name> → skills/<skill-name>/SKILL.md
skill://<skill-name>/references/<file> → skills/<skill-name>/references/<file>
```

### 5.2 ROUTING-TABLE.yaml

意图路由表定义了用户输入如何映射到技能：

```yaml
skills_index:
  company-research:
    path: skill://company-research
  cold-email-generator:
    path: skill://cold-email-generator

intents:
  - keywords: [调研, 背调, research, background]
    skill: skill://company-research
    priority: high
```

**修改路由时**：
1. 更新 `skills/acquisition-workflow/references/ROUTING-TABLE.yaml` 的 `version`
2. 确保新技能已在 `skills_index` 中注册
3. 测试触发词是否正确路由

### 5.3 共享配置

| 配置文件 | 用途 | 谁读取 |
|---------|------|--------|
| `config/company-profile.json` | 公司名、品牌、网站、竞品 | 多个技能 |
| `config/infrastructure.json` | NAS 路径、数据库路径 | 需要文件读写的技能 |
| `<skill>/config.json` | 技能专属配置 | 仅该技能 |

**修改共享配置时**：注意影响范围，可能需要同步更新多个技能的踩坑记录。

---

## 六、归档技能

### 6.1 归档条件

- 技能被合并到其他技能
- 技能功能被内置功能替代
- 技能长期无人使用（> 3 个月无触发记录）

### 6.2 归档流程

```
1. 从 catalog.json 的 skills 数组中移除
2. 移动目录到 archive/<skill-name>/
3. 如技能在 ROUTING-TABLE.yaml 中有注册，移除或标记为 archived
4. 更新引用该技能的其他技能（指向替代技能或移除引用）
5. 提交：git mv skills/<skill-name> archive/<skill-name>
```

### 6.3 恢复技能

```
1. git mv archive/<skill-name> skills/<skill-name>
2. 重新注册到 catalog.json
3. 如需要，恢复 ROUTING-TABLE.yaml 注册
4. 更新 version（patch +1）
```

---

## 七、同步机制详解

### 7.1 自动同步（holo-agent 启动时）

```
holo-agent 启动
  → electron/utils/acquisition-skubs.ts: configureAcquisitionSkillsDir()
  → 遍历 skills/ 下所有 SKILL.md
  → 计算源文件 SHA-256
  → 与 ~/.openclaw/skills/acquisition/ 中的文件对比
  → 只复制有变更的技能
  → 删除源中已不存在的旧技能
```

**不需要手动操作**。修改源码后重启 holo-agent 即可。

### 7.2 强制重新同步

如果怀疑同步出问题：

```
1. 关闭 holo-agent
2. 删除运行时目录：rm -rf ~/.openclaw/skills/acquisition/
3. 重启 holo-agent（会全量复制）
```

### 7.3 同步不覆盖的文件

同步只处理 `SKILL.md`。`references/`、`scripts/`、`config.json` 等子文件需要单独处理，或依赖 holo-agent 后续版本的同步逻辑更新。

---

## 八、技能分类与面向用户映射

### 8.1 5 个核心业务动作

业务员不需要知道 84 个技能的存在，只看到 5 个核心动作：

| 动作 | 背后的技能 | 说明 |
|------|-----------|------|
| 找客户 | exa-web-search-free, teyi-customs, facebook-acquisition, instagram-acquisition, linkedin | 多渠道客户搜索 |
| 查客户 | company-research, customer-intelligence, deep-research, market-research | 企业背调 |
| 发开发信 | cold-email-generator, email-sender, email-inbox, whatsapp-outreach | 多渠道触达 |
| 报价 | smart-quote, quotation-generator, holo-proposal-generator | 利润率 → 报价单 |
| 发社媒 | holo-social-gen, ai-social-media-content, linkedin-writer | 社媒内容生成 |

### 8.2 技能可见性

| 分类 | 面向业务员 | 说明 |
|------|:---------:|------|
| 获客核心流程 | 否 | 系统编排，不直接暴露 |
| 客户调研与情报 | 是 | company-research 等 |
| 触达与沟通渠道 | 是 | email-sender, whatsapp-outreach 等 |
| 社交媒体 | 是 | holo-social-gen 等 |
| 报价与提案 | 是 | smart-quote 等 |
| 记忆与知识管理 | 否 | 系统内部 |
| 系统元技能 | 否 | skill-auditor, release-manager 等 |

---

## 九、常见问题

### Q: 修改了 SKILL.md 但 Gateway 没有生效？

1. 重启 holo-agent（触发同步）
2. 确认 `~/.openclaw/skills/acquisition/<skill>/SKILL.md` 已更新
3. OpenClaw Gateway 在启动时加载技能，运行中修改需要重启 Gateway

### Q: catalog.json 的 hash 不对会怎样？

hash 用于增量同步比对。hash 不匹配会导致该技能每次启动都被重新复制，功能不受影响但增加启动时间。

### Q: 技能 A 引用了技能 B，但 B 被归档了？

技能 A 会收到"技能未找到"错误。归档流程中应同步更新引用。用 `skill-auditor` 检测此类问题。

### Q: 如何查看技能的触发日志？

在 Chat 模式中观察 AI 是否正确触发了技能。也可以查看 Gateway 日志（通过 holo-agent 的开发者工具 Console）。

---

_版本：1.0.0 | 2026-04-22_
