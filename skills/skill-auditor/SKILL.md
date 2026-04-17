---
name: skill-auditor
version: "1.0.0"
description: 系统审查并优化 Hermes Agent 技能。
triggers:
  - 审查技能
  - 审计技能
  - 检查技能系统
  - 全面审查
  - skill-auditor
---

# Skill Auditor - 技能系统审查技能

## 何时使用

- 用户说"审查技能"、"审计技能"、"检查技能系统"
- 用户说"全面审查"某几个技能
- 技能数量超过 60 个、需要系统性摸底时
- 大版本迭代后验证所有技能健康度

## 审查流程

### Step 1: 扫描全量技能（execute_code）

```python
import os, re, yaml

skill_dir = os.path.expanduser("~/.hermes/skills/acquisition")
EXCLUDE = {'.archive', '.claude', '.agents', '.trae', 'skills', 'references', 
           'templates', 'scripts', 'local', 'acquisition.bak.2.7', 
           'acquisition.bak.202604101033', 'acquisition.bak.202604131433',
           '.cli', 'knowledge-base', 'smart-memory'}

# 统计活跃技能
active = sorted([s for s in os.listdir(skill_dir) 
                 if os.path.isdir(os.path.join(skill_dir, s)) 
                 and s not in EXCLUDE and not s.startswith('.')])
print(f"活跃技能: {len(active)}")

# 扫描问题
issues = {}
for skill in active:
    skill_md = os.path.join(skill_dir, skill, "SKILL.md")
    if not os.path.exists(skill_md):
        issues.setdefault(skill, []).append("SKILL.md 不存在")
        continue
    with open(skill_md, 'rb') as f:
        raw = f.read()
    try:
        text = raw.decode('utf-8')
    except UnicodeDecodeError:
        text = raw.decode('latin-1')
    
    skill_issues = []
    
    # 1. frontmatter 检查
    if text.startswith('---'):
        parts = text[3:].split('---', 1)
        if len(parts) >= 2:
            try:
                fm = yaml.safe_load(parts[0])
                if not isinstance(fm, dict):
                    skill_issues.append("frontmatter 非 dict")
                else:
                    if 'name' not in fm: skill_issues.append("缺 name")
                    if 'description' not in fm: skill_issues.append("缺 description")
                    # 非标准字段（version 是全系统通用，不算问题）
                    non_std = [k for k in fm if k not in ('name','description','license','metadata','compatibility','always','updated')]
                    if non_std:
                        skill_issues.append(f"非标准字段: {non_std}")
            except Exception as e:
                skill_issues.append(f"YAML解析失败: {e}")
        else:
            skill_issues.append("frontmatter 未闭合")
    else:
        skill_issues.append("缺 frontmatter")
    
    # 2. 多余文档文件
    unwanted = [f for f in os.listdir(os.path.join(skill_dir, skill))
                if f in ('README.md','CHANGELOG.md','VERSION.md','HISTORY.md','INSTALL.md','TODO.md')
                or (f.endswith('.md') and f != 'SKILL.md')]
    if unwanted:
        skill_issues.append(f"多余文档: {unwanted}")
    
    # 3. 过大 SKILL.md
    if len(raw) > 10000:
        skill_issues.append(f"SKILL.md过大 ({len(raw)//1024}KB)")
    
    # 4. CRLF 检测
    if raw.count(b'\r\n') > 10:
        skill_issues.append(f"CRLF行结尾 ({raw.count(b'\r\n')}处)")
    
    if skill_issues:
        issues[skill] = skill_issues

# 按问题类型分类输出
critical = []   # 缺失 frontmatter / SKILL.md 不存在
size_issues = []  # > 10KB
doc_issues = []  # 多余文档
crlf_issues = []  # CRLF

for skill, prob in sorted(issues.items()):
    for p in prob:
        if '不存在' in p or '缺 frontmatter' in p or '非 dict' in p:
            critical.append((skill, p))
        elif '过大' in p:
            size_issues.append((skill, p))
        elif '多余文档' in p:
            doc_issues.append((skill, p))
        elif 'CRLF' in p:
            crlf_issues.append((skill, p))

print(f"\nP0 Critical: {len(critical)}"); [print(f"  {s} - {p}") for s,p in critical]
print(f"\nP1 过大 (>10KB): {len(size_issues)}"); [print(f"  {s} - {p}") for s,p in size_issues[:10]]
print(f"\nP2 多余文档: {len(doc_issues)}"); [print(f"  {s} - {p}") for s,p in doc_issues[:10]]
print(f"\nP3 CRLF: {len(crlf_issues)}"); [print(f"  {s} - {p}") for s,p in crlf_issues[:5]]
```

