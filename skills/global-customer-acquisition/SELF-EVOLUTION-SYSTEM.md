# 技能集群自进化系统 v2.3.0

> 让获客系统持续学习用户反馈，自动优化，上传GitHub
> 更新时间：2026-04-01

---

## 设计理念

**核心循环（v2.3.0 新版）**:
```
流程执行 → 收集学习信号 → 晋升/降级分析 → 自我优化 → 上传GitHub → 记录进化日志 → 心跳维护
```

**旧版（v2.2.0）循环**:
```
流程执行 → 收集反馈 → 分析建议 → 自我优化 → 上传GitHub → 下次改进
```

---

## 完整流程（v2.3.0）

```
┌─────────────────────────────────────────────────────────────┐
│  技能集群自进化循环 v2.3.0                                  │
├─────────────────────────────────────────────────────────────┤
│  1. 执行获客流程                                            │
│     └── 完成后触发学习信号收集                              │
│                                                             │
│  2. 收集学习信号 ✨（v2.3.0 新增）                          │
│     ├── 显式纠正（立即HOT）                                 │
│     ├── 明确偏好（重复2次→HOT）                             │
│     ├── 成功工作流（重复3次→HOT）                           │
│     ├── 自我反思（重复3次→HOT）                             │
│     └── 用户反馈（根据评分决定）                            │
│                                                             │
│  3. 晋升/降级分析 ✨（v2.3.0 新增）                         │
│     ├── 检查重复次数和频率                                  │
│     ├── 重复3次在7天内 → 晋升到 HOT                        │
│     ├── 未使用30天 → 降级到 WARM                            │
│     └── 未使用90天 → 归档到 COLD                           │
│                                                             │
│  4. 自我优化                                                │
│     ├── 修改 SKILL.md                                       │
│     ├── 更新 HOT/WARM/COLD 记忆                            │
│     ├── 添加新模板                                          │
│     └── 更新最佳实践                                        │
│                                                             │
│  5. 上传GitHub                                              │
│     ├── git add .                                           │
│     ├── git commit -m "优化: [用户建议摘要]"               │
│     └── git push                                            │
│                                                             │
│  6. 记录进化日志                                            │
│     └── 记录版本号、优化内容、学习信号                      │
│                                                             │
│  7. 心跳维护 ✨（v2.3.0 新增）                              │
│     ├── 每日检查：proactivity系统状态                       │
│     ├── 每周检查：HOT规则使用率和晋升/降级                  │
│     └── 每月检查：系统文档更新和归档                        │
└─────────────────────────────────────────────────────────────┘
```

---

## v2.3.0 核心更新内容

### 三层记忆系统

```
HOT（确认的持久化规则） → WARM（领域级/项目级学习） → COLD（冷存储）
```

**HOT 记忆**（5大核心规则）：
1. 无邮箱不进入开发信步骤
2. 报价灵活，不硬性推销
3. 避免矿业客户（15,885家客户数据验证）
4. LinkedIn决策人用Exa语义搜索
5. 开发信生成v2.0真正打磨流程（≥9.0分）

**WARM 记忆**：
- 美国市场获客经验（3家客户案例）
- LinkedIn搜索最佳实践
- 开发信质量标准（≥9.0分）

**COLD 记忆**：
- 归档和 graveyard 目录

### 5种学习信号分类

| 信号类型 | 存储位置 | 晋升速度 | 优先级 |
|---------|---------|---------|--------|
| **显式纠正** | HOT/memory.md | 立即HOT | P0 |
| **明确偏好** | HOT/memory.md | 重复2次→HOT | P1 |
| **成功工作流** | WARM/projects/ | 重复3次→HOT | P2 |
| **自我反思** | WARM/domains/ | 重复3次→HOT | P2 |
| **用户反馈** | WARM/projects/ | 根据评分决定 | P1 |

### 自动晋升/降级机制

**晋升规则**：
- 重复3次在7天内 → 晋升到 HOT
- 重复使用的 pattern（重复3次以上）→ 晋升到 SKILL.md

**降级规则**：
- 未使用30天 → 降级到 WARM
- 未使用90天 → 归档到 COLD

### proactivity系统

- **激活规则和边界保护**
- **会话状态管理**
- **心跳维护**（每日/每周检查）
- **5个可重用成功模式**

---

## v2.2.0 旧版流程（参考）

## 1. 反馈收集

### 触发时机

