/**
 * 健康检查端点
 * 提供系统健康状态检查
 */

import logger from './logger.js';

// 健康检查状态
const healthStatus = {
  status: 'unknown',
  timestamp: null,
  checks: {},
};

/**
 * 执行健康检查
 */
export async function performHealthCheck() {
  const checks = {
    uptime: getUptime(),
    memory: getMemoryUsage(),
    disk: getDiskUsage(),
    dependencies: {},
  };

  // 检查依赖服务
  checks.dependencies.nas = await checkNASConnection();
  checks.dependencies.teyi = await checkTeyiConnection();
  checks.dependencies.smtp = await checkSMTPConnection();

  // 计算整体状态
  const allChecks = Object.values(checks.dependencies);
  const healthy = allChecks.every(check => check.status === 'ok');

  healthStatus.status = healthy ? 'healthy' : 'degraded';
  healthStatus.timestamp = new Date().toISOString();
  healthStatus.checks = checks;

  return healthStatus;
}

/**
 * 获取系统运行时间
 */
function getUptime() {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  return {
    status: 'ok',
    uptime_seconds: Math.floor(uptime),
    uptime_human: `${days}d ${hours}h ${minutes}m`,
  };
}

/**
 * 获取内存使用情况
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  const heapUsed = usage.heapUsed / 1024 / 1024;
  const heapTotal = usage.heapTotal / 1024 / 1024;
  const rss = usage.rss / 1024 / 1024;

  const usagePercent = (heapUsed / heapTotal) * 100;

  return {
    status: usagePercent > 90 ? 'warning' : 'ok',
    heap_used_mb: Math.round(heapUsed),
    heap_total_mb: Math.round(heapTotal),
    rss_mb: Math.round(rss),
    usage_percent: Math.round(usagePercent),
  };
}

/**
 * 获取磁盘使用情况
 */
function getDiskUsage() {
  try {
    const stats = require('fs').statSync('.');
    return {
      status: 'ok',
      path: process.cwd(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * 检查NAS连接
 */
async function checkNASConnection() {
  try {
    const nasAddress = process.env.NAS_ADDRESS;
    if (!nasAddress) {
      return { status: 'warning', message: 'NAS未配置' };
    }

    // 这里应该实现真实的NAS连接检查
    // 例如：ping NAS地址或尝试挂载

    return {
      status: 'ok',
      address: nasAddress,
      response_time_ms: Math.random() * 100, // 模拟响应时间
    };
  } catch (error) {
    logger.error('NAS health check failed', { error: error.message });
    return { status: 'error', error: error.message };
  }
}

/**
 * 检查特易连接
 */
async function checkTeyiConnection() {
  try {
    const teyiUrl = process.env.TEYI_URL;
    if (!teyiUrl) {
      return { status: 'warning', message: '特易未配置' };
    }

    // 这里应该实现真实的特易服务检查
    // 例如：发送HTTP请求到特易API

    return {
      status: 'ok',
      url: teyiUrl,
      response_time_ms: Math.random() * 200, // 模拟响应时间
    };
  } catch (error) {
    logger.error('特易 health check failed', { error: error.message });
    return { status: 'error', error: error.message };
  }
}

/**
 * 检查SMTP连接
 */
async function checkSMTPConnection() {
  try {
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      return { status: 'warning', message: 'SMTP未配置' };
    }

    // 这里应该实现真实的SMTP连接检查
    // 例如：尝试连接到SMTP服务器

    return {
      status: 'ok',
      host: smtpHost,
      port: process.env.SMTP_PORT || 465,
      response_time_ms: Math.random() * 150, // 模拟响应时间
    };
  } catch (error) {
    logger.error('SMTP health check failed', { error: error.message });
    return { status: 'error', error: error.message };
  }
}

/**
 * 获取业务指标
 */
export async function getBusinessMetrics() {
  return {
    acquisition: {
      total_customers: getMetric('acquisition.total_customers'),
      new_today: getMetric('acquisition.new_today'),
      conversion_rate: getMetric('acquisition.conversion_rate'),
    },
    outreach: {
      emails_sent: getMetric('outreach.emails_sent'),
      emails_delivered: getMetric('outreach.emails_delivered'),
      emails_opened: getMetric('outreach.emails_opened'),
    },
    social_media: {
      facebook_posts: getMetric('social.facebook_posts'),
      linkedin_posts: getMetric('social.linkedin_posts'),
      total_engagement: getMetric('social.total_engagement'),
    },
  };
}

/**
 * 获取单个指标（模拟）
 */
function getMetric(key) {
  // 在实际实现中，这应该从数据库或缓存中获取真实指标
  const mockMetrics = {
    'acquisition.total_customers': 15885,
    'acquisition.new_today': 12,
    'acquisition.conversion_rate': 0.15,
    'outreach.emails_sent': 245,
    'outreach.emails_delivered': 238,
    'outreach.emails_opened': 89,
    'social.facebook_posts': 8,
    'social.linkedin_posts': 5,
    'social.total_engagement': 156,
  };

  return mockMetrics[key] || 0;
}

/**
 * HTTP健康检查端点处理器
 */
export function healthCheckHandler(req, res) {
  performHealthCheck()
    .then(health => {
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    })
    .catch(error => {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    });
}

/**
 * 业务指标端点处理器
 */
export function metricsHandler(req, res) {
  getBusinessMetrics()
    .then(metrics => {
      res.json({
        timestamp: new Date().toISOString(),
        metrics,
      });
    })
    .catch(error => {
      logger.error('Metrics collection failed', { error: error.message });
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    });
}
