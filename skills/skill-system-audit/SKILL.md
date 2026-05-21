---
name: skill-system-audit
description: >
  技能系统自动审计技能。发现技能碎片化、交叉引用错误、路由表损坏、YAML合法性问题。
  当用户说"审查技能系统"、"检查技能完整性"、"审计"、"find broken skills"时使用。
  通用方法论，适用于任何 skill:// 协议的技能系统。
version: "1.1.0"
triggers:
  - 审查技能
  - 审计技能系统
  - find broken skills
  - skill audit
  - 检查技能完整性
---

# skill-system-audit

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]]


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

## 本地 vs GitHub Repo 同步检查（必查）

本地系统（`~/.hermes/skills/acquisition/`）和 GitHub 备份（`/tmp/acquisition-agent/`）必须完全对齐。常见不一致场景：

| 场景 | 原因 | 后果 |
|------|------|------|
| 修复本地 skill 后未同步到 repo | 单次同步不完整 | repo 包含旧版本，tag 指向错误 commit |
| repo 有本地没有的文件 | 中间同步引入了非预期文件 | `.gitignore` 不一致 |
| deploy/ 和 local/ 在两边 | 这些是环境专属目录 | size 对比时干扰 |

**正确比较方式（排除环境专属目录）：**
```python
def get_file_map(root, exclude_dirs=None):
    m = {}
    for dirpath, dirname, filenames in os.walk(root):
        if exclude_dirs:
            dirname[:] = [d for d in dirname if d not in exclude_dirs]
        for fn in filenames:
            fp = os.path.join(dirpath, fn)
            m[os.path.relpath(fp, root)] = fp
    return m

exclude = {'.git', 'deploy/', 'local/'}
lt = get_file_map(local_root, exclude)
rt = get_file_map(repo_root,  exclude)

only_local = sorted(set(lt) - set(rt))
only_repo  = sorted(set(rt) - set(lt))
diff_sizes = [(k, os.path.getsize(lt[k]), os.path.getsize(rt[k]))
              for k in sorted(set(lt) & set(rt))
              if os.path.getsize(lt[k]) != os.path.getsize(rt[k])]

print(f"Files only in local:  {only_local  or 'none ✅'}")
print(f"Files only in repo:   {only_repo   or 'none ✅'}")
print(f"Different sizes:      {diff_sizes  or 'none ✅'}")
```

**同步流程（每次推送前必须执行）：**
```
1. git -C REPO reset --hard origin/main  # 确保 repo 是 origin 最新
2. rm -rf REPO/*                          # 清理（保留 .git/）
3. 重建 REPO 内容（cp -r 排除 deploy/ local/ .git/）
4. git add -A && git status --short        # 确认变更范围合理
5. git commit -m "描述"
6. git push
```

## 目录结构 vs GitHub 同步规则

**当参考模板要求 `workspace/` 子目录时：**
参考模板将运营文件（AGENTS.md/HEARTBEAT.md等）放在 `workspace/` 子目录里。本地系统根目录的运营文件应该移入 `workspace/`，但以下文件**留在根目录**（Windows cron 脚本依赖）：
- `.last-sync-hashes.json` — Windows 定时任务写入，必须在根目录
- `.gitignore` — Git 本身需要

**检查点：**
```python
# workspace/ 里应该有这些文件
expected_ws = ['AGENTS.md', 'HEARTBEAT.md', 'MEMORY.md',
               'ROUTING-TABLE.yaml', 'SKILLS-MANIFEST.yaml']
for f in expected_ws:
    in_root = os.path.exists(os.path.join(LOCAL, f))
    in_ws   = os.path.exists(os.path.join(LOCAL, 'workspace', f))
    if in_root and not in_ws:
        print(f"⚠️  {f} 在根目录，应该移入 workspace/")
    elif in_ws and not in_root:
        print(f"✅ {f} 在 workspace/（正确）")
```

## 区分 Phantom Refs vs 合法子程序调用

交叉技能引用不一定都是 phantom ref。以下两种情况是**合法的**，不是错误：

| 调用关系 | 说明 | 是否 phantom |
|---------|------|-------------|
| `smart-quote → company-research` | 报价前必须先背调，正确的流程依赖 | ✅ 合法 |
| `cold-email-generator → sdr-humanizer` | 开发信生成后去AI味，正确的工作流 | ✅ 合法 |
| `A → archive/skill-X` | 引用已归档技能 | ❌ Phantom，必须修复 |
| `A → nonexistent-skill` | 引用不存在的技能 | ❌ Phantom，必须修复 |

**判断方法：** 读取被引用的 SKILL.md，看是否真的存在于 `skills/` 或 `archive/` 目录里。

```python
import os, re

def find_all_skill_refs(skills_dir):
    """扫描所有 .md/.yaml 文件，收集 skill://xxx 引用"""
    refs = {}
    for root, dirs, files in os.walk(skills_dir):
        dirs[:] = [d for d in dirs if d not in {'.git', '__pycache__'}]
        for fn in files:
            if not fn.endswith(('.md', '.yaml', '.yml')):
                continue
            fp = os.path.join(root, fn)
            try:
                content = open(fp).read()
            except:
                continue
            for m in re.finditer(r'skill://([a-zA-Z0-9_/-]+)', content):
                skill_name = m.group(1)
                refs.setdefault(skill_name, []).append(fp)
    return refs

def check_legitimacy(refs, disk_skills, archived_skills):
    """区分合法子程序调用 vs phantom refs"""
    phantom = []
    legitimate = []
    for skill, files in refs.items():
        if skill in disk_skills or skill in archived_skills:
            legitimate.append((skill, files))
        else:
            phantom.append((skill, files))
    return phantom, legitimate
```

---

## 详细参考

> 以下内容已拆分到 [[references/audit-templates.md]]，仅在需要时读取：
> - 完整审计报告模板
> - 路由表丢失时的重建流程
> - web-access 技能使用指南（附加）
> - 双轨索引系统：SKILLS-MANIFEST vs skills_index
> - Frontmatter 验证（P1 必须项）
> - 硬编码凭证扫描（P0 安全项）
> - ... 及其他 2 个章节
>
> 完整审计报告模板、路由表重建流程、web-access指南、双轨索引系统、Frontmatter验证和硬编码凭证扫描。