```
流程执行完成后，自动询问：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 本次获客流程完成！

请为本次体验评分：
⭐⭐⭐⭐⭐ (1-5星)

或有任何建议？请告诉我：
_________________________________

[跳过] [提交反馈]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 反馈格式

```json
{
  "session_id": "2026-03-27-13-56-abc123",
  "timestamp": "2026-03-27T13:56:00Z",
  "rating": 4,
  "suggestion": "LinkedIn搜索速度有点慢，可以优化一下",
  "issues": ["LinkedIn MCP 启动慢"],
  "best_practices": ["开发信模板很好用"],
  "user_id": "wike"
}
```

---

## 2. 反馈分析

### 评分处理

| 评分 | 触发动作 | 说明 |
|------|----------|------|
| ⭐ (1星) | 紧急优化 | 立即分析问题，优先修复 |
| ⭐⭐ (2星) | 深度优化 | 分析问题，制定优化方案 |
| ⭐⭐⭐ (3星) | 常规优化 | 记录问题，下次优化 |
| ⭐⭐⭐⭐ (4星) | 记录 | 记录为最佳实践 |
| ⭐⭐⭐⭐⭐ (5星) | 推广 | 记录并推广为标准流程 |

### 建议分类

```python
def analyze_suggestion(suggestion):
    """分析用户建议"""
    
    # 关键词分类
    categories = {
        "性能": ["慢", "快", "速度", "效率", "优化"],
        "功能": ["添加", "增加", "缺少", "没有", "需要"],
        "体验": ["难用", "方便", "简单", "复杂", "不清楚"],
        "质量": ["错误", "不准", "问题", "bug", "不准确"],
        "其他": []
    }
    
    for category, keywords in categories.items():
        if any(keyword in suggestion for keyword in keywords):
            return category
    
    return "其他"
```

### 自动生成优化方案

```python
def generate_optimization_plan(feedback):
    """根据反馈生成优化方案"""
    
    plan = {
        "priority": "high" if feedback.rating < 3 else "normal",
        "category": analyze_suggestion(feedback.suggestion),
        "actions": []
    }
    
    # 根据建议生成具体行动
    if "慢" in feedback.suggestion:
        plan["actions"].append({
            "file": "CHANNEL-ROUTER.md",
            "action": "优化渠道选择逻辑，减少等待时间"
        })
    
    if "不清楚" in feedback.suggestion:
        plan["actions"].append({
            "file": "SKILL.md",
            "action": "增加更清晰的说明和示例"
        })
    
    return plan
```

---

## 3. 自我优化

### 自动修改文件

```python
def optimize_skill(plan):
    """根据优化方案自动修改技能文件"""
    
    for action in plan["actions"]:
        file_path = action["file"]
        modification = action["action"]
        
        # 读取现有文件
        content = read_file(file_path)
        
        # 根据建议修改内容
        if "增加说明" in modification:
            new_content = add_explanation(content, modification)
        elif "优化逻辑" in modification:
            new_content = optimize_logic(content, modification)
        else:
            new_content = content + f"\n\n<!-- 优化建议: {modification} -->"
        
        # 写回文件
        write_file(file_path, new_content)
        
        # 记录修改
        log_modification(file_path, modification)
```

### 版本管理

```
skills/
├── global-customer-acquisition/
│   ├── SKILL.md                    # 当前版本
│   ├── versions/
│   │   ├── v1.0.0.md              # 历史版本
│   │   ├── v1.1.0.md
│   │   └── v1.2.0.md
│   └── CHANGELOG.md               # 变更日志
```

---

## 4. Git自动提交

### 提交流程

```python
def commit_to_github(feedback, modifications):
    """自动提交优化到GitHub"""
    
    import subprocess
    
    # 生成提交消息
    commit_msg = f"""优化: {feedback.suggestion[:50]}

评分: {'⭐' * feedback.rating}
建议: {feedback.suggestion}
修改: {len(modifications)} 个文件

优化内容:
{format_modifications(modifications)}
"""
    
    # Git 操作
    subprocess.run(["git", "add", "."], cwd=skill_path)
    subprocess.run(["git", "commit", "-m", commit_msg], cwd=skill_path)
    subprocess.run(["git", "push"], cwd=skill_path)
    
    return commit_msg
```

### 提交消息示例

```
优化: LinkedIn搜索速度有点慢，可以优化一下

评分: ⭐⭐⭐⭐
建议: LinkedIn搜索速度有点慢，可以优化一下
修改: 2 个文件

优化内容:
- CHANNEL-ROUTER.md: 添加LinkedIn MCP预热机制
- SKILL.md: 更新智能路由逻辑，优先使用Exa索引

感谢 @wike 的反馈！
```

---

## 5. 进化日志

### CHANGELOG.md

```markdown
# 更新日志

## [1.2.1] - 2026-03-27

### 优化
- LinkedIn搜索速度优化（用户反馈: @wike）
  - 添加MCP预热机制
  - 优先使用Exa索引数据
  - 减少等待时间50%

### 反馈统计
- 评分: ⭐⭐⭐⭐ (4/5)
- 建议: "LinkedIn搜索速度有点慢"
- 修改文件: 2个

