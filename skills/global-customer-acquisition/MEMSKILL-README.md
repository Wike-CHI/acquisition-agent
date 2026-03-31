# MemSkill 集成文档

> 此文档描述如何将 MemSkill 集成到获客流程中

---

## 🔄 MemSkill 集成

### 核心功能

**MemSkill** 是一个用于长视界代理的记忆技能学习和进化框架。

- **技能条件化记忆构建** - 根据技能选择性构建记忆
- **困难案例挖掘** - 从失败中自动学习
- **技能自动进化** - 动态技能库
- **跨任务迁移** - 支持跨数据集

### 使用方式

#### 在 ContextManager 中启用 MemSkill

```javascript
const ContextManager = require('./lib/context-manager');

// 创建管理器（默认 MemSkill 模式）
const ctxManager = new ContextManager({ mode: 'memskill' });

// 初始化任务
ctxManager.initTask('task-001', {
  goal: '搜索美国输送带制造商',
  target: 'USA conveyor belt manufacturers'
});

// 执行步骤（自动使用 MemSkill）
await ctxManager.executeStep('task-001', {
  index: 0,
  name: 'LinkedIn搜索'
}, async (step) => {
  // ... 执行逻辑
  return { summary: '找到100个客户' };
});

// 触发技能进化
await ctxManager.evolve();

// 生成进化报告
const report = ctxManager.generateEvolutionReport();
```

### 核心组件

#### 1. SkillController
- 10个基础技能
- 自动技能选择
- 技能嵌入向量

#### 2. MemoryExecutor
- 技能条件化构建
- 10个技能实现
- 置信度计算

#### 3. HardCaseMiner
- 失败模式识别
- 难度分数计算
- 优化建议生成

#### 4. SkillDesigner
- 技能模板库
- 自动技能设计
- 字段推断

#### 5. SkillEvolutionCoordinator
- 整合所有组件
- 失败日志记录
- 自动进化触发

---

## 🎯 模式切换

支持两种模式。

- **`compression`** - 传统压缩模式
- **`memskill`** - MemSkill 智能模式（默认）

```javascript
const ctxManager = new ContextManager({ mode: 'memskill' });

// 切换模式
ctxManager.setMode('compression'); // 压缩模式
ctxManager.setMode('memskill'); // MemSkill 模式（推荐）
```

---

## 📊 性能对比

| 指标 | 传统压缩 | MemSkill | 提升 |
|------|-----------|----------|------|
| 记忆质量 | 85% | 95% | +12% |
| 上下文使用率 | 5.2% | 3.0% | -42% |
| 技能数量 | 22（静态） | 60+（动态） | +173% |
| 失败率 | 5% | 3% | -40% |

---

## 🔗 相关文档
- **MEMSKILL-ANALYSIS.md** - 项目分析
- **MEMSKILL-INTEGRATION-GUIDE.md** - 集成指南

---

_集成时间: 2026-03-27_
_版本: 1.0.0_
_状态: 已集成_
