# 执行控制层集成指南

> 将执行控制层集成到获客技能集群
> 更新时间: 2026-03-27

---

## 🎯 执行控制层作用

执行控制层负责：
1. **执行轨迹追踪** - 记录每一步执行
2. **循环检测** - 防止无限循环
3. **置信度评估** - 评估执行质量
4. **状态变化监控** - 监控客户状态流转

---

## 📁 文件位置

**执行控制层文件**:
```
~/.agent-reach/
├── execution-cli.js                    # CLI 工具 (5.8 KB)
├── execution-controller.js             # 基础控制器 (17.9 KB)
├── execution-controller-enhanced.js    # 增强版 (5.4 KB)
└── execution-controller-unified.js     # 统一版 (7.8 KB)
```

**执行轨迹**:
```
~/.openclaw/traces/
├── integration-test.jsonl              # 集成测试轨迹
└── test-hot-lead.jsonl                 # 热线索测试轨迹
```

---

## 🔧 集成方式

### 1. 在获客流程中调用

```javascript
// 在获客技能中集成执行控制层
const { ExecutionController } = require('~/.agent-reach/execution-controller');

const controller = new ExecutionController({
  adminContact: "{{ADMIN_WHATSAPP}}",  // 填写管理员 WhatsApp 号码
  channel: "whatsapp",
  loopDetection: {
    maxRepeats: 3,
    stateWindow: 5
  }
});

// 每次执行获客动作时记录
const result = await controller.executeNext({
  session_id: customer_id,
  customer_name: customer_name,
  state: current_state,
  icp_score: icp_score,
  email: email,
  whatsapp: whatsapp,
  country: country,
  product_interest: product_interest
});

// 检查置信度
if (result.confidence < 0.6) {
  // 低置信度，需要人工介入
  notifyAdmin(result);
}
```

---

### 2. 状态流转控制

```
客户状态流转:
new_lead → hot_lead → first_contact → qualified → quoted → negotiating → closed_won

执行控制层会：
- 记录每次状态变化
- 检测是否陷入循环
- 评估状态变化的置信度
- 触发相应的技能集群
```

---

### 3. 技能集群触发

```javascript
// 根据状态自动触发技能集群
const skillClusters = {
  'hot_lead': ['first-contact-generator', 'value-proposition', 'meeting-scheduler'],
  'qualified': ['quotation-generator', 'competitive-analysis', 'objection-handler'],
  'negotiating': ['pricing-optimizer', 'contract-generator', 'closing-techniques']
};

// 执行控制层会自动选择对应的技能集群
const cluster = skillClusters[result.next_state];
```

---

## 📊 监控指标

### 健康指标

| 指标 | 正常值 | 异常阈值 | 当前值 |
|------|--------|----------|--------|
| **平均置信度** | ≥ 0.7 | < 0.6 | 0.82 ✅ |
| **循环检测触发** | 0 次/天 | ≥ 3 次/天 | 0 ✅ |
| **状态变化率** | ≥ 60% | < 40% | 40% ⚠️ |
| **待审批项** | < 5 | ≥ 10 | 0 ✅ |

---

## 🛠️ CLI 命令

### 查看统计

```bash
node ~/.agent-reach/execution-cli.js stats

输出:
📊 执行控制层统计

总执行轨迹: 2

今日统计:
  执行次数: 5
  状态变化: 2
  平均置信度: 0.82
```

### 测试执行

```bash
node ~/.agent-reach/execution-cli.js test

输出:
🧪 执行控制层测试

测试 1: 新线索路由
  ✅ 动作: route_to_hot_lead_handler
  ✅ 下一状态: hot_lead
  ✅ Skills Cluster: hot-lead-handler
  ✅ Skills: first-contact-generator, value-proposition, meeting-scheduler

测试 2: 循环检测
  ✅ 循环检测正常
```

### 获取下一步动作

```bash
node ~/.agent-reach/execution-cli.js next <customer_id> <state> <icp_score>

示例:
node ~/.agent-reach/execution-cli.js next 12345 new_lead 8.5

输出:
📋 下一步动作
  客户 ID: 12345
  当前状态: new_lead
  ICP 评分: 8.5
  推荐动作: route_to_hot_lead_handler
  下一状态: hot_lead
  技能集群: hot-lead-handler
  置信度: 0.85
```

---

## 🔄 集成到 HEARTBEAT

执行控制层已集成到心跳检查（HEARTBEAT.md 第13项）：

```markdown
## 13. 执行控制层检查（每次心跳）

检查项:
1. 执行轨迹是否有异常
2. 是否有循环检测触发
3. 是否有待审批项
4. 平均置信度是否过低

检查命令:
  node execution-cli.js stats

健康指标:
  平均置信度: ≥ 0.7 ✅
  循环检测触发: 0 次/天 ✅
  状态变化率: ≥ 60%
  待审批项: < 5
```

---

## 🚨 异常处理

### 置信度过低 (< 0.6)

**触发条件**: 平均置信度 < 0.6

**处理方式**:
1. 检查客户信息是否完整
2. 补充缺失字段
3. 通知负责人人工介入

### 循环检测触发 (≥ 3次/天)

**触发条件**: 同一状态重复 ≥ 3次

**处理方式**:
1. 查看执行轨迹详情
2. 评估是否需要调整规则
3. 人工介入决策

### 状态变化率过低 (< 40%)

**触发条件**: 状态变化率 < 40%

**处理方式**:
1. 检查获客流程是否卡住
2. 分析停滞原因
3. 优化流程或规则

---

## 📝 执行轨迹示例

```jsonl
{
  "step": 1,
  "timestamp": "2026-03-27T05:37:42.658Z",
  "state_before": "new_lead",
  "skill_called": "hot-lead-handler",
  "llm_input": {
    "session_id": "integration-test",
    "state": "new_lead",
    "icp_score": 8.5,
    "customer_name": "Test Customer"
  },
  "llm_output": {
    "cluster": "hot-lead-handler",
    "skills": ["first-contact-generator", "value-proposition", "meeting-scheduler"],
    "context": {...},
    "confidence": 0.85,
    "timestamp": "2026-03-27T05:37:42.657Z"
  },
  "state_after": "hot_lead",
  "confidence": 0.85,
  "duration_ms": 1
}
```

---

## ✅ 集成检查

| 检查项 | 状态 |
|--------|------|
| **执行控制层文件存在** | ✅ 4个文件 |
| **执行轨迹文件存在** | ✅ 2个文件 |
| **CLI 工具可用** | ✅ execution-cli.js |
| **HEARTBEAT 集成** | ✅ 第13项 |
| **平均置信度健康** | ✅ 0.82 (≥ 0.7) |
| **无循环检测触发** | ✅ 0次 |
| **执行控制层运行中** | ✅ 正常 |

---

## 📦 打包包含

执行控制层已包含在完整打包中：

```
customer-acquisition-skills-v1.3.0.zip
└── skills/
    └── global-customer-acquisition/
        └── EXECUTION-CONTROL.md (本文件)
```

**执行控制层文件位置**: `~/.agent-reach/`

---

_更新时间: 2026-03-27_
_版本: v1.3.0_
_集成状态: ✅ 已集成_
