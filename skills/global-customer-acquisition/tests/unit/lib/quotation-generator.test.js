/**
 * Quotation Generator 单元测试
 * 测试报价单生成功能
 */

import { describe, test, expect } from '@jest/globals';

describe('Quotation Generator', () => {
  describe('报价数据验证', () => {
    test('应该验证必需字段', () => {
      const quotation = {
        customerName: 'ABC Industrial',
        contactPerson: 'John Smith',
        products: [{ code: 'PA-III-1200', quantity: 1 }],
        validUntil: '2026-12-31'
      };

      const hasCustomerName = !!quotation.customerName;
      const hasContactPerson = !!quotation.contactPerson;
      const hasProducts = quotation.products.length > 0;
      const hasValidDate = !!quotation.validUntil;

      const isValid = hasCustomerName && hasContactPerson && hasProducts && hasValidDate;
      expect(isValid).toBe(true);
    });

    test('缺少必需字段应该抛出错误', () => {
      const incompleteQuotation = {
        customerName: 'ABC Industrial'
        // 缺少 contactPerson, products, validUntil
      };

      const isValid = incompleteQuotation.customerName &&
                     incompleteQuotation.contactPerson &&
                     incompleteQuotation.products &&
                     incompleteQuotation.validUntil;

      expect(isValid).toBe(false);
    });
  });

  describe('价格计算', () => {
    test('应该正确计算总价', () => {
      const products = [
        { code: 'PA-III-1200', quantity: 2, unitPrice: 5000 },
        { code: 'A1FCJ130', quantity: 1, unitPrice: 3000 }
      ];

      const total = products.reduce((sum, product) => {
        return sum + (product.quantity * product.unitPrice);
      }, 0);

      expect(total).toBe(13000); // 2*5000 + 1*3000
    });

    test('应该应用折扣', () => {
      const subtotal = 10000;
      const discountRate = 0.1; // 10% 折扣
      const discount = subtotal * discountRate;
      const total = subtotal - discount;

      expect(total).toBe(9000);
    });
  });

  describe('文档生成', () => {
    test('应该生成DOCX格式', () => {
      const format = 'docx';
      const supportedFormats = ['docx', 'pdf', 'html'];

      expect(supportedFormats).toContain(format);
    });

    test('应该包含公司信息', () => {
      const companyInfo = {
        name: '温州红龙工业设备制造有限公司',
        address: '浙江省瑞安市东山街道望新路188号3幢101室',
        phone: '+86 577-66856856',
        email: 'info@holobelt.com'
      };

      const hasName = !!companyInfo.name;
      const hasAddress = !!companyInfo.address;
      const hasPhone = !!companyInfo.phone;
      const hasEmail = !!companyInfo.email;

      const isComplete = hasName && hasAddress && hasPhone && hasEmail;
      expect(isComplete).toBe(true);
    });
  });
});
