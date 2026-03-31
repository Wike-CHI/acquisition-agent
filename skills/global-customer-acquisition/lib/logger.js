/**
 * 日志配置模块
 * 提供结构化日志功能
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// 日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 日志传输方式
const transports = [
  // 控制台输出（开发环境）
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.simple()
    ),
  }),

  // 错误日志（按天轮转）
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format,
    maxSize: '20m',
    maxFiles: '14d', // 保留14天
  }),

  // 所有日志（按天轮转）
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format,
    maxSize: '20m',
    maxFiles: '7d', // 保留7天
  }),

  // 业务日志（结构化）
  new DailyRotateFile({
    filename: 'logs/business-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format,
    maxSize: '20m',
    maxFiles: '30d', // 保留30天
  }),
];

// 创建日志实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// 业务日志记录器
export const businessLogger = {
  customerDiscovery(data) {
    logger.info('customer_discovery', {
      ...data,
      timestamp: new Date().toISOString(),
      type: 'acquisition',
    });
  },

  emailSent(data) {
    logger.info('email_sent', {
      ...data,
      timestamp: new Date().toISOString(),
      type: 'outreach',
    });
  },

  quotationGenerated(data) {
    logger.info('quotation_generated', {
      ...data,
      timestamp: new Date().toISOString(),
      type: 'sales',
    });
  },

  socialMediaPost(data) {
    logger.info('social_media_post', {
      ...data,
      timestamp: new Date().toISOString(),
      type: 'marketing',
    });
  },

  skillRouted(data) {
    logger.info('skill_routed', {
      ...data,
      timestamp: new Date().toISOString(),
      type: 'routing',
    });
  },
};

// 性能日志记录器
export const perfLogger = {
  functionCall(functionName, duration, metadata = {}) {
    logger.debug('function_call', {
      function: functionName,
      duration_ms: duration,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  },

  apiRequest(endpoint, duration, statusCode) {
    logger.info('api_request', {
      endpoint,
      duration_ms: duration,
      status_code: statusCode,
      timestamp: new Date().toISOString(),
    });
  },
};

// 错误日志记录器
export const errorLogger = {
  capture(error, context = {}) {
    logger.error('error', {
      message: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString(),
    });
  },

  captureMessage(message, level = 'warning', context = {}) {
    logger.log(level, message, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  },
};

// 请求追踪中间件
export function requestTracker(req, res, next) {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  req.requestId = requestId;

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('http_request', {
      request_id: requestId,
      method: req.method,
      url: req.url,
      status_code: res.statusCode,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });
  });

  next();
}

// 生成请求ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 导出默认日志记录器
export default logger;
