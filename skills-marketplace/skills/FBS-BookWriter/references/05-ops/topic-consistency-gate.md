# 主题一致性门禁（Topic Consistency Gate）

> **定位**：防止上下文跳变（如"龙虾"→"家谱"）的 P0 级安全机制
> **版本**：1.0.0
> **关联**：`section-3-workflow.md` S0/S1、`section-nlu.md` 8.1a、`search-policy.json` topicLock

---

## 1. 问题定义

### 上下文跳变（Context Drift）

当用户在对话中表达了一个写作主题（如"写一本关于龙虾/OpenClaw的书"），但 AI 由于以下原因错误地切换到另一个主题（如"家谱白皮书"）：

1. 读取了错误的历史文件
2. 工作记忆污染
3. 用户说"确认"时没有携带主题上下文
4. 跨会话主题未正确继承

### 影响

- 用户期望写 A，AI 实际写 B
- 浪费用户时间和计算资源
- 严重损害用户信任

---

## 2. 核心机制

### 2.1 主题锁定（Topic Lock）

```
锁定时机：S0 完成时（用户确认调研简报后）
锁定内容：{
  "topic": "用户确认的主题",
  "lockedAt": "ISO8601时间戳",
  "confirmedByUser": true,
  "briefingPath": "S0调研简报文件路径"
}
存储位置：{
  "会话内存": "currentTopicLock",
  "工作记忆": "{workspace}/.fbs/topic-lock.json",
  "S0简报首行": "**主题**：[主题]"
}
```

### 2.2 一致性校验点

| 校验点 | 触发条件 | 校验逻辑 | 失败处理 |
|--------|----------|----------|----------|
| **GATE-0** | 用户说"确认" | 检查是否有 lockedTopic | 无锁定时询问"确认写什么？" |
| **GATE-1** | 读取任何文件前 | 检查文件主题与 lockedTopic 一致 | 不一致时询问是否切换 |
| **GATE-2** | S0→S1→S2→S3 切换 | 携带 lockedTopic 并校验 | 不一致时阻断并询问 |
| **GATE-3** | 新会话启动 | 检查是否有未完成的 lockedTopic | 有未完成时询问是否继续 |
| **GATE-4** | 多智能体并行启动 | 向所有 Agent 广播 lockedTopic | Agent 回复必须携带主题确认 |

### 2.3 主题漂移检测算法

```python
def detect_topic_drift(user_input: str, locked_topic: str, 
                       confidence_threshold: float = 0.6) -> dict:
    """
    检测用户输入是否与锁定主题存在语义漂移
    """
    # 1. 提取用户输入中的主题信号
    signals = extract_topic_signals(user_input)
    
    # 2. 计算与锁定主题的语义相似度
    similarity = calculate_semantic_similarity(
        signals.primary_concept, 
        locked_topic
    )
    
    # 3. 漂移判定
    if similarity < confidence_threshold:
        return {
            "drift_detected": True,
            "locked_topic": locked_topic,
            "suggested_new_topic": signals.primary_concept,
            "similarity": similarity,
            "action": "ASK_CONFIRMATION",
            "message": f"检测到主题变更：从'{locked_topic}'到'{signals.primary_concept}'，是否切换？"
        }
    
    return {"drift_detected": False, "similarity": similarity}

def extract_topic_signals(user_input: str) -> TopicSignals:
    """
    从用户输入中提取主题信号
    """
    signals = TopicSignals()
    
    # 模式匹配
    patterns = [
        r"写[一本]*关于(.+?)的[书|文章|报告]",
        r"[主题|题目|话题]是[：]*(.+)",
        r"(.+?)[白皮书|研究报告|指南]",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, user_input)
        if match:
            signals.primary_concept = match.group(1).strip()
            break
    
    # 关键词提取
    signals.keywords = extract_keywords(user_input, topk=5)
    
    return signals
```

---

## 3. 执行流程

### 3.1 S0 阶段：主题锁定

```
用户：我想写一本关于龙虾/OpenClaw的书
  ↓
AI：了解！当前写作主题：**龙虾/OpenClaw 中美桌面AI博弈**
    即将进入 S0 前置调研（**内容竞品**/读者/**本书变现**；非默认扫行业产品矩阵），约5-10分钟。
    调研完成后将锁定主题，后续流程将围绕此主题展开。
  ↓
[S0 调研执行中...]
  ↓
AI：S0 调研完成。请确认：
    **主题**：龙虾/OpenClaw 中美桌面AI博弈
    **体裁**：行业白皮书
    **篇幅**：约5万字
    
    说"确认"锁定主题并进入 S1 定位阶段。
  ↓
用户：确认
  ↓
AI：✅ 主题已锁定：**龙虾/OpenClaw 中美桌面AI博弈**
    进入 S1 定位阶段...
    [写入 topic-lock.json 和 S0简报首行]
```

### 3.2 阶段切换：一致性校验

