/**
 * 错误追踪和监控集成
 * 支持 Sentry 和自定义错误追踪
 */

import logger from './logger.js';

// 错误严重级别
const ErrorLevel = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEBUG: 'debug',
};

// 错误类型分类
const ErrorType = {
  // 业务错误
  VALIDATION_ERROR: 'ValidationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  PERMISSION_ERROR: 'PermissionError',

  // 技术错误
  NETWORK_ERROR: 'NetworkError',
  DATABASE_ERROR: 'DatabaseError',
  API_ERROR: 'APIError',

  // 系统错误
  SYSTEM_ERROR: 'SystemError',
  UNKNOWN_ERROR: 'UnknownError',
};

/**
 * 错误追踪器类
 */
class ErrorTracker {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.dsn = config.dsn;
    this.environment = config.environment || 'development';
    this.release = config.release;
    this.errorQueue = [];
    this.maxQueueSize = config.maxQueueSize || 100;
  }

  /**
   * 初始化错误追踪器
   */
  init() {
    if (!this.enabled) return;

    // 如果配置了 Sentry DSN，初始化 Sentry
    if (this.dsn) {
      this.initSentry();
    }

    // 设置全局错误处理器
    this.setupGlobalHandlers();

    logger.info('Error tracker initialized', {
      environment: this.environment,
      release: this.release,
    });
  }

  /**
   * 初始化 Sentry
   */
  initSentry() {
    // 在实际实现中，这里应该初始化 Sentry SDK
    // 例如：
    // import * as Sentry from '@sentry/node';
    // Sentry.init({ dsn: this.dsn, environment: this.environment });

    logger.info('Sentry integration would be initialized here', {
      dsn: this.dsn ? '***configured***' : 'not configured',
    });
  }

  /**
   * 设置全局错误处理器
   */
  setupGlobalHandlers() {
    // 捕获未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      this.captureException(
        new Error(`Unhandled Rejection: ${reason}`),
        {
          level: ErrorLevel.FATAL,
          context: { promise, reason },
        }
      );
    });

    // 捕获未捕获的异常
    process.on('uncaughtException', (error) => {
      this.captureException(error, {
        level: ErrorLevel.FATAL,
        context: { source: 'uncaughtException' },
      });

      // 给日志时间刷新，然后退出
      setTimeout(() => process.exit(1), 1000);
    });
  }

  /**
   * 捕获异常
   */
  captureException(error, options = {}) {
    if (!this.enabled) return;

    const errorEvent = {
      level: options.level || ErrorLevel.ERROR,
      type: options.type || this.classifyError(error),
      message: error.message,
      stack: error.stack,
      context: options.context || {},
      user: options.user || this.getCurrentUser(),
      tags: options.tags || {},
      extra: options.extra || {},
      timestamp: new Date().toISOString(),
    };

    // 添加到队列
    this.addToQueue(errorEvent);

    // 记录到日志
    logger.error('Exception captured', errorEvent);

    // 如果配置了 Sentry，发送到 Sentry
    if (this.dsn) {
      this.sendToSentry(errorEvent);
    }

    return errorEvent;
  }

  /**
   * 捕获消息
   */
  captureMessage(message, options = {}) {
    if (!this.enabled) return;

    const messageEvent = {
      level: options.level || ErrorLevel.INFO,
      message,
      context: options.context || {},
      user: options.user || this.getCurrentUser(),
      tags: options.tags || {},
      extra: options.extra || {},
      timestamp: new Date().toISOString(),
    };

    // 添加到队列
    this.addToQueue(messageEvent);

    // 记录到日志
    logger.log(messageEvent.level, 'Message captured', messageEvent);

    return messageEvent;
  }

  /**
   * 分类错误
   */
  classifyError(error) {
    if (!error) return ErrorType.UNKNOWN_ERROR;

    const message = error.message.toLowerCase();
    const name = error.constructor.name;

    // 根据错误消息分类
    if (message.includes('network') || message.includes('timeout')) {
      return ErrorType.NETWORK_ERROR;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION_ERROR;
    }
    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND_ERROR;
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return ErrorType.PERMISSION_ERROR;
    }
    if (message.includes('database') || message.includes('sql')) {
      return ErrorType.DATABASE_ERROR;
    }
    if (message.includes('api')) {
      return ErrorType.API_ERROR;
    }

    // 根据错误名称分类
    if (name === 'ValidationError') return ErrorType.VALIDATION_ERROR;
    if (name === 'NotFoundError') return ErrorType.NOT_FOUND_ERROR;

    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * 添加到队列
   */
  addToQueue(event) {
    this.errorQueue.push(event);

    // 如果队列超过最大大小，移除最旧的
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * 发送到 Sentry
   */
  sendToSentry(event) {
    // 在实际实现中，这里应该发送到 Sentry
    logger.debug('Event would be sent to Sentry', {
      level: event.level,
      type: event.type,
    });
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser() {
    return {
      id: process.env.SALESPERSON_NAME || 'unknown',
      email: process.env.SALESPERSON_EMAIL || 'unknown@example.com',
    };
  }

  /**
   * 获取错误队列
   */
  getErrorQueue() {
    return [...this.errorQueue];
  }

  /**
   * 清空错误队列
   */
  clearQueue() {
    this.errorQueue = [];
    logger.info('Error queue cleared');
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byLevel: {},
      byType: {},
    };

    for (const event of this.errorQueue) {
      stats.byLevel[event.level] = (stats.byLevel[event.level] || 0) + 1;
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    }

    return stats;
  }
}

// 创建全局错误追踪器实例
const errorTracker = new ErrorTracker({
  enabled: process.env.ERROR_TRACKING_ENABLED !== 'false',
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION || '2.3.0',
});

// 初始化
errorTracker.init();

// 导出便捷函数
export function captureException(error, options) {
  return errorTracker.captureException(error, options);
}

export function captureMessage(message, options) {
  return errorTracker.captureMessage(message, options);
}

export function getErrorStats() {
  return errorTracker.getErrorStats();
}

export default errorTracker;
