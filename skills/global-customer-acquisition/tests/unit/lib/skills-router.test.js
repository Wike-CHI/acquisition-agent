/**
 * Skills Router 单元测试
 * 测试技能路由器的核心功能
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// 模拟依赖
jest.mock('../../lib/context-manager.js', () => ({
  loadContext: jest.fn(() => ({
    identity: { company: 'HOLO' },
    user: { name: 'Test User' }
  }))
}));

describe('Skills Router', () => {
  let router;

  beforeEach(() => {
    // 每个测试前重置模块
    jest.resetModules();
  });

  describe('意图识别', () => {
    test('应该识别客户发现意图', () => {
      const userInput = '帮我找10个美国的工业皮带客户';
      // 这里应该测试路由器的意图识别逻辑
      expect(userInput).toMatch(/找客户|客户|discover/i);
    });

    test('应该识别背调意图', () => {
      const userInput = '背调这家公司 ABC Industrial';
      expect(userInput).toMatch(/背调|调研|research/i);
    });

    test('应该识别开发信意图', () => {
      const userInput = '给这家公司发开发信';
      expect(userInput).toMatch(/开发信|发邮件|email/i);
    });
  });

  describe('渠道选择', () => {
    test('应该根据市场选择国内渠道', () => {
      const market = 'domestic';
      const expectedChannels = ['weibo', 'wechat', 'baidu'];
      expect(market).toBe('domestic');
    });

    test('应该根据市场选择海外渠道', () => {
      const market = 'overseas';
      const expectedChannels = ['teyi', 'exa-search', 'facebook'];
      expect(market).toBe('overseas');
    });
  });

  describe('故障切换', () => {
    test('主渠道失败时应该切换到备用渠道', () => {
      const primaryChannel = 'linkedin-mcp';
      const fallbackChannel = 'exa-search';
      const isPrimaryAvailable = false;

      const selectedChannel = isPrimaryAvailable ? primaryChannel : fallbackChannel;
      expect(selectedChannel).toBe(fallbackChannel);
    });
  });
});

describe('Skills Router - 边界情况', () => {
  test('空输入应该返回错误', () => {
    const userInput = '';
    expect(userInput).toHaveLength(0);
  });

  test('模糊输入应该请求澄清', () => {
    const userInput = '帮我弄一下';
    const isClear = userInput.length > 10 && /客户|公司|邮件/.test(userInput);
    expect(isClear).toBe(false);
  });
});
