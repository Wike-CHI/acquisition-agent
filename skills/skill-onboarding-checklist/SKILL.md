---
name: skill-onboarding-checklist
version: 1.0.0
description: >
  HOLO-AGENT 新技能安装规范流程。每次安装/创建新技能后，必须按本流程完成注册，
  否则技能不会被路由系统识别。适用于所有在 acquisition/ 技能集群下新增的技能。
triggers:
  - 安装新技能
  - 新增技能
  - 创建技能
  - 注册技能
  - skill setup
  - skill install
---

# HOLO-AGENT 技能安装检查清单 v1.0.0

> 新技能装错位置（holo-acquisition/ 而非 acquisition/）+ 路由表未注册 = 技能"消失"。
> 本清单防止这类问题重复发生。

---

## 安装位置规范

**正确位置：`~/.hermes/skills/acquisition/`**

```
~/.hermes/skills/
├── acquisition/          ← 所有获客技能都装这里
│   ├── skill-a/
│   ├── skill-b/
│   └── SKILL.md
└── holo-acquisition/     ← 仅限顶层入口 SKILL.md，不放子技能
    └── SKILL.md          ← 顶层入口，cluster元数据
```

**常见错误**：技能被装进 `~/.hermes/skills/holo-acquisition/some-skill/` 而不是
`~/.hermes/skills/acquisition/some-skill/`。症状是路由表里能找到但实际加载失败。

---

## 检查清单（安装后必做）

### Step 1：验证技能文件存在且位置正确

```bash
# 检查技能目录在正确位置
ls ~/.hermes/skills/acquisition/<新技能名>/SKILL.md

# 确认不在错误位置
ls ~/.hermes/skills/holo-acquisition/<新技能名>/SKILL.md 2>/dev/null && echo "ERROR: 装错位置！" || echo "OK"
```

### Step 2：验证 SKILL.md 格式正确

```bash
# 检查 frontmatter 必填字段
grep -E "^name:|^version:|^description:|^triggers:" ~/.hermes/skills/acquisition/<新技能>/SKILL.md
```

### Step 3：注册到 ROUTING-TABLE.yaml

**3a. 注册到 routing 层**（让系统知道在什么场景下调用这个技能）

找到对应 intent 的 routing 段落，添加：

```yaml
  <intent_name>:
    all_markets:    # 或 overseas/domestic
    - skill: <新技能名>
      priority: 5  # 1-6，数字越大优先级越高
      condition: 触发条件描述
      fallback: [] # 或列出降级技能
```

**3b. 注册到 skills_index 层**（让系统能找到技能路径和描述）

在 skills_index 段落末尾添加：

```yaml
  <新技能名>:
    path: skill://<新技能名>
    description: 一句话描述功能
    layer: <discovery|outreach|intelligence|support|orchestration|training|maintenance|persona>
```

### Step 4：更新 SKILLS-MANIFEST.yaml（如果存在）

同 skills_index 的注册内容。

### Step 5：检查重复技能

```bash
# 检查是否有同功能技能已存在（可能需要合并）
grep -r "<功能关键词>" ~/.hermes/skills/acquisition/ROUTING-TABLE.yaml
```

---

## 快速验证（安装后执行）

```bash
# 验证1：skills_index 中能搜到新技能
grep "<新技能名>" ~/.hermes/skills/acquisition/ROUTING-TABLE.yaml

# 验证2：技能文件存在
ls ~/.hermes/skills/acquisition/<新技能名>/SKILL.md

# 验证3：路由表 YAML 格式正确
python3 -c "import yaml; yaml.safe_load(open('~/.hermes/skills/acquisition/ROUTING-TABLE.yaml'))" && echo "YAML OK"
```

---

## 典型错误处理

### 错误1：技能装在 holo-acquisition/ 下

```bash
# 迁移到正确位置
mv ~/.hermes/skills/holo-acquisition/<技能名> ~/.hermes/skills/acquisition/<技能名>
```

### 错误2：技能已存在路由表但系统仍不识别

可能原因：
- YAML 中 skill 名称与实际目录名大小写不一致
- routing 层用的是 `overseas/domestic` 分支但只注册在 `all_markets`
- priority=0 或 condition 为空导致永不触发

### 错误3：多个技能功能重叠（如 sdr-training-ground vs holo-sales-trainer）

解决步骤：
1. 保留内容更完整的那个
2. 把另一个的内容合并进去（references 目录）
3. 路由表指向保留的那个
4. 删除废弃技能目录
5. 更新 skills_index

---

## release-manager 注意事项

release-manager 的 `.release/sync-list.txt` 白名单控制哪些文件被同步到 git。
新技能即使在 acquisition/ 下，如果不在白名单里也不会进入 git repo。

**发布前必须确认**：新技能的目录名在 `.release/sync-list.txt` 中。

---

*本清单解决：技能"装好了但系统不认识"的根因——位置错误 + 路由表未注册。*
