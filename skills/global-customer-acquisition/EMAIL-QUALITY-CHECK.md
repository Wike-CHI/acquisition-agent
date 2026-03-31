# 开发信质量检查流程

> 模式三：反复打磨直到满意
> 更新时间：2026-03-27

---

## 设计思路

根据官方推荐的模式三：
> "适合对质量有要求的输出。先出初稿，然后用检查脚本找问题，
> 修完再查，循环几轮直到达标。关键是设定停止条件。"

---

## 完整流程

```
┌─────────────────────────────────────────────────────────────┐
│  开发信生成 + 自动检查流程                                  │
├─────────────────────────────────────────────────────────────┤
│  1. 生成初稿                                                │
│     ↓                                                       │
│  2. 自动检查（5个维度）                                     │
│     ├── AI感检测（是否像机器人）                           │
│     ├── 个性化检测（是否足够定制）                         │
│     ├── 专业性检测（是否符合行业规范）                     │
│     ├── 语法检测（英文是否正确）                           │
│     └── CTA检测（是否有明确行动号召）                      │
│     ↓                                                       │
│  3. 是否通过？                                              │
│     ├── 是 → 输出最终版本                                  │
│     └── 否 → 修改 → 回到步骤2（最多3轮）                   │
│                                                             │
│  停止条件：检查通过 OR 迭代3轮                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 检查标准（5个维度）

### 1. AI感检测

**检测项**:
- ❌ "I hope this email finds you well"（机器人常用）
- ❌ "I'm reaching out to..."（过于正式）
- ❌ "Best regards" + 全名（过于正式）
- ❌ 完全没有口语化表达（全篇正式商务英语）
- ✅ "Hi [First Name],"（自然）
- ✅ 缩写形式（I'm, You're, We're）
- ✅ 偶尔的口语化表达（"Saw you're...", "Just wanted to check in"）
- ✅ 用 "Best" 代替 "Best regards"

**评分标准**:
| AI感程度 | 评分 | 说明 |
|----------|------|------|
| 低（自然）| 10/10 | 读起来像真人写的，有口语化 |
| 中 | 7/10 | 有些正式但可接受 |
| 高（机器人）| 0/10 | 一看就是群发，完全正式 |

---

### 1.5 痛点共情检测 ⭐新增（2026-04-01）

**检测项**:
- ❌ 只说优点不说痛点（"Our equipment offers..." × N）
- ✅ 提到客户面临的挑战（"I know X is challenging..."）
- ✅ 提到客户行业痛点（"With rising material costs..."）
- ✅ 共情客户决策压力（"As [职位], you're likely juggling..."）
- ✅ 优点和痛点结合（"We can help you [解决痛点] by [我们的优势]"）

**评分标准**:
| 痛点共情 | 评分 | 说明 |
|---------|------|------|
| 高 | 10/10 | 明确提到客户痛点 + 提供解决方案 |
| 中 | 7/10 | 提到客户背景但不够深入 |
| 低 | 0/10 | 只说优点，完全不提客户痛点 |

**最佳实践（2026-04-01 案例）**:
- ❌ "Our equipment offers titanium heating plates and 30% energy efficiency." → 改为 "With rising energy costs in mining operations, our titanium heating plates help reduce energy consumption by 30% while maintaining precise temperature control."
- ❌ "Our vulcanizers have a 2-year warranty." → 改为 "I understand equipment downtime is costly. That's why our vulcanizers come with a 2-year warranty and modular design for quick field repairs."
- ❌ "We've been manufacturing for 18 years." → 改为 "Managing multiple suppliers for belt splicing equipment can be complex. We've streamlined this for mining clients over the past 18 years with a single-source solution."

---

### 2. 个性化检测

**检测项**:
- ✅ 提到客户公司名
- ✅ 提到客户具体业务
- ✅ 提到客户地区/行业特点
- ❌ 通用模板（可发给任何人）

**评分标准**:
| 个性化程度 | 评分 | 说明 |
|------------|------|------|
| 高 | 10/10 | 明显是为这个客户定制的 |
| 中 | 7/10 | 有一些个性化元素 |
| 低 | 0/10 | 通用模板 |

---

### 3. 专业性检测

**检测项**:
- ✅ 行业术语准确（vulcanizing press, splicing, curing）
- ✅ 产品型号/参数正确
- ❌ 拼写错误
- ❌ 语法错误

**评分标准**:
| 专业性 | 评分 | 说明 |
|---------|------|------|
| 高 | 10/10 | 专业术语准确，无错误 |
| 中 | 7/10 | 基本正确，有小瑕疵 |
| 低 | 0/10 | 错误明显 |

---

### 4. 语法检测

**检测项**:
- ✅ 语法正确
- ✅ 句子通顺
- ✅ 符合商务英语规范

**评分标准**:
| 语法质量 | 评分 | 说明 |
|---------|------|------|
| 完美 | 10/10 | 无错误 |
| 可接受 | 7/10 | 有小瑕疵但不影响理解 |
| 不可接受 | 0/10 | 错误明显 |

---

### 5. CTA 检测 ⭐新增（2026-04-01）

**检测项**:
- ✅ CTA 具体可行（不是 "Let's discuss this opportunity"）
- ✅ 明确行动（send product catalog, schedule call, review specifications）
- ✅ 明确时间（this week, next project, your next order）
- ❌ 通用 CTA（"Let's discuss", "I'd love to chat"）

**评分标准**:
| CTA 有效性 | 评分 | 说明 |
|------------|------|------|
| 高 | 10/10 | 具体行动 + 具体时间 |
| 中 | 7/10 | 有行动但时间模糊 |
| 低 | 0/10 | 通用 CTA |

**最佳实践（2026-04-01 案例）**:
- ❌ "Let's discuss this opportunity" → 改为 "Can I send you a product catalog for your next Overland Conveyor project?"
- ❌ "I'd love to chat" → 改为 "Can we schedule a 15-minute call this week to discuss upgrading your vulcanizing equipment?"
- ❌ "Please let me know" → 改为 "Would you be interested in reviewing our product specifications for supplier registration?"

---

**检测项**:
- ✅ 提到具体产品型号
- ✅ 提到技术参数
- ✅ 提到行业术语
- ❌ 过于推销的语言
- ❌ 夸大的承诺

**评分标准**:
| 专业性 | 评分 | 说明 |
|--------|------|------|
| 高 | 10/10 | 专业、客观、有数据支撑 |
| 中 | 7/10 | 基本专业 |
| 低 | 0/10 | 过于推销或不专业 |

---

### 4. 语法检测

**检测项**:
- ✅ 英文语法正确
- ✅ 标点符号正确
- ✅ 大小写正确
- ❌ 中式英语

**评分标准**:
| 语法质量 | 评分 | 说明 |
|----------|------|------|
| 高 | 10/10 | 无语法错误 |
| 中 | 7/10 | 小错误但不影响理解 |
| 低 | 0/10 | 明显错误影响专业度 |

---

### 5. CTA检测

**检测项**:
- ✅ 有明确的行动号召
- ✅ CTA具体且可行
- ❌ 无CTA
- ❌ CTA模糊（"Let me know if interested"）

**评分标准**:
| CTA质量 | 评分 | 说明 |
|---------|------|------|
| 高 | 10/10 | 明确、具体、易执行 |
| 中 | 7/10 | 有CTA但不够具体 |
| 低 | 0/10 | 无CTA或模糊 |

---

## 总分计算

```
总分 = (AI感 + 痛点共情 + 个性化 + 专业性 + 语法 + CTA) / 6

