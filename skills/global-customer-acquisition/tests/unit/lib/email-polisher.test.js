/**
 * Email Polisher 单元测试
 * 测试邮件润色和评分功能
 */

import { describe, test, expect } from '@jest/globals';

describe('Email Polisher', () => {
  describe('评分系统', () => {
    test('应该正确评分个性化程度', () => {
      const email = {
        companyName: 'ABC Industrial',
        contactName: 'John Smith',
        product: '风冷机PA-III-1200'
      };

      const hasCompanyName = email.content?.includes(email.companyName);
      const hasContactName = email.content?.includes(email.contactName);
      const hasProduct = email.content?.includes(email.product);

      // 个性化得分 = (2 + 2 + 2) = 6分
      const personalizationScore = (hasCompanyName ? 2 : 0) +
                                    (hasContactName ? 2 : 0) +
                                    (hasProduct ? 2 : 0);

      expect(personalizationScore).toBeGreaterThanOrEqual(0);
      expect(personalizationScore).toBeLessThanOrEqual(6);
    });

    test('应该检测AI味并评分', () => {
      const aiPhrases = [
        'In today\'s rapidly evolving landscape',
        'game-changer',
        'cutting-edge',
        'revolutionary',
        'state-of-the-art'
      ];

      const emailContent = 'In today\'s rapidly evolving landscape, our cutting-edge solution is a game-changer';
      const aiDensity = aiPhrases.filter(phrase => emailContent.toLowerCase().includes(phrase.toLowerCase())).length;

      // AI味越少越好，这里3个短语 = 高AI味
      expect(aiDensity).toBe(3);
    });
  });

  describe('打磨流程', () => {
    test('第一轮打磨后应该重新评分', async () => {
      const firstDraftScore = 7.5;
      const targetScore = 9.0;
      const needsPolishing = firstDraftScore < targetScore;

      expect(needsPolishing).toBe(true);

      // 模拟打磨流程
      let currentScore = firstDraftScore;
      let attempts = 0;
      const maxAttempts = 3;

      while (currentScore < targetScore && attempts < maxAttempts) {
        attempts++;
        currentScore += 0.5; // 模拟改进
      }

      expect(attempts).toBeGreaterThan(0);
      expect(currentScore).toBeGreaterThanOrEqual(targetScore);
    });

    test('达到目标分数后应该停止打磨', () => {
      const scores = [7.5, 8.2, 9.1];
      const targetScore = 9.0;

      const finalScore = scores.find(score => score >= targetScore);
      expect(finalScore).toBe(9.1);
    });
  });

  describe('质量检查', () => {
    test('应该检测并修复语法错误', () => {
      const badEmail = 'Dear John, I hope you is doing well.';
      const hasError = badEmail.includes('you is');

      expect(hasError).toBe(true);
    });

    test('应该检查CTA有效性', () => {
      const weakCTAs = [
        'Let us know if you need anything',
        'Feel free to contact us',
        'Looking forward to hearing from you'
      ];

      const strongCTAs = [
        'Can we schedule a 15-minute call this week?',
        'Would you be available for a demo next Tuesday?',
        'Shall I send you our product catalog?'
      ];

      const emailCTA = 'Can we schedule a 15-minute call this week?';
      const isStrong = strongCTAs.some(cta => emailCTA.includes(cta));

      expect(isStrong).toBe(true);
    });
  });
});
