# 监控和可观测性系统

> 红龙获客系统 - 完整的监控、日志和错误追踪方案

---

## 📊 监控架构

```
┌─────────────────────────────────────────────────────────────┐
│  监控层                                                    │
├─────────────────────────────────────────────────────────────┤
│  日志收集 → Winston → 文件轮转 (7-30天)                    │
│  错误追踪 → Error Tracker → Sentry (可选)                   │
│  业务指标 → Metrics Collector → Dashboard                  │
│  健康检查 → Health Check API → 监控系统                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 结构化日志

### 日志级别

| 级别 | 值 | 使用场景 | 示例 |
|------|---|----------|------|
| **error** | 0 | 错误和异常 | API调用失败、数据库错误 |
| **warn** | 1 | 警告信息 | 降级服务、重试操作 |
| **info** | 2 | 一般信息 | 业务操作、系统状态 |
| **http** | 3 | HTTP请求 | API请求日志 |
| **debug** | 4 | 调试信息 | 函数调用、参数值 |

### 日志文件

| 文件 | 保留期 | 内容 | 用途 |
|------|--------|------|------|
| `error-YYYY-MM-DD.log` | 14天 | 错误日志 | 问题排查 |
| `combined-YYYY-MM-DD.log` | 7天 | 所有日志 | 审计追踪 |
| `business-YYYY-MM-DD.log` | 30天 | 业务日志 | 数据分析 |

### 日志使用示例

```javascript
import logger from './lib/logger.js';
import { businessLogger, perfLogger } from './lib/logger.js';

// 一般日志
logger.info('Application started', { port: 3000 });
logger.error('API call failed', { endpoint: '/api/customers', error: err.message });

// 业务日志
businessLogger.customerDiscovery({
  country: 'US',
  keywords: ['conveyor belt'],
  results_count: 25,
  duration_ms: 1500,
});

businessLogger.emailSent({
  customer_id: 'CUST001',
  email: 'john@example.com',
  subject: 'Product Introduction',
  status: 'sent',
});

// 性能日志
perfLogger.functionCall('processCustomerData', 245, {
  customer_count: 100,
  processed: 95,
});

perfLogger.apiRequest('/api/customers', 1234, 200);
```

---

## 🔍 错误追踪

### 错误级别

| 级别 | 说明 | 示例 |
|------|------|------|
| **fatal** | 致命错误，需要立即处理 | 进程崩溃、数据库连接失败 |
| **error** | 错误，影响功能 | API调用失败、数据验证错误 |
| **warning** | 警告，不影响核心功能 | 降级服务、重试操作 |
| **info** | 信息 | 业务操作、系统状态 |
| **debug** | 调试信息 | 函数调用、参数值 |

### 错误类型

```javascript
const ErrorType = {
  // 业务错误
  ValidationError: '输入验证失败',
  NotFoundError: '资源未找到',
  PermissionError: '权限不足',

  // 技术错误
  NetworkError: '网络连接失败',
  DatabaseError: '数据库错误',
  APIError: 'API调用失败',

  // 系统错误
  SystemError: '系统错误',
  UnknownError: '未知错误',
};
```

### 错误追踪使用

```javascript
import errorTracker, { captureException, captureMessage } from './lib/error-tracker.js';

// 捕获异常
try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    level: 'error',
    context: {
      operation: 'customer_discovery',
      country: 'US',
    },
    tags: {
      feature: 'acquisition',
    },
  });
}

// 捕获消息
captureMessage('Customer discovery completed', {
  level: 'info',
  context: {
    results_count: 25,
    duration_ms: 1500,
  },
  tags: {
    feature: 'acquisition',
  },
});

