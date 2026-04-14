---
name: skill-system-audit
description: >
  技能系统自动审计技能。发现技能碎片化、交叉引用错误、路由表损坏、YAML合法性问题。
  当用户说"审查技能系统"、"检查技能完整性"、"审计"、"find broken skills"时使用。
  通用方法论，适用于任何 skill:// 协议的技能系统。
version: 1.0.0
triggers:
  - 审查技能
  - 审计技能系统
  - find broken skills
  - skill audit
  - 检查技能完整性
---

# skill-system-audit

技能系统自动审计 — 发现交叉引用错误、路由损坏、归档技能泄露。

## 核心价值

人工翻文件永远漏东西。跨技能引用分散在几十个 SKILL.md 里，
只有程序化扫描才能保证零遗漏。本技能一次性输出完整健康报告。

## 审计维度（每次必查全部6项）

### 1. 目录 vs Manifest 一致性
检查活跃技能目录与索引清单是否完全一致。
```python
active = set(os.listdir(skills_dir)) - exclude_set
manifest_skills = extract_from_manifest(manifest_path)
assert active == manifest_skills, f"不一致: {active - manifest_skills}"
```

### 2. 路由表 YAML 合法性
解析 ROUTING-TABLE.yaml，确认 yaml.safe_load() 不抛异常。
```python
with open(routing_path) as f:
    routing = yaml.safe_load(f)  # 失败则 YAML 损坏
```

### 3. 路由表引用完整性（关键！）
**路由表结构是嵌套的**，不要假设扁平：
```
routing:
  intent_name:
    overseas: [{skill: xxx, fallback: [...]}, ...]
    domestic:  [{skill: yyy}, ...]
```
正确提取方式：
```python
def extract_skills_from_rule(rule):
    skills = []
    if isinstance(rule, list):
        for r in rule:
            skills.extend(extract_skills_from_rule(r))
    elif isinstance(rule, dict):
        if 'skill' in rule:
            skills.append(rule['skill'])
        for key in ('fallback', 'next'):
            val = item.get(key, [])
            if isinstance(val, list):
                for v in val:
                    if isinstance(v, str): skills.append(v)
    elif isinstance(rule, str):
        skills.append(rule)
    return skills

for intent, regions in routing['routing'].items():
    for region, rule_list in regions.items():
        for s in extract_skills_from_rule(rule_list):
            referenced_skills.add(s)
```

### 4. 所有技能文件交叉扫描
扫描 `skills/` 下**所有** `.md` 和 `.yaml` 文件，用正则提取 `skill://xxx` 引用：
```python
refs = re.findall(r'skill://([a-zA-Z0-9_/-]+)', content)
```
收集到 `all_refs` 集合后，与活跃技能比对。

### 5. 归档技能泄露检测（最高优先级 P0）
```
archived_used_in_routing = archived_skills & routing_referenced_skills
archived_used_in_files   = archived_skills & all_refs
任一存在即为严重错误，必须修复后才能推送。
```

### 6. 常见 typo 模式扫描
在路由 YAML 中搜索以下常见错误：
- `customer-discovery`（意图名误作技能引用）
- 路由表中 `next: [intent-name, ...]`（意图名不是技能名）

## 典型问题修复流程

**发现归档技能被引用 → 定位来源文件 → 修复 → 再次审计确认**

```python
# 定位归档技能被谁引用
for sd in skill_dirs:
    for fname in os.listdir(os.path.join(skill_dir, sd)):
        if fname.endswith(('.md', '.yaml')):
            fpath = os.path.join(skill_dir, sd, fname)
            with open(fpath) as f:
                content = f.read()
            if 'archived-skill-name' in content:
                print(f"  → {sd}/{fname}")
```

## 完整审计报告模板

```
=================================================================
技能系统审计报告
=================================================================
【基础数据】
  活跃技能: N | 归档技能: M | Manifest: K

【YAML合法性】
  ROUTING-TABLE.yaml:   ✓/✗
  SKILLS-MANIFEST.yaml:  ✓/✗

【一致性检查】
  目录 = Manifest:  ✓/✗
  路由引用全部存在: ✓/✗
  归档技能零泄露:   ✓/✗

【结论】
  ✓ 所有检查通过  或  ✗ 发现 N 个问题（见修复记录）
=================================================================
```

## 注意事项

- **不要只扫 routing 表**：父技能文件（GCA/coordinator）里的 `skill://` 引用同样要检查
- **路由表结构不是扁平的**：每个 intent 下有 `overseas`/`domestic` 分支，每分支是 `[{skill, fallback, next}]` 列表
- **patch 工具有歧义检测**：如果 `old_string` 匹配多处，patch 会拒绝执行，此时用 Python 字节级替换
- **归档后必须更新 sync-to-github.sh 的 RETAINED_SKILLS**：否则脚本同步时会跳过应该删除的技能

## 依赖

- Python 3
- PyYAML (`yaml`)

---

_Version: 1.0.0_
