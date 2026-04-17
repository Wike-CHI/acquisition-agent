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

## 完整审计报告模板

```
=================================================================
技能系统审计报告
=================================================================
【基础数据】
  活跃技能: N | 归档技能: M | Manifest: K | skills_index: L

【P0 安全】
  硬编码凭证: N个（全部需清理）
  本地↔Repo同步: ✓/✗

【P1 结构】
  Frontmatter错误: N | 警告: M
  workspace/结构:  ✓/✗（运营文件是否在正确位置）
  skills_index死引用: N
  SKILLS-MANIFEST phantom: N
  name≠目录名: N

【P2 功能】
  Phantom refs vs 合法子程序: N phantom / M legitimate
  "库存有货路由无货": N
  归档技能泄露: N

【结论】
  ✓ 所有检查通过  或  ✗ 发现 N 个问题（按优先级修复）
=================================================================
```

## 路由表丢失时的重建流程

当 ROUTING-TABLE.yaml 缺失时，按以下优先级寻找备份：

1. **GitHub clone**（如果本地有 `/tmp/acquisition-agent/`）：
   `skills/acquisition-workflow/references/ROUTING-TABLE.yaml` — 这是 GitHub 备份位置，大小约 20-22KB

2. **旧版本备份目录**（`~/.hermes/skills/acquisition.bak.*/`）

3. **GitHub 仓库直接下载**：从 `https://raw.githubusercontent.com/Wike-CHI/acquisition-agent/main/skills/acquisition-workflow/references/ROUTING-TABLE.yaml`

### 重建后必做修复（4类常见问题）

从备份恢复的路由表常有4类问题，需要修复后再使用：

| 问题 | 修复 |
|------|------|
| `customer-discovery` 在 `next` 列表 | → `company-research` |
| `email-outreach-ops` 作为 skill | → `cold-email-generator` |
| `fumamx-import-adapter` 缺失 | → `fumamx-crm` |
| `fallback_map` 引用归档技能 | → 对应活跃技能 |

### 修复后验证

```python
# 提取所有引用
def extract_skills(r):
    s = []
    if isinstance(r, list):
        for x in r: s.extend(extract_skills(x))
    elif isinstance(r, dict):
        if 'skill' in r: s.append(r['skill'])
        for k in ('fallback', 'next'):
            for v in r.get(k, []):
                if isinstance(v, str): s.append(v)
    return s

# critical_missing = all_refs - active - archived（必须为空）
```

## web-access 技能使用指南（附加）

web-access 和 exa-web-search-free 是互补关系，不是替代关系：

| 工具 | 依赖 | 适用场景 |
|------|------|---------|
| `web-access` | Chrome CDP（port 3456 proxy 连到 remote-debugging port 9222） | 需要登录态、动态渲染页面、反爬严格站点（小红书、微信公众号等） |
| `exa-web-search-free` | mcporter MCP → Exa API（无需本地Chrome） | 通用搜索、摘要获取、跨平台信息发现 |

**web-access CDP 连接判断**：`node scripts/check-deps.mjs` 输出 `chrome: not connected` = Chrome remote debugging 未被 CDP proxy 连接，不是「Chrome 没开」。

启动 Chrome remote debugging（Windows）：
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

web-access 技能本身不会自动启动 Chrome，只是连接已运行的 Chrome 实例。

## 双轨索引系统：SKILLS-MANIFEST vs skills_index

**不是重叠，是分工：**

| 维度 | `SKILLS-MANIFEST.yaml` | `skills_index`（ROUTING-TABLE.yaml 内）|
|------|------------------------|----------------------------------------|
| 用途 | 人类可读的产品目录，面向"系统有什么" | 机器用运行时索引，路由系统依赖它 |
| 组织 | 13个分类（orchestration/discovery/outreach...） | 扁平无分类 |
| 元数据 | `desc` + `trigger` 双字段 | 只有 `description` |
| summary区 | 有 metadata key（groups/layers/total_active等） | 无 |
| 系统实际使用 | 否（只有 skill-system-audit 引用它） | 是 |

**审计时必须区分两类 MANIFEST 条目：**
```python
metadata_entries = {'groups', 'layers', 'total_active', 'total_archived', 'version', 'updated'}
# 这些不是技能，是 MANIFEST 的元数据键
```

**常见错误：** MANIFEST 里注册了但 skills_index 里没有 = "库存有货但货架没摆"，这类技能永远不会被路由命中。应该把它们从 MANIFEST 移到 skills_index。

**修复流程：** MANIFEST 里有、skills_index 里没有 → 检查是否在磁盘 → 追加到 skills_index。

## Frontmatter 验证（P1 必须项）

每个活跃技能的 SKILL.md 必须有 YAML frontmatter 且格式正确：

```python
import re, os

errors, warnings = [], []
for skill in disk_skills:
    path = os.path.join(skills_dir, skill, "SKILL.md")
    with open(path, 'rb') as f:
        raw = f.read()
    # BOM检测
    if raw[:3] == b'\xef\xbb\xbf':
        errors.append(f"{skill}: BOM — 三字节UTF-8签名，需删除")
    content = raw.decode('utf-8', errors='replace')
    if not content.startswith('---'):
        errors.append(f"{skill}: missing frontmatter")
        continue
    end = content.find('---', 3)
    if end == -1:
        errors.append(f"{skill}: frontmatter not closed")
        continue
    fm = content[3:end].strip()
    # 必须字段
    for field in ['name', 'version', 'description', 'triggers']:
        if not re.search(rf'^{field}:', fm, re.M):
            (errors if field != 'triggers' else warnings).append(f"{skill}: missing {field}")
    # name必须等于目录名
    name_match = re.search(r'^name:\s*(.+)', fm, re.M)
    if name_match:
        name_val = name_match.group(1).strip().strip('"').strip("'")
        if name_val != skill:
            errors.append(f"{skill}: name='{name_val}' != dir='{skill}'")
```

