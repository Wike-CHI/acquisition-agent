---
name: routing-table-audit
version: 1.0.0
description: >
  路由表 ROUTING-TABLE.yaml 审计技能。正确检查两层结构：
  (1) keywords层（描述性，不执行）(2) routing层（实际执行）。
  检测技能路由覆盖、skills_index注册完整性、空intent、路径断裂。
triggers:
  - 审查路由表
  - 审计技能系统
  - 路由表有问题
  - routing table audit
  - 检查路由
  - skill system review
category: holo-acquisition
tags: [routing, audit, skills, ROUTING-TABLE, yaml]
memory: null
---

# 路由表审计 v1.0.0

## 关键概念：路由表是双层结构

ROUTING-TABLE.yaml 包含两层完全不同的内容：

```
第1层: keywords (lines 1-~192)
  ├─ 用途：关键词+描述文档，供Agent理解意图
  ├─ NOT 执行层
  └─ 不参与路由决策

第2层: routing (lines ~193-end)
  ├─ 用途：实际执行映射
  ├─ 支持多分支结构：all_markets / overseas / domestic / facebook / linkedin
  └─ 每个分支下才是实际的 skill → priority → condition → next → fallback
```

**常见错误：** 只检查 `all_markets: []` 会漏检所有用了 `overseas/domestic` 分支的intent。

## 审计检查清单

### 1. skills_index 注册完整性

```python
import yaml, os

skill_dir = os.path.expanduser("~/.hermes/skills/acquisition")
rt = yaml.safe_load(open(os.path.join(skill_dir, "ROUTING-TABLE.yaml")))

routing = rt.get('routing', {})
skills_index = rt.get('skills_index', {})

# 收集所有被路由调用的技能
routed_skills = set()
for cfg in routing.values():
    if isinstance(cfg, dict):
        for branch in ['all_markets', 'overseas', 'domestic', 'facebook', 'linkedin']:
            items = cfg.get(branch, [])
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict) and 'skill' in item:
                        routed_skills.add(item['skill'])

# 找出缺口
in_index_not_routed = sorted(s for s in skills_index if s not in routed_skills)
in_routed_not_index = sorted(routed_skills - set(skills_index.keys()))

print(f"在skills_index但未被路由: {in_index_not_routed}")
print(f"被路由但不在skills_index: {in_routed_not_index}")
```

### 2. 检查关键技能是否在 routing 层

```python
# 关键技能必须同时满足：文件存在 + 在routing层 + 在skills_index
critical_skills = [
    "global-customer-acquisition",  # 系统主入口
    "cold-email-generator",         # 开发信发送
    "market-development-report",     # 市场调研报告
    "teyi-customs",                 # 海关数据
]

for skill in critical_skills:
    in_routing = any(skill in str(cfg) for cfg in routing.values())
    in_index = skill in skills_index
    file_exists = os.path.exists(os.path.join(skill_dir, skill, "SKILL.md"))
    print(f"{skill}: routing=✅/❌ skills_index=✅/❌ 文件=✅/❌")
```

### 3. 检查空 intent（只检查 all_markets 会漏检）

```python
# 正确做法：同时检查所有分支
empty_intents = []
for intent, cfg in routing.items():
    if isinstance(cfg, dict):
        branches = [cfg.get(b) for b in ['all_markets', 'overseas', 'domestic', 'facebook', 'linkedin']]
        if all(not v or v == [] for v in branches):
            empty_intents.append(intent)
print(f"空intent: {empty_intents}")
```

### 4. 检查 skills_index 中的技能是否真实存在

```python
for skill_name in skills_index:
    skill_path = os.path.join(skill_dir, skill_name, "SKILL.md")
    if not os.path.exists(skill_path):
        print(f"⚠️ skills_index有但文件不存在: {skill_name}")
```

### 5. YAML 合法性

```python
import yaml
try:
    yaml.safe_load(open(os.path.join(skill_dir, "ROUTING-TABLE.yaml")))
    print("✅ YAML valid")
except Exception as e:
    print(f"❌ YAML error: {e}")
```

## 常见问题及修复

### 问题1：技能在 skills_index 但路由层没有

**修复：** 找到合适的 intent，在对应分支下加入：
```yaml
some_intent:
  overseas:
  - skill: your-skill
    priority: 5
    condition: 触发关键词
    next: [...]
    fallback: [...]
```

### 问题2：主入口技能（global-customer-acquisition）无路由

**修复：** 接入 `full_pipeline` intent：
```yaml
full_pipeline:
  overseas:
  - skill: global-customer-acquisition
    priority: 6
    condition: 全流程获客/端到端获客/全套服务
    next: [acquisition-coordinator]
    fallback: []
```

### 问题3：skills_index 有但文件不存在

**修复：** 确认该技能是否应该存在，如果已废弃则从 skills_index 删除。

## known_issues

- `sales-pipeline-tracker` 的 monitor.py 引用路径 `~/.hermes/skills/acquisition/sales-pipeline-tracker/data/clients.json` 不存在（目录结构问题），CRM数据会写入失败。需要修复脚本中的路径或创建对应目录。
- `playwright` 目录下有 `ci-cd.md` 多余文档（不影响功能）

## 版本历史

- v1.0.0 (2026-04-14) — 初版，从本次全量审查中沉淀