---

## [1.2.0] - 2026-03-27

### 新增
- 智能路由系统
- 开发信自动检查
- 回退方案

### 优化
- 基于官方5种Skill设计模式重构

---

## [1.1.0] - 2026-03-26

### 新增
- 竞品分析功能
- LinkedIn决策人搜索
```

---

## 6. 完整实现

### 伪代码

```python
class SkillEvolution:
    """技能集群自进化系统"""
    
    def __init__(self):
        self.feedback_log = "feedback.json"
        self.changelog = "CHANGELOG.md"
        self.version = self.load_version()
    
    def collect_feedback(self, session_result):
        """收集用户反馈"""
        
        # 显示评分界面
        rating = ask_rating()
        suggestion = ask_suggestion()
        
        # 保存反馈
        feedback = {
            "session_id": session_result.id,
            "timestamp": datetime.now().isoformat(),
            "rating": rating,
            "suggestion": suggestion,
            "user_id": get_current_user()
        }
        
        self.save_feedback(feedback)
        
        # 触发优化
        if rating < 4 or suggestion:
            self.optimize(feedback)
    
    def optimize(self, feedback):
        """根据反馈优化"""
        
        # 分析反馈
        plan = self.analyze_feedback(feedback)
        
        # 执行优化
        modifications = []
        for action in plan["actions"]:
            mod = self.modify_file(action)
            modifications.append(mod)
        
        # 提交到GitHub
        if modifications:
            self.commit_to_github(feedback, modifications)
        
        # 更新版本
        self.update_version(feedback)
        
        # 记录日志
        self.update_changelog(feedback, modifications)
    
    def analyze_feedback(self, feedback):
        """分析反馈生成优化方案"""
        
        plan = {
            "priority": "high" if feedback["rating"] < 3 else "normal",
            "category": self.classify_suggestion(feedback["suggestion"]),
            "actions": []
        }
        
        # 使用AI分析建议
        analysis = self.ai_analyze(feedback["suggestion"])
        
        # 生成具体行动
        plan["actions"] = analysis["actions"]
        
        return plan
    
    def commit_to_github(self, feedback, modifications):
        """提交到GitHub"""
        
        commit_msg = f"""优化: {feedback['suggestion'][:50]}

评分: {'⭐' * feedback['rating']}
建议: {feedback['suggestion']}
修改: {len(modifications)} 个文件

感谢 @{feedback['user_id']} 的反馈！
"""
        
        subprocess.run(["git", "add", "."])
        subprocess.run(["git", "commit", "-m", commit_msg])
        subprocess.run(["git", "push"])
```

---

## 7. 使用示例

### 示例1: 收集反馈

```
AI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 本次获客流程完成！

✅ 找到客户: 50家
✅ 背调完成: 10家
✅ 开发信: 3封

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请为本次体验评分：

⭐⭐⭐⭐⭐

或有任何建议？

用户: ⭐⭐⭐⭐ LinkedIn搜索速度有点慢，可以优化一下

AI:
✅ 感谢反馈！

正在分析...
- 分类: 性能优化
- 优先级: 高
- 建议内容: LinkedIn搜索速度有点慢

正在优化...
- 修改 CHANNEL-ROUTER.md
- 修改 SKILL.md
- 添加 LinkedIn MCP 预热机制

正在提交到GitHub...
✅ 已提交: commit abc123

版本已更新: v1.2.0 → v1.2.1

感谢您的建议！下次使用时会更快。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 8. 技术实现细节

### 需要的工具

| 工具 | 用途 | 状态 |
|------|------|------|
| **Git** | 版本控制 | ✅ 已安装 |
| **GitHub** | 远程仓库 | ⚠️ 需配置 |
| **文件读写** | 修改技能文件 | ✅ 已有 |
| **AI分析** | 分析用户建议 | ✅ 已有 |

### 配置GitHub

```bash
# 首次配置
git config --global user.name "HOLO AI"
git config --global user.email "ai@holobelt.com"

# 配置SSH密钥（如果需要）
ssh-keygen -t rsa -b 4096 -C "ai@holobelt.com"
# 添加到GitHub Settings > SSH Keys

# 克隆仓库
git clone git@github.com:holo-ai/customer-acquisition-skills.git
```

### 目录结构

```
customer-acquisition-skills/
├── .git/
├── skills/
│   └── global-customer-acquisition/
│       ├── SKILL.md
│       ├── CHANNEL-ROUTER.md
│       ├── EMAIL-QUALITY-CHECK.md
│       ├── FALLBACK-PLAN.md
│       └── ...
├── feedback/
│   └── feedback-2026-03-27.json
├── CHANGELOG.md
└── README.md
```

---

## 9. 难度评估

### 各组件难度