### Step 2: 路由连通性检查（关键！）

> 教训：`inquiry-response` 有9KB完整内容（谈判策略+异议库+竞品情报），但未注册到ROUTING-TABLE，导致完全无法触发。技能存在 ≠ 技能可用。

```python
import yaml, os

skill_dir = os.path.expanduser("~/.hermes/skills/acquisition")
rt_path = os.path.join(skill_dir, "ROUTING-TABLE.yaml")

with open(rt_path) as f:
    rt = yaml.safe_load(f)

routing_skills = set()
for intent, config in rt.get('routing', {}).items():
    markets = config if isinstance(config, dict) else {}
    for market, skills in markets.items():
        if isinstance(skills, list):
            for s in skills:
                if isinstance(s, dict) and 'skill' in s:
                    routing_skills.add(s['skill'])

indexed_skills = set(rt.get('skills_index', {}).keys())

active_skills = [s for s in os.listdir(skill_dir)
                 if os.path.isdir(os.path.join(skill_dir, s))
                 and os.path.exists(os.path.join(skill_dir, s, 'SKILL.md'))]

orphaned = []
for skill in sorted(active_skills):
    in_routing = skill in routing_skills or skill in indexed_skills
    if not in_routing:
        size = os.path.getsize(os.path.join(skill_dir, skill, 'SKILL.md'))
        orphaned.append((skill, size))

print(f"\n=== 孤儿技能（内容存在但未注册路由）===")
print(f"总数: {len(orphaned)}")
for skill, size in orphaned:
    print(f"  ⚠️  {skill}/ — {size//1024}KB，内容存在但路由不可达")
```

**路由注册点（两个都要有才算连通）：**
1. `routing.<intent>.<market>[]..skill` — 激活路径（是否被意图触发）
2. `skills_index.<skill_name>.path` — 解析路径（skill:// URI能否解析）

**P0孤儿 = 有内容但两边都没注册。必须修复。**

### Step 3: 问题优先级排序

**P0（影响功能，立即修复）**:
- SKILL.md 不存在
- 缺失 frontmatter
- frontmatter 无法解析

**P1（体积问题，降低效率）**:
- SKILL.md > 10KB
- frontmatter 冗余字段过多（如 250 行 triggers）

**P2（违反规范，清理）**:
- 多余文档文件（README.md / CHANGELOG.md / GUIDE.md 等）
- skill-creator 原则明确：技能只需要 SKILL.md + scripts/references/assets

**P3（工具可靠性）**:
- CRLF 行结尾影响 patch 工具

### Step 4: P0 立即修复

**缺失 frontmatter** — 最优先，直接补上：
```bash
# 快速检查缺失 frontmatter
for d in ~/.hermes/skills/acquisition/*/; do
    f="$d/SKILL.md"
    if [[ -f "$f" ]] && ! head -1 "$f" | grep -q '^---$' ; then
        echo "缺失: $d"
    fi
done
```

补 frontmatter 模板：
```markdown
---
name: <skill-name>
description: <一句话说明技能功能 + 触发场景>
---

# <技能名>
```

**SKILL.md 不存在** — 检查是否是被误删的空目录：
```python
import os
skill_dir = os.path.expanduser("~/.hermes/skills/acquisition")
for s in os.listdir(skill_dir):
    path = os.path.join(skill_dir, s)
    if os.path.isdir(path) and not os.path.exists(os.path.join(path, "SKILL.md")):
        files = os.listdir(path)
        print(f"空技能目录（无SKILL.md）: {s} — 内容: {files}")
```

### Step 5: P2 批量删除多余文档