// 获取错误统计
const stats = getErrorStats();
console.log('Total errors:', stats.total);
console.log('By level:', stats.byLevel);
console.log('By type:', stats.byType);
```

---

## 💚 健康检查

### 检查项

| 检查项 | 说明 | 健康标准 |
|--------|------|----------|
| **uptime** | 系统运行时间 | > 0 |
| **memory** | 内存使用率 | < 90% |
| **disk** | 磁盘空间 | > 10% 可用 |
| **dependencies** | 依赖服务状态 | 全部 OK |
| ├── **NAS** | NAS连接 | 可连接 |
| ├── **特易** | 特易服务 | 可访问 |
| └── **SMTP** | 邮件服务 | 可发送 |

### 健康检查端点

```
GET /health
```

**响应示例**：
```json
{
  "status": "healthy",
  "timestamp": "2026-04-02T10:30:00.000Z",
  "checks": {
    "uptime": {
      "status": "ok",
      "uptime_seconds": 3600,
      "uptime_human": "1h 0m 0s"
    },
    "memory": {
      "status": "ok",
      "heap_used_mb": 256,
      "heap_total_mb": 512,
      "usage_percent": 50
    },
    "dependencies": {
      "nas": {
        "status": "ok",
        "address": "192.168.0.194",
        "response_time_ms": 45
      },
      "teyi": {
        "status": "ok",
        "url": "https://et.topease.net",
        "response_time_ms": 120
      },
      "smtp": {
        "status": "ok",
        "host": "smtp.163.com",
        "port": 465,
        "response_time_ms": 85
      }
    }
  }
}
```

### 业务指标端点

```
GET /metrics
```

**响应示例**：
```json
{
  "timestamp": "2026-04-02T10:30:00.000Z",
  "metrics": {
    "acquisition": {
      "total_customers": 15885,
      "new_today": 12,
      "conversion_rate": 0.15
    },
    "outreach": {
      "emails_sent": 245,
      "emails_delivered": 238,
      "emails_opened": 89
    },
    "social_media": {
      "facebook_posts": 8,
      "linkedin_posts": 5,
      "total_engagement": 156
    }
  }
}
```

---

## 📈 业务指标

### 关键指标 (KPIs)

#### 获客指标
- `total_customers` - 总客户数
- `new_today` - 今日新增客户
- `conversion_rate` - 转化率
- `avg_acquisition_time` - 平均获客时间

#### 邮件指标
- `emails_sent` - 发送邮件数
- `emails_delivered` - 成功投递数
- `emails_opened` - 打开邮件数
- `emails_clicked` - 点击链接数
- `email_response_rate` - 回复率

#### 社媒指标
- `facebook_posts` - Facebook帖子数
- `linkedin_posts` - LinkedIn文章数
- `total_engagement` - 总互动数
- `follower_growth` - 粉丝增长率

### 监控告警规则

| 指标 | 阈值 | 级别 | 动作 |
|------|------|------|------|
| 邮件发送失败率 | > 10% | warning | 通知技术团队 |
| 邮件发送失败率 | > 30% | critical | 立即处理 |
| API响应时间 | > 3s | warning | 检查性能 |
| API响应时间 | > 10s | critical | 紧急处理 |
| 内存使用率 | > 80% | warning | 监控趋势 |
| 内存使用率 | > 95% | critical | 扩容/优化 |

---

## 🚀 集成到应用

### Express.js 集成示例

```javascript
import express from 'express';
import { requestTracker } from './lib/logger.js';
import { healthCheckHandler, metricsHandler } from './lib/health-check.js';
import errorTracker from './lib/error-tracker.js';

const app = express();

// 中间件
app.use(requestTracker);
app.use(express.json());

// 健康检查端点
app.get('/health', healthCheckHandler);
app.get('/metrics', metricsHandler);

// 业务路由
app.use('/api/customers', customerRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  errorTracker.captureException(err, {
    context: {
      url: req.url,
      method: req.method,
      requestId: req.requestId,
    },
  });

  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.requestId,
  });
});

// 启动服务器
app.listen(3000, () => {
  logger.info('Server started', { port: 3000 });
});
```

---

## 🔔 告警配置

### 告警渠道

1. **邮件告警**
   - 配置：`ALERT_EMAIL`
   - 触发：critical 级别错误

2. **企业微信/钉钉**
   - 配置：webhook URL
   - 触发：warning 及以上

3. **短信告警**
   - 配置：手机号
   - 触发：critical 级别

### 告警模板

```javascript
// 告警消息模板
const alertTemplate = {
  level: 'critical',
  title: '🚨 红龙获客系统告警',
  message: '邮件发送失败率超过30%',
  metrics: {
    failure_rate: '35%',
    threshold: '30%',
    affected_emails: 89,
  },
  actions: [
    '检查 SMTP 配置',
    '查看日志: logs/error-2026-04-02.log',
    '联系技术团队',
  ],
  timestamp: '2026-04-02T10:30:00.000Z',
};
```

---

## 📊 监控仪表盘

### 推荐工具

1. **Grafana** - 开源监控仪表盘
2. **Kibana** - 日志分析和可视化
3. **Sentry Dashboard** - 错误追踪
4. **自定义 Dashboard** - 基于业务指标

### 仪表盘指标

| 面板 | 指标 | 刷新频率 |
|------|------|----------|
| **系统健康** | 运行时间、内存、CPU | 30s |
| **业务概览** | 客户数、邮件数、转化率 | 1m |
| **错误追踪** | 错误数、错误类型分布 | 1m |
| **性能监控** | API响应时间、数据库查询 | 30s |

---

## 📚 相关文档

- [lib/logger.js](lib/logger.js) - 日志模块实现
- [lib/error-tracker.js](lib/error-tracker.js) - 错误追踪实现
- [lib/health-check.js](lib/health-check.js) - 健康检查实现

---

*最后更新：2026-04-02*
*版本：1.0.0*
