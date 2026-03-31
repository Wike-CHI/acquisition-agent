# 红龙获客系统 - 完整架构分析报告

> 分析时间：2026-04-02
> 系统版本：v2.3.0
> 分析范围：主技能 + 子技能 + 理解技能 + 发布管理 + 外部技能

---

## 🏗️ 系统层次结构

```
┌─────────────────────────────────────────────────────────────┐
│  红龙获客系统完整生态                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 主技能层 (763个文档)                                     │
│     └── global-customer-acquisition/                       │
│         ├── SKILL.md (主技能定义)                           │
│         ├── 7层上下文 (IDENTITY→TOOLS)                      │
│         ├── Skills Router (智能路由)                         │
│         ├── 32个子技能 (skills/)                             │
│         └── 完整文档系统                                     │
│                                                             │
│  2. 理解技能层 (自进化系统)                                 │
│     └── understand-honglong-acquisition/                    │
│         ├── 三层记忆系统 (HOT/WARM/COLD)                    │
│         ├── 5种学习信号                                     │
│         ├── 自动晋升/降级机制                               │
│         └── references/ (架构/流程/排错)                    │
│                                                             │
│  3. 发布管理层 (打包分发)                                   │
│     └── release-manager/                                    │
│         ├── 扫描workspace变更                               │
│         ├── 智能版本号 (SemVer)                              │
│         ├── 完整workspace打包                              │
│         └── Git集成 (CHANGELOG+提交+标签)                   │
│                                                             │
│  4. 外部技能层 (21个独立技能)                              │
│     └── .openclaw/skills/                                   │
│         ├── Office文档 (docx/pptx/xlsx)                    │
│         ├── NAS访问 (nas-file-reader) ✨                   │
│         ├── 搜索能力 (tavily/brave)                         │
│         ├── 邮件系统 (email-skill)                         │
│         └── 20个其他技能                                    │
│                                                             │
│  5. 工作目录技能池 (145个技能)                              │
│     └── ~/.workbuddy/skills/                                │
│         ├── 所有.openclaw/skills来源                        │
│         ├── 额外专用技能                                   │
│         └── 开发工具技能                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 核心发现

### 1. 双重技能架构

**理解技能** (`understand-honglong-acquisition`)：
- **作用**：让AI理解如何使用主技能
- **核心**：三层记忆系统 + 5种学习信号
- **目标**：AI越用越聪明，从实践中学习

**主技能** (`global-customer-acquisition`)：
- **作用**：实际的获客操作执行
- **核心**：32个子技能 + Skills Router + ECL
- **目标**：完成获客全流程

### 2. 完整的学习机制

```
用户反馈 → 学习信号识别 → 记录到对应层级
    ↓
HOT (≤100行) ← 每次必加载 ← 优先使用
    ↓
WARM (≤200行) ← 匹配时加载 ← 待定晋升
    ↓
COLD (无限) ← 显式查询 ← 长期归档
```

**5种学习信号**：
1. **修正信号**：用户说"不对" → 记录到corrections.md
2. **偏好信号**：用户说"我喜欢" → 记录到memory.md (HOT)
3. **模式信号**：重复3次 → 候选模式 → 确认后晋升HOT
4. **失败信号**：执行错误 → 记录到PRACTICE-CASES.md
5. **优化信号**：用户说"可以更好" → 评估后存储

### 3. Skills Router 智能路由

**关键规则**（最容易错）：
```javascript
// ❌ 错误做法
LinkedIn决策人 → linkedin技能

// ✅ 正确做法
LinkedIn决策人 → Exa搜索 (site:linkedin.com)
```

**路由表**：
- 决策人搜索：国内外都用Exa
- 社媒运营：ai-social-media-content + 各平台技能
- 客户发现：teyi → exa → facebook

### 4. 完整打包链路

**release-manager的工作流程**：
```
1. 扫描skills/目录变更
   ↓
2. 智能计算版本号
   - 新增技能 → MINOR+1
   - 删除技能 → MAJOR+1
   - 修改技能 → PATCH+1
   ↓
3. 生成CHANGELOG
   ↓
4. 打包整个workspace
   ├── 主技能 (global-customer-acquisition/)
   ├── 子技能 (skills/)
   ├── 7层上下文
   ├── 脚本 (scripts/)
   ├── 记忆 (memory/)
   └── 客户数据 (customer-data/)
   ↓
5. Git集成 (提交+标签+推送)
```

### 5. 关键数据验证

**ICP客户群体**（基于15,885家客户数据）：
- PVC PU输送带分销商：2,451家 (15.4%)
- 橡胶输送带分销商：427家 (2.7%)
- 皮带加工厂：276家 (1.7%)
- 工程公司/集成商：95家 (0.6%)
- ⚠️ **避免矿业客户**（验证0家）

**开发信生成v2.0**：
```
生成 → 润色1 → 评分 < 9.0?
  ↓ 是              ↓ 否
润色2 → 评分 ≥ 9.0 → 完成
```

---

## 🔗 技能依赖关系

```
understand-honglong-acquisition (理解层)
    ↓ 指导使用
global-customer-acquisition (执行层)
    ├── acquisition-coordinator (任务协调)
    ├── acquisition-init (初始化)
    ├── acquisition-workflow (工作流)
    ├── linkedin/ (LinkedIn获客)
    ├── email-sender/ (邮件发送)
    ├── teyi-customs/ (海关数据)
    ├── humanize-ai-text/ (AI文本润色)
    ├── chroma-memory/ (向量记忆)
    └── ... 32个子技能
    ↓ 调用外部技能
.openclaw/skills/ (21个外部技能)
    ├── nas-file-reader ✨ (NAS访问)
    ├── docx/pptx/xlsx (Office)
    ├── tavily-search/brave-web-search (搜索)
    └── email-skill/memos-memory-guide (邮件/笔记)
    ↓ 打包发布
release-manager (发布管理)
    └── 生成 honglong-acquisition-agent-vX.X.X.zip
```

---

## 📊 系统规模统计

| 层级 | 技能数 | 文档数 | 大小 |
|------|--------|--------|------|
| 主技能 | 1 | 763 | 394KB |
| 理解技能 | 1 | 5 | 6KB |
| 子技能 | 32 | - | - |
| 外部技能 | 21 | 250+ | 4MB |
| 工作目录技能 | 145 | - | - |
| **总计** | **200+** | **1000+** | **4MB+** |

---

## ⚡ 关键洞察

1. **双重架构**：理解技能 + 主技能 = 自学习 + 执行
2. **三层记忆**：HOT(常用) → WARM(候选) → COLD(归档)
3. **智能路由**：Skills Router自动选择最佳渠道
4. **完整生态**：从获客 → 转化 → 跟进 → 学习优化
5. **NAS集成**：nas-file-reader提供产品资料访问
6. **发布管理**：release-manager自动化版本管理和打包

---

*报告生成时间：2026-04-02*
*系统完整版本：v2.3.0 FINAL*