及格线：7.0/10
优秀线：8.5/10
```

---

## 自动修改规则

### 第1轮修改

如果 **AI感 < 7**:
```
修改动作：
- 替换 "I hope this email finds you well" → "Hi [First Name],"
- 替换 "I'm reaching out to" → "I noticed" 或 "Saw"
- 增加缩写形式（I'm, You're, We're）
- 用 "Best" 代替 "Best regards"
- 减少 "Dear" → "Hi"
```

如果 **痛点共情 < 7**:
```
修改动作：
- 添加客户痛点描述（"With [挑战]..."）
- 添加痛点影响（"...can impact your [目标]"）
- 将优点改为解决方案（"We can help you [解决痛点] by [我们的优势]"）
- 删除纯优点列表
```

如果 **个性化 < 7**:
```
修改动作：
- 添加客户公司名
- 添加客户具体业务
- 添加行业洞察
```

如果 **专业性 < 7**:
```
修改动作：
- 添加产品型号
- 添加技术参数
- 添加数据支撑
- 删除夸大语言
```

如果 **语法 < 7**:
```
修改动作：
- 修正语法错误
- 修正中式英语
```

如果 **CTA < 7**:
```
修改动作：
- 添加明确CTA
- 使CTA更具体
```

---

### 第2轮修改

应用第1轮所有修改规则，并额外检查：
- 痛点和解决方案的关联性
- 整体流畅度
- 语气一致性
- 长度适中（150-200词）

---

### 第3轮修改（最后一轮）

如果仍未达标，应用"保守修改"：
- 只修改最严重的问题
- 保持核心内容不变
- 确保至少及格（7.0/10）

---

## 示例

### 输入（初稿）

```
Subject: Conveyor Belt Equipment Inquiry