```bash
# 找出所有多余 .md 文件（不是 SKILL.md 的）
find ~/.hermes/skills/acquisition -name "*.md" ! -name "SKILL.md" \
    ! -path "*/.archive/*" ! -path "*/references/*" \
    -type f 2>/dev/null | head -50

# 批量删除（确认前先预览）
find ~/.hermes/skills/acquisition -name "README.md" -o -name "CHANGELOG.md" \
    -o -name "VERSION.md" -o -name "INSTALL.md" -o -name "TODO.md" \
    ! -path "*/.archive/*" 2>/dev/null | xargs echo "将删除:"
```

### Step 6: P3 修复 CRLF

```bash
# 批量修复 CRLF（preview）
find ~/.hermes/skills/acquisition -type f \( -name "*.sh" -o -name "*.md" -o -name "*.yaml" -o -name "*.py" \) \
    -exec file {} \; 2>/dev/null | grep CRLF | head -20

# 修复（sed）
find ~/.hermes/skills/acquisition -type f \( -name "*.sh" -o -name "*.md" -o -name "*.yaml" -o -name "*.py" \) \
    -exec sed -i 's/\r$//' {} \;
```

### Step 7: 大技能精简（渐进式）

对于 > 10KB 的技能，按以下顺序处理：

1. **frontmatter triggers 字段**：250+ 行关键词列表是最大浪费
   - skill-creator 原则：触发机制唯一来源是 `description`
   - `triggers` 是非标准字段，删除
   - 关键词合并进 description

2. **内容重复**：查找与 references/ 下文件重复的内容
   ```bash
   # 找与 references/ 目录内容重复的 SKILL.md
   grep -h "详细.*见.*skill://" ~/.hermes/skills/acquisition/*/SKILL.md 2>/dev/null \
       | grep -oE "skill://[a-zA-Z0-9_/-]+" | sort -u
   ```
   这些只保留 `skill://` 引用，删除正文

3. **过长章节拆分**：
   - 单一章节 > 80 行 → 考虑移入 references/
   - 多个相似变体 → 拆为 references/VARIANT-A.md, references/VARIANT-B.md

4. **精简后目标**：
   - 主入口技能：< 8KB
   - 子技能：< 5KB
   - 工具类技能：< 3KB

### Step 8: 验证与推送

```bash
# 1. 验证所有 SKILL.md YAML 合法
for f in ~/.hermes/skills/acquisition/*/SKILL.md; do
    python3 -c "import yaml; yaml.safe_load(open('$f').read().split('---')[1].split('---')[0])" 2>/dev/null
    if [ $? -ne 0 ]; then echo "YAML错误: $f"; fi
done

# 2. 推送 GitHub
cd ~/.hermes/skills/acquisition && bash release-manager/scripts/sync-to-github.sh --skip-prereq -m "fix: skill audit P0-P3 fixes" 2>&1
```

## 常见问题速查

| 症状 | 原因 | 修复 |
|------|------|------|
| 技能无法触发 | frontmatter 缺失/格式错误 | 补 frontmatter |
| SKILL.md 过大 | 250行 triggers + 重复内容 | 删除 triggers，移入 references |
| patch 工具失效 | CRLF 行结尾 | sed -i 's/\r$//' |
| 推送后 GitHub 没更新 | 新技能未加入 RETAINED_SKILLS | 加到 sync-to-github.sh |
| 某个子技能找不到 | 目录存在但 SKILL.md 不存在 | 补 SKILL.md 或删除空目录 |

## 陷阱记录

- **RETAINED_SKILLS 漏加**：新增技能必须加入 `release-manager/scripts/sync-to-github.sh` 的 RETAINED_SKILLS 清单，否则下次 sync 会被删掉
- **triggers 字段**：全系统几乎所有技能都有，但 skill-creator 原则说它非标准。实际上 `version` 字段全系统都在用也不算问题。真正有影响的是：缺失 frontmatter、SKILL.md 不存在、过大
- **acquisition 嵌套**：有时会出现 `acquisition/acquisition/` 嵌套目录，是 patch 误操作遗留，检查是否为空后删除
- **description 过长**：部分技能 description 超过 200 字，虽然不影响功能但影响 token 成本，应精简

---

_版本: 1.0.0_  
_updated: 2026-04-14_