| 组件 | 难度 | 工作量 | 说明 |
|------|------|--------|------|
| 反馈收集 | ⭐ | 1小时 | 简单的问答界面 |
| 反馈分析 | ⭐⭐ | 2小时 | 关键词匹配 + AI分析 |
| 自我优化 | ⭐⭐ | 3小时 | 文件修改 + 版本管理 |
| Git提交 | ⭐ | 1小时 | 调用git命令 |
| **总计** | ⭐⭐ | **7小时** | **一个下午可完成** |

### 难点

1. **AI分析准确性** - 需要准确理解用户建议
   - 解决: 使用AI模型分析，人工审核关键修改

2. **文件修改安全性** - 避免破坏现有功能
   - 解决: 只追加，不删除；关键修改需人工确认

3. **Git冲突处理** - 多人协作时可能冲突
   - 解决: 自动pull + merge，失败时通知人工处理

---

## 10. 实施计划

### Phase 1: 基础版（1天）

```
✅ 反馈收集（评分 + 文字建议）
✅ 反馈保存（JSON格式）
✅ 简单分析（关键词分类）
✅ 手动优化（AI建议，人工修改）
```

### Phase 2: 自动化（2天）

```
✅ 自动分析（AI分析建议）
✅ 自动修改（简单修改自动执行）
✅ Git自动提交
✅ CHANGELOG自动更新
```

### Phase 3: 智能化（3天）

```
✅ 深度学习（从历史反馈学习）
✅ 预测优化（预测用户需求）
✅ A/B测试（对比不同优化方案）
✅ 推广最佳实践
```

---

## 11. 快速开始

### 最小可行版本（MVP）

**今天就能用**:

```python
# feedback_collector.py

def collect_feedback():
    """收集用户反馈"""
    
    rating = input("请评分 (1-5): ")
    suggestion = input("建议: ")
    
    # 保存反馈
    feedback = {
        "timestamp": datetime.now().isoformat(),
        "rating": int(rating),
        "suggestion": suggestion
    }
    
    with open("feedback.json", "a") as f:
        f.write(json.dumps(feedback) + "\n")
    
    # 如果有建议，触发优化
    if suggestion:
        print("\n✅ 感谢反馈！")
        print("正在分析建议...")
        
        # AI分析
        analysis = ai_analyze(suggestion)
        print(f"优化建议: {analysis}")
        
        # 提交到Git
        if input("是否提交到GitHub? (y/n): ") == "y":
            subprocess.run(["git", "add", "."])
            subprocess.run(["git", "commit", "-m", f"优化: {suggestion[:50]}"])
            subprocess.run(["git", "push"])
            print("✅ 已提交到GitHub")
```

---

## 总结

### 可行性: ✅ 完全可行

### 难度: ⭐⭐ 中等偏易

### 工作量: 7小时（一个下午）

### 核心价值

> **让系统持续学习用户反馈，越用越好用！**

---

_更新时间：2026-04-01_
_版本: v2.3.0_
_状态: 已整合三层记忆系统 + proactivity系统_

---

## v2.3.0 整合总结

### 核心升级

1. **三层记忆系统**：
   - HOT：确认的持久化规则和偏好
   - WARM：领域级/项目级学习
   - COLD：冷存储

2. **5种学习信号**：
   - 显式纠正、明确偏好、成功工作流、自我反思、用户反馈

3. **自动晋升/降级**：
   - 晋升：重复3次在7天内
   - 降级：未使用30天→WARM，未使用90天→COLD

4. **proactivity系统**：
   - 激活规则、会话状态、心跳维护、5个可重用模式

5. **7步自进化循环**：
   - 执行获客流程 → 收集学习信号 → 晋升/降级分析 → 自我优化 → 上传GitHub → 记录进化日志 → 心跳维护

### 整合效果

| 项目 | 整合前 | 整合后 | 改善 |
|------|--------|--------|------|
| **学习系统** | ❌ 无系统化学习 | **✅ 三层记忆系统** | ⭐⭐⭐⭐⭐ |
| **学习信号** | ❌ 只有用户反馈 | **✅ 5种学习信号** | ⭐⭐⭐⭐⭐ |
| **晋升/降级** | ❌ 无自动机制 | **✅ 自动晋升/降级** | ⭐⭐⭐⭐⭐ |
| **上下文恢复** | ⭐⭐ 手动查找 | **✅ 自动恢复** | ⭐⭐⭐⭐ |
| **心跳维护** | ❌ 无 | **✅ 定期检查** | ⭐⭐⭐⭐⭐ |
| **主动系统** | ❌ 无 | **✅ 5个模式** | ⭐⭐⭐⭐⭐ |

### 核心价值

> **将红龙获客系统从"手动优化"升级为"持续自动学习"，越用越好用！**
