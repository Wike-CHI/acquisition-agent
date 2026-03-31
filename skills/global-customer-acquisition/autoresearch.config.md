# Autoresearch 配置 - 上下文管理优化

## 目标
优化上下文管理系统，防止AI因上下文溢出而"忘记"任务目标（"傻瓜情况"）

## 度量指标

### 主要指标
- **上下文使用率**: 越低越好（目标：< 40%）
- **任务成功率**: 越高越好（目标：100%）
- **信息丢失率**: 越低越好（目标：0%）

### 辅助指标
- **压缩效率**: 压缩后大小 / 压缩前大小
- **恢复时间**: 从锚点恢复上下文的时间（ms）
- **锚点完整性**: 关键信息保留率

## 目标文件（可修改）
- `lib/context-compressor.js` - 上下文压缩算法
- `lib/layered-skill-loader.js` - 技能加载策略
- `lib/task-state-anchor.js` - 锚点设计
- `lib/context-manager.js` - 统一管理策略

## 只读文件（不可修改）
- `tests/test-context-manager.js` - 测试脚本
- `CONTEXT-MANAGEMENT-GUIDE.md` - 使用指南
- `tests/P1-OPTIMIZATION-TEST.md` - 测试文档

## 运行命令

### Baseline 测试
```bash
cd C:\Users\Administrator\.openclaw\workspace\customer-acquisition-skills
node tests/test-context-manager.js 2>&1 | tee test-output.log
```

### 压力测试（模拟真实场景）
```bash
# 测试1: 大量客户数据（100个客户）
node tests/stress-test-100-customers.js

# 测试2: 长时间任务（10个步骤）
node tests/stress-test-10-steps.js

# 测试3: 多任务切换
node tests/stress-test-multi-task.js
```

## 提取命令

### 上下文使用率
```bash
grep "上下文使用率:" test-output.log | awk '{print $2}' | tr -d '%'
```

### 任务成功率
```bash
grep "任务成功率:" test-output.log | awk '{print $2}' | tr -d '%'
```

### 信息丢失率
```bash
grep "信息丢失率:" test-output.log | awk '{print $2}' | tr -d '%'
```

## 时间预算
- **每个实验**: 2分钟
- **超时**: 5分钟
- **总预算**: 30分钟（15个实验）

## 约束条件
1. 不得修改测试脚本（保持客观性）
2. 不得添加外部依赖（保持轻量级）
3. 必须保持向后兼容（不破坏现有API）
4. 压缩算法必须是确定性的（相同输入→相同输出）
5. 锚点数据必须是JSON可序列化的

## 实验分支
`autoresearch/context-optimization-20260327`

## Baseline（基准）
- 上下文使用率: 110% (溢出)
- 任务成功率: 50%
- 信息丢失率: 30%

## 优化目标
- 上下文使用率: < 40%
- 任务成功率: 100%
- 信息丢失率: 0%

## 实验策略

### Phase 1: 压缩算法优化（5个实验）
1. **实验1**: 调整压缩比例（0.3 → 0.2）
2. **实验2**: 优化句子评分算法
3. **实验3**: 添加关键词权重
4. **实验4**: 实现分层压缩
5. **实验5**: 智能摘要（保留关键句子）

### Phase 2: 技能加载优化（5个实验）
1. **实验6**: 更激进的摘要模式（50 tokens）
2. **实验7**: 延迟加载策略
3. **实验8**: 智能预加载
4. **实验9**: 缓存机制
5. **实验10**: 按需卸载优化

### Phase 3: 锚点优化（5个实验）
1. **实验11**: 压缩锚点数据
2. **实验12**: 增量更新锚点
3. **实验13**: 智能恢复策略
4. **实验14**: 验证机制强化
5. **实验15**: 外部存储优化

## 成功标准
- ✅ 上下文使用率 < 40%（降低64%）
- ✅ 任务成功率 = 100%（提升50%）
- ✅ 信息丢失率 = 0%（降低30%）
- ✅ 压缩效率 > 70%
- ✅ 恢复时间 < 100ms

## 记录文件
- `results.tsv` - 实验结果（不提交）
- `experiment-log.md` - 实验日志（提交）
- `optimization-report.md` - 最终报告（提交）

## 备注
- 参考论文: 阿里 SkillRouter (arXiv:2603.22455)
- 核心发现: 91.7%注意力在body上，1.2B参数碾压8B模型
- 关键启示: 压缩策略比增加容量更有效