```
[S1 定位完成]
  ↓
AI：【主题一致性校验】
    锁定主题：龙虾/OpenClaw 中美桌面AI博弈
    当前阶段：S1 → S2
    校验结果：✅ 一致
    
    进入 S2 目录设计阶段...
```

### 3.3 读取历史文件：前置校验

```
AI：【GATE-1】即将读取历史文件：d:/FBSWORK/whitepaper/S0-调研简报.md
    文件主题：谱牒·传记·村史
    锁定主题：龙虾/OpenClaw 中美桌面AI博弈
    ⚠️ 主题不一致！
    
    询问用户：
    "检测到历史项目'谱牒·传记·村史'，与当前主题'龙虾/OpenClaw'不一致。
     您是要：
     1. 切换到历史项目'谱牒·传记·村史'
     2. 继续当前主题'龙虾/OpenClaw'（不加载历史文件）
     3. 取消操作"
```

### 3.4 用户说"确认"：上下文感知

```
【正确示例】
用户：确认
AI：确认继续写**龙虾/OpenClaw 中美桌面AI博弈**？
用户：是的
AI：✅ 继续当前主题，进入下一阶段...

【错误示例 - 已修复前】
用户：确认
AI：✅ 确认（无主题上下文，直接读取了错误的白皮书大纲）
```

---

## 4. 技术实现

### 4.1 数据结构

```typescript
interface TopicLock {
  topic: string;                    // 主题名称
  lockedAt: string;                 // ISO8601 时间戳
  confirmedByUser: boolean;         // 用户是否确认
  briefingPath: string;             // S0 简报文件路径
  currentStage: string;             // 当前阶段 S0-S6
  stageHistory: StageRecord[];      // 阶段历史
}

interface StageRecord {
  stage: string;
  enteredAt: string;
  completedAt?: string;
  topicConsistency: boolean;        // 阶段切换时的一致性校验结果
}

interface ConsistencyGateLog {
  gateId: string;                   // GATE-0 ~ GATE-4
  timestamp: string;
  action: 'PASS' | 'BLOCK' | 'ASK';
  lockedTopic: string;
  inputTopic?: string;              // 用户输入中的主题
  fileTopic?: string;               // 文件中的主题
  message?: string;
}
```

### 4.2 宿主侧实现建议

```javascript
// WorkBuddy / CodeBuddy 侧实现示例
class TopicConsistencyGate {
  constructor() {
    this.lockedTopic = null;
    this.gateLog = [];
  }

  // GATE-0: 用户说"确认"时
  async onUserConfirm(userInput, context) {
    if (!this.lockedTopic) {
      return {
        action: 'ASK',
        message: '确认写什么？请提供主题。'
      };
    }
    
    return {
      action: 'PASS',
      message: `确认继续写**${this.lockedTopic.topic}**？`
    };
  }

  // GATE-1: 读取文件前
  async beforeReadFile(filePath) {
    const fileTopic = await this.extractTopicFromFile(filePath);
    
    if (fileTopic && fileTopic !== this.lockedTopic.topic) {
      return {
        action: 'BLOCK',
        message: `文件主题'${fileTopic}'与锁定主题'${this.lockedTopic.topic}'不一致，是否切换？`
      };
    }
    
    return { action: 'PASS' };
  }

  // GATE-2: 阶段切换时
  async onStageTransition(fromStage, toStage) {
    const check = await this.verifyTopicConsistency();
    
    if (!check.consistent) {
      return {
        action: 'BLOCK',
        message: `阶段切换主题不一致：${check.reason}`
      };
    }
    
    return { action: 'PASS' };
  }
}
```

---

## 5. 与现有规范的整合

| 现有规范 | 整合点 | 修改内容 |
|----------|--------|----------|
| `section-3-workflow.md` | S0/S1 阶段 | 添加主题锁定机制 |
| `section-nlu.md` | 意图识别 | 添加 `CONFIRM_TOPIC` 意图和漂移检测 |
| `section-4-commands.md` | "确认"指令 | 添加主题上下文校验 |
| `search-policy.json` | 配置 | 添加 `topicLock` 配置节 |
| `book-level-consistency.md` | C0 门禁 | 添加主题一致性作为 C0-3 |

---

## 6. 验收标准

| 测试场景 | 预期行为 |
|----------|----------|
| 用户说"写一本关于A的书"→S0→"确认" | 锁定主题A，进入S1 |
| 用户说"确认"（无前置主题） | 询问"确认写什么？" |
| 读取文件（主题B）时锁定主题A | 询问是否切换到B或继续A |
| S1→S2切换时主题不一致 | 阻断并询问 |
| 多智能体并行启动 | 所有Agent收到锁定主题A |
| 新会话启动（有未完成主题A） | 询问是否继续写A |

---

*版本：1.0.0 | 创建：2026-03-29 | 关联：section-3-workflow, section-nlu, search-policy*