**常见 frontmatter 陷阱：**
- `---` 作为 Markdown 段落分隔符（非YAML）：内容里会有 `---` 块，但文件开头没有YAML frontmatter
- 多行 description 用 `description: |`（标量块）而非 `description: >` —— 只要 frontmatter 解析正常即可
- `triggers` 缺失不是致命错误（进 warnings），但应该补全

## 硬编码凭证扫描（P0 安全项）

在所有技能文件中搜索明文凭证（每次审计必须执行）：

```python
import re, os

patterns = [
    ('password', re.compile(r'password\s*[:=]\s*["\']([^"\']{4,})["\']', re.I)),
    ('auth_code', re.compile(r'auth[_-]?code\s*[:=]\s*["\']([^"\']{4,})["\']', re.I)),
    ('token', re.compile(r'token\s*[:=]\s*["\']([a-zA-Z0-9_\-]{10,})["\']', re.I)),
    ('api_key', re.compile(r'api[_-]?key\s*[:=]\s*["\']([^"\']{4,})["\']', re.I)),
    ('secret', re.compile(r'secret\s*[:=]\s*["\']([^"\']{4,})["\']', re.I)),
    ('smtp_pass', re.compile(r'(?:pass|auth)\s*[:=]\s*["\']([^"\']{4,})["\']', re.I)),
    ('bot_token', re.compile(r'bot[_-]?token\s*[:=]\s*["\']([^"\']{5,})["\']', re.I)),
    ('client_secret', re.compile(r'client[_-]?secret\s*[:=]\s*["\']([^"\']{4,})["\']', re.I)),
    ('access_token', re.compile(r'access[_-]?token\s*[:=]\s*["\']([a-zA-Z0-9_\-\.]{10,})["\']', re.I)),
]

placeholders = {'xxxxxx', 'YOUR_KEY', 'PLACEHOLDER', '{{', 'env:', 'xxx',
                '***', '****', 'NA', 'N/A', 'your_key', 'your_secret',
                'your_token', 'key123', 'pass', 'YOUR_PASS'}

skip_dirs = {'.git', 'node_modules', '.archive', 'acquisition.bak', '.bak', '.claude', '.trae', '.agents'}

for item in os.listdir(skills_dir):
    path = os.path.join(skills_dir, item)
    if not os.path.isdir(path): continue
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for fn in files:
            if not fn.endswith(('.md', '.yaml', '.yml', '.json', '.sh', '.py', '.mjs', '.cjs', '.js')):
                continue
            fp = os.path.join(root, fn)
            try:
                content = open(fp, errors='ignore').read()
            except:
                continue
            for pname, pre in patterns:
                for m in pre.finditer(content):
                    val = m.group(1)
                    # 过滤占位符和URL
                    if val in placeholders: continue
                    if len(val) > 50 and any(c in val for c in [':', '/', '@']): continue
                    line_num = content[:m.start()].count('\n') + 1
                    print(f"⚠️  {fp} L{line_num} [{pname}]: {val[:30]}")
```

**注意：** 凭证必须用环境变量注入，脚本只从 `process.env.XXX` 读取。`/tmp/sender.mjs` 正确示范：
```js
// 错误：明文
pass: 'TSghSNqqZxN7je7Y'

// 正确：环境变量
pass: process.env.HOLO_SMTP_PASS
```

## 完整审计报告模板

```
=================================================================
技能系统审计报告
=================================================================
【基础数据】
  活跃技能: N | 归档技能: M | skills_index: K | SKILLS-MANIFEST: L

【P0 安全】
  硬编码凭证: N个（全部需清理）

【P1 结构】
  Frontmatter错误: N | 警告: M
  skills_index死引用: N
  SKILLS-MANIFEST phantom: N
  name≠目录: N

【P2 功能】
  "库存有货路由无货": N（建议注册到skills_index）
  重复内容文件: N（主目录 vs .archive/）

【结论】
  ✓ 所有检查通过  或  ✗ 发现 N 个问题（按优先级修复）
=================================================================
```

## 注意事项

- **不要只扫 routing 表**：父技能文件（GCA/coordinator）里的 `skill://` 引用同样要检查
- **路由表结构不是扁平的**：每个 intent 下有 `overseas`/`domestic` 分支，每分支是 `[{skill, fallback, next}]` 列表
- **patch 工具有歧义检测**：如果 `old_string` 匹配多处，patch 会拒绝执行，此时用 Python 字节级替换
- **归档后必须更新 sync-to-github.sh 的 RETAINED_SKILLS**：否则脚本同步时会跳过应该删除的技能
- **路由表修复4步**：从备份恢复 → YAML解析验证 → 修复4类破损引用 → 提取验证无 critical_missing
- **MANIFEST 里的不都是技能**：先过滤 `metadata_entries` 再比较
- **凭证扫描用宽regex但过滤严**：假阳性多（`pass` 字段到处都是），但真实凭证要全部清理

## 依赖

- Python 3
- PyYAML (`yaml`)

---

_Version: 1.1.0_
