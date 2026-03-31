/**
 * Jest 配置文件
 * 用于测试框架配置
 */

export default {
  // 测试环境
  testEnvironment: 'node',

  // 使用 ES 模块
  preset: null,

  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // 覆盖率收集
  collectCoverageFrom: [
    'lib/**/*.js',
    'scripts/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],

  // 覆盖率目标
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],

  // 覆盖率输出目录
  coverageDirectory: 'coverage',

  // 详细输出
  verbose: true,

  // 测试超时时间（毫秒）
  testTimeout: 10000,

  // 清除模拟
  clearMocks: true,

  // 每个测试后重置模块
  resetModules: false,

  // 全局设置文件
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/.git/'
  ],

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@context/(.*)$': '<rootDir>/context/$1'
  }
};
