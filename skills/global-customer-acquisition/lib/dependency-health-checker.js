/**
 * 依赖健康检查系统
 * 监控所有依赖的状态
 */

class DependencyHealthChecker {
  constructor() {
    this.dependencies = this.initDependencies();
    this.healthStatus = new Map();
    this.alertThresholds = {
      responseTime: 5000, // 5秒
      errorRate: 0.1, // 10%
      availability: 0.95 // 95%
    };
  }

  /**
   * 初始化依赖列表
   */
  initDependencies() {
    return {
      // MCP 服务
      linkedin_mcp: {
        name: 'LinkedIn MCP',
        type: 'mcp',
        port: 8001,
        critical: true
      },
      douyin_mcp: {
        name: '抖音 MCP',
        type: 'mcp',
        port: 18070,
        critical: false
      },

      // mcporter 渠道
      weibo: {
        name: '微博',
        type: 'mcporter',
        channel: 'weibo',
        critical: true
      },
      exa: {
        name: 'Exa 搜索',
        type: 'mcporter',
        channel: 'exa',
        critical: true
      },

      // 外部服务
      jina_reader: {
        name: 'Jina Reader',
        type: 'http',
        url: 'https://r.jina.ai',
        critical: true
      },
      teyi_customs: {
        name: '特易海关数据',
        type: 'browser',
        loginUrl: 'https://et.topease.net/login',
        critical: true
      },

      // 工具
      mcporter: {
        name: 'mcporter CLI',
        type: 'cli',
        command: 'mcporter',
        critical: true
      },
      python: {
        name: 'Python',
        type: 'cli',
        command: 'python',
        critical: true
      },
      node: {
        name: 'Node.js',
        type: 'cli',
        command: 'node',
        critical: true
      },
      git: {
        name: 'Git',
        type: 'cli',
        command: 'git',
        critical: false
      }
    };
  }

  /**
   * 检查所有依赖
   */
  async checkAll() {
    const results = {};

    for (const [key, dep] of Object.entries(this.dependencies)) {
      try {
        const result = await this.checkDependency(key, dep);
        results[key] = result;
        this.healthStatus.set(key, result);
      } catch (error) {
        results[key] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    return results;
  }

  /**
   * 检查单个依赖
   */
  async checkDependency(key, dep) {
    const startTime = Date.now();

    switch (dep.type) {
      case 'mcp':
        return await this.checkMCP(dep);

      case 'mcporter':
        return await this.checkMcporter(dep);

      case 'http':
        return await this.checkHttp(dep);

      case 'cli':
        return await this.checkCli(dep);

      case 'browser':
        return await this.checkBrowser(dep);

      default:
        throw new Error(`Unknown dependency type: ${dep.type}`);
    }
  }

  /**
   * 检查 MCP 服务
   */
  async checkMCP(dep) {
    const startTime = Date.now();

    try {
      const result = await this.executeCommand(
        `netstat -ano | findstr ":${dep.port}"`
      );

      const isListening = result.includes('LISTENING');
      const responseTime = Date.now() - startTime;

      return {
        status: isListening ? 'healthy' : 'unhealthy',
        responseTime,
        port: dep.port,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 检查 mcporter 渠道
   */
  async checkMcporter(dep) {
    const startTime = Date.now();

    try {
      const result = await this.executeCommand(
        `mcporter list 2>&1`
      );

      const isAvailable = result.includes(dep.channel);
      const responseTime = Date.now() - startTime;

      return {
        status: isAvailable ? 'healthy' : 'unhealthy',
        responseTime,
        channel: dep.channel,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 检查 HTTP 服务
   */
  async checkHttp(dep) {
    const startTime = Date.now();

    try {
      const response = await fetch(dep.url, {
        method: 'HEAD',
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 检查 CLI 工具
   */
  async checkCli(dep) {
    const startTime = Date.now();

    try {
      const result = await this.executeCommand(
        `${dep.command} --version 2>&1`
      );

      const responseTime = Date.now() - startTime;
      const version = result.split('\n')[0];

      return {
        status: 'healthy',
        responseTime,
        version,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 检查浏览器自动化
   */
  async checkBrowser(dep) {
    // 简单检查：返回上次登录时间
    return {
      status: 'unknown',
      message: '需要手动检查',
      loginUrl: dep.loginUrl,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行命令
   */
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * 生成健康报告
   */
  generateReport() {
    const results = Array.from(this.healthStatus.entries());

    const summary = {
      total: results.length,
      healthy: results.filter(([, r]) => r.status === 'healthy').length,
      unhealthy: results.filter(([, r]) => r.status === 'unhealthy').length,
      error: results.filter(([, r]) => r.status === 'error').length,
      unknown: results.filter(([, r]) => r.status === 'unknown').length
    };

    const critical = results.filter(([key]) => 
      this.dependencies[key].critical
    );

    const criticalHealthy = critical.filter(([, r]) => 
      r.status === 'healthy'
    ).length;

    return {
      summary,
      critical: {
        total: critical.length,
        healthy: criticalHealthy,
        availability: criticalHealthy / critical.length
      },
      details: Object.fromEntries(results),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 检查告警
   */
  checkAlerts() {
    const alerts = [];

    // 检查关键依赖
    for (const [key, status] of this.healthStatus) {
      const dep = this.dependencies[key];

      if (dep.critical && status.status !== 'healthy') {
        alerts.push({
          level: 'critical',
          dependency: key,
          message: `关键依赖 ${dep.name} 不健康: ${status.status}`,
          timestamp: new Date().toISOString()
        });
      }

      // 检查响应时间
      if (status.responseTime > this.alertThresholds.responseTime) {
        alerts.push({
          level: 'warning',
          dependency: key,
          message: `${dep.name} 响应时间过长: ${status.responseTime}ms`,
          timestamp: new Date().toISOString()
        });
      }
    }

    return alerts;
  }

  /**
   * 自动修复
   */
  async autoFix() {
    const fixes = [];

    for (const [key, status] of this.healthStatus) {
      if (status.status === 'unhealthy') {
        const dep = this.dependencies[key];

        // 尝试启动 MCP 服务
        if (dep.type === 'mcp') {
          try {
            await this.startMCP(dep);
            fixes.push({
              dependency: key,
              action: 'started',
              success: true
            });
          } catch (error) {
            fixes.push({
              dependency: key,
              action: 'started',
              success: false,
              error: error.message
            });
          }
        }
      }
    }

    return fixes;
  }

  /**
   * 启动 MCP 服务
   */
  async startMCP(dep) {
    if (dep.port === 8001) {
      // LinkedIn MCP
      await this.executeCommand(
        'python -m linkedin_mcp_server --port 8001'
      );
    } else if (dep.port === 18070) {
      // 抖音 MCP
      await this.executeCommand(
        'python -m douyin_mcp_server'
      );
    }
  }
}

module.exports = DependencyHealthChecker;
