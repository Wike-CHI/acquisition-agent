# 测试文档

> 红龙获客系统 - 测试策略和指南

---

## 📊 测试覆盖率目标

| 类型 | 目标 | 当前 | 状态 |
|------|------|------|------|
| 语句覆盖率 | 80% | - | ⏳ 待实现 |
| 分支覆盖率 | 70% | - | ⏳ 待实现 |
| 函数覆盖率 | 80% | - | ⏳ 待实现 |
| 行覆盖率 | 80% | - | ⏳ 待实现 |

---

## 🧪 测试类型

### 1. 单元测试

**目的**：测试独立的函数和类

**位置**：`tests/unit/`

**示例**：
- `tests/unit/lib/skills-router.test.js` - 技能路由器测试
- `tests/unit/lib/email-polisher.test.js` - 邮件润色测试
- `tests/unit/lib/quotation-generator.test.js` - 报价生成测试

**运行**：
```bash
npm run test:unit
```

### 2. 集成测试

**目的**：测试模块间的交互

**位置**：`tests/integration/`

**示例**：
- `tests/integration/acquisition-flow.test.js` - 获客流程集成测试
- `tests/integration/email-outflow.test.js` - 邮件发送集成测试

**运行**：
```bash
npm run test:integration
```

### 3. 端到端测试 (E2E)

**目的**：测试完整的用户场景

**位置**：`tests/e2e/`

**示例**：
- `tests/e2e/customer-discovery-flow.test.js` - 客户发现端到端测试
- `tests/e2e/full-sales-cycle.test.js` - 完整销售周期测试

**运行**：
```bash
npm run test:e2e
```

---

## 📁 测试目录结构

```
tests/
├── unit/               # 单元测试
│   ├── lib/           # 库模块测试
│   │   ├── skills-router.test.js
│   │   ├── email-polisher.test.js
│   │   ├── quotation-generator.test.js
│   │   └── context-manager.test.js
│   └── scripts/       # 脚本测试
│       ├── validate-config.test.js
│       └── setup-security.test.js
├── integration/        # 集成测试
│   ├── acquisition-flow.test.js
│   ├── email-outflow.test.js
│   └── crm-integration.test.js
├── e2e/              # 端到端测试
│   ├── customer-discovery-flow.test.js
│   ├── full-sales-cycle.test.js
│   └── multi-channel-acquisition.test.js
├── fixtures/         # 测试数据
│   ├── sample-data.js
│   └── mock-responses.js
└── setup.js          # 测试环境设置
```

---

## 🚀 运行测试

### 运行所有测试

```bash
npm test
```

### 运行特定类型测试

```bash
# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 端到端测试
npm run test:e2e
```

### 生成覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录：
- `coverage/index.html` - HTML格式报告
- `coverage/lcov.info` - LCOV格式报告
- `coverage/coverage-final.json` - JSON格式报告

### 监视模式（开发时使用）

```bash
npm run test:watch
```

文件修改时自动重新运行测试。

---

## 📝 编写测试指南

### 测试文件命名

- 单元测试：`*.test.js` 或 `*.spec.js`
- 集成测试：`*-integration.test.js`
- E2E测试：`*-e2e.test.js`

### 测试结构

使用 `describe` 和 `test` 组织测试：

```javascript
import { describe, test, expect } from '@jest/globals';

describe('功能模块名称', () => {
  describe('具体功能', () => {
    test('应该做某事', () => {
      // 准备 (Arrange)
      const input = '测试输入';

      // 执行 (Act)
      const result = processInput(input);

      // 断言 (Assert)
      expect(result).toBe('预期输出');
    });
  });
});
```

### 测试最佳实践

1. **一个测试只验证一件事**
2. **使用描述性的测试名称**
3. **遵循 AAA 模式**（Arrange-Act-Assert）
4. **使用 fixtures 而不是硬编码数据**
5. **避免测试实现细节，测试行为**
6. **保持测试独立和可重复**

### Mock 和 Spy

```javascript
import { jest } from '@jest/globals';

// Mock 函数
const mockFn = jest.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');

// Mock 模块
jest.mock('./dependency.js');

// Spy 函数
const spy = jest.spyOn(object, 'method');
spy.mockReturnThis();

// 清理
afterEach(() => {
  jest.clearAllMocks();
});
```

---

## 🎯 测试检查清单

在提交代码前，确保：

- [ ] 所有测试通过（`npm test`）
- [ ] 覆盖率达标（`npm run test:coverage`）
- [ ] 新功能有对应测试
- [ ] Bug 修复有回归测试
- [ ] 测试命名清晰，意图明确
- [ ] 没有硬编码的测试数据（使用 fixtures）
- [ ] Mock 正确设置和清理

---

## 🔗 CI/CD 集成

测试将在以下情况自动运行：

1. **Pull Request 创建时**
2. **代码推送到 main 分支时**
3. **手动触发 GitHub Actions**

### GitHub Actions 配置示例

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

## 📚 相关资源

- [Jest 文档](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [单元测试的艺术](https://martinfowler.com/bliki/UnitTest.html)

---

*最后更新：2026-04-02*
*版本：1.0.0*