Dear Sir/Madam,

I hope this email finds you well. I'm reaching out to introduce 
our company, Red Dragon Industrial Equipment, which specializes 
in conveyor belt processing equipment.

We have been in business for 20 years and serve customers 
worldwide. Our products include vulcanizing presses, finger 
punchers, and belt splitters.

Please let me know if you are interested in learning more.

Best regards,
Sales Team
```

### 检查结果（第1轮）

| 维度 | 评分 | 问题 |
|------|------|------|
| AI感 | 2/10 | "I hope this email finds you well", "I'm reaching out" |
| 痛点共情 | 0/10 | 只说优点，完全不提客户痛点 |
| 个性化 | 0/10 | 通用模板，无个性化 |
| 专业性 | 5/10 | 缺少具体参数 |
| 语法 | 10/10 | 无语法错误 |
| CTA | 3/10 | "Let me know if interested" 模糊 |

**总分**: 3.3/10 ❌ 不及格

---

### 修改后（第1轮）

```
Subject: Enhance Your Belt Splicing Operations - [Company Name]

Hi [First Name],

Saw you're the Purchasing Manager at [Company Name] with a focus on conveyor belt operations. Managing belt splicing downtime can be frustrating—every hour lost impacts your production targets.

We manufacture vulcanizing presses (A2FRJ series, temperature control ±2°C) and finger punchers (pneumatic/manual options). Clients like [Similar Company] have reduced splicing downtime by 40% using our equipment, which helped them meet tight project deadlines.

Would you be open to a quick call this week to discuss how we can reduce your belt splicing downtime?

Best,
[Your Name]
Red Dragon Industrial Equipment
```

### 检查结果（第2轮）

| 维度 | 评分 | 改进 |
|------|------|------|
| AI感 | 8/10 | ✅ 更自然 |
| 痛点共情 | 9/10 | ✅ 提到停机痛点 + 影响 |
| 个性化 | 9/10 | ✅ 提到公司、职位、具体需求 |
| 专业性 | 9/10 | ✅ 添加型号、参数 |
| 语法 | 10/10 | ✅ 无错误 |
| CTA | 10/10 | ✅ 明确CTA |

**总分**: 9.2/10 ✅ 优秀

---

## 集成到获客系统

### 触发时机

```
用户: 开发信：Ace Belting Company

AI:
正在生成开发信...

[自动检查]
第1轮检查：4.0/10 - 不及格
正在修改...

[自动检查]
第2轮检查：9.2/10 - 优秀 ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 开发信（已优化）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject: Enhance Your Belt Splicing Operations - Ace Belting

Hi [First Name],

Saw you're the Purchasing Manager at Ace Belting...

[完整内容]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
质量评分：9.2/10 ✅
检查轮次：2轮
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 技术实现

### 伪代码

```python
def generate_email_with_check(company, contact):
    """生成开发信 + 自动检查"""

    # 生成初稿
    draft = generate_initial_draft(company, contact)

    # 循环检查和修改（最多3轮）
    for round_num in range(1, 4):
        # 检查6个维度
        scores = check_email(draft)
        total_score = sum(scores.values()) / 6

        # 如果达标，返回
        if total_score >= 7.0:
            return draft, scores, round_num

        # 否则修改
        draft = improve_email(draft, scores)

    # 3轮后仍未达标，返回最后版本
    return draft, scores, 3

def check_email(email):
    """检查6个维度"""
    return {
        "ai_feeling": check_ai_feeling(email),
        "pain_point_empathy": check_pain_point_empathy(email),
        "personalization": check_personalization(email),
        "professionalism": check_professionalism(email),
        "grammar": check_grammar(email),
        "cta": check_cta(email)
    }
```

---

_更新时间：2026-03-27_
_模式：反复打磨直到满意_
_Agent Reach 获客系统 v1.2.0_
