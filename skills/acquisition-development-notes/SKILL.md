---
name: acquisition-development-notes
version: 1.0.0
description: HOLO获客系统开发笔记 — 记录技能开发过程中的踩坑经验、已知bug、工作流规范。非流程性知识，是经验性知识。
triggers:
  - 开发笔记
  - 踩坑记录
  - 已知bug
  - 技能开发
  - 开发规范
category: holo-acquisition
tags: [development, notes, gotchas, acquired]
memory: null
---

# HOLO获客系统开发笔记 v1.0.0

> 本技能不包含可执行流程，仅记录经验性知识。
> 开发新技能或修改系统时，先查阅本文。

---

## 🔴 已知Bug与根因

### Python文件禁止使用中文字符变量名

**文件：** `holo-proposal-generator/scripts/generate_proposal.py`

**问题：** 代码中使用 `条款_data`、`条款_table` 等中文变量名，运行时抛出 `NameError: name '条款_table' is not defined`，但变量定义明明就在前面。

**根因：** write_file 工具在写入时对中文字符的处理存在编码层面的小概率问题，导致变量名在Python解析阶段出现不可见字符错位。

**症状：** 错误指向 `Table()` 调用行，不指向变量定义行，误导调试方向。

**修复：** 改用纯ASCII变量名（如 `payment_data`）。

**教训：** 不要用任何非ASCII字符作为变量名、函数名、文件名。Comment里写中文没问题，但代码正文不行。

---

## 📁 系统结构关键路径

### ROUTING-TABLE.yaml 实际位置

**安装目录（Agent实际运行时读取）：**
```
~/.hermes/skills/acquisition/ROUTING-TABLE.yaml
```
**操作时直接修改这个文件，不要找错了。**

**GitHub Repo里的副本（不影响运行时）：**
```
skills/global-customer-acquisition/references/ROUTING-TABLE.yaml
skills/acquisition-workflow/references/ROUTING-TABLE.yaml
```
这两个是备份/文档性质，修改它们不会影响Agent行为。

**GitHub repo根目录没有ROUTING-TABLE.yaml。**

### 技能安装目录 vs GitHub目录映射

Agent运行时的技能从 `~/.hermes/skills/acquisition/` 加载。

GitHub repo的 `skills/<category>/` 目录结构安装时会映射到 `~/.hermes/skills/acquisition/<category>/`。

例如：
- Repo: `skills/honglong-assistant/SKILL.md` → 安装: `~/.hermes/skills/acquisition/honglong-assistant/SKILL.md`
- Repo: `skills/holo-acquisition/holo-sales-trainer/SKILL.md` → 安装: `~/.hermes/skills/acquisition/holo-acquisition/holo-sales-trainer/SKILL.md`

### skill:// 协议解析规则

路由表中的 `path: skill://holo-sales-trainer` 解析为：
```
~/.hermes/skills/acquisition/holo-acquisition/holo-sales-trainer/SKILL.md
```
即：`skill://` + `skills_index` 中注册的路径名作为子目录，加上 `SKILL.md`。

---

## 🛠️ 开发工作流规范

### 新技能开发流程

1. **创建目录结构**
   ```bash
   mkdir -p ~/.hermes/skills/holo-acquisition/<新技能>/
   mkdir -p ~/.hermes/skills/holo-acquisition/<新技能>/references
   mkdir -p ~/.hermes/skills/holo-acquisition/<新技能>/scripts
   ```

2. **写 SKILL.md**（YAML frontmatter + markdown body）
   - frontmatter 包含：name, version, description, triggers, category
   - body 包含：使用流程、技术实现、文件结构

3. **写 references/ 和 scripts/**（如需要）

4. **注册到ROUTING-TABLE.yaml**
   - 在 `skills_index` 下添加新条目
   - 在对应的 `routing.*` 下添加意图路由
   - 使用 `python3 -c "import yaml; yaml.safe_load(open('...'))"` 验证YAML格式

5. **测试** — 直接在当前会话调用，验证触发和执行

6. **推送GitHub**
   - 复制到 repo：`cp -r ~/.hermes/skills/holo-acquisition/<新技能>/ /tmp/acquisition-agent/skills/holo-acquisition/`
   - `git add && git commit && git push`
   - 如果repo根有旧的同名测试目录，先删掉

### 推送GitHub前清理旧测试目录

repo根有时会有调试用的 `holo-acquisition/` 目录（不是 `skills/holo-acquisition/`），直接删除：
```bash
rm -rf /tmp/acquisition-agent/holo-acquisition/
```
注意路径：`/tmp/acquisition-agent/holo-acquisition/` 是测试目录，`/tmp/acquisition-agent/skills/holo-acquisition/` 才是正式目录。

---

## 📊 技能成熟度分级

| 级别 | 说明 | 验证标准 |
|------|------|---------|
| v0.1 | 骨架，只有SKILL.md | 能加载 |
| v0.5 | references填充，逻辑Stub | 内容完整 |
| v1.0 | scripts完成，可实际运行 | 测试通过 |
| v1.0+ | GitHub推送，用户可用 | commit完成 |

---

## 版本历史

- v1.0.0 (2026-04-14) — 初始版本
  - 记录Python中文字符变量名bug
  - 记录ROUTING-TABLE.yaml实际路径
  - 记录skill://解析规则
  - 记录开发工作流规范
