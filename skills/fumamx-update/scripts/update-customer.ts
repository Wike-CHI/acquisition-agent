/**
 * Fumamx Customer Update — CDP Action Sequences
 *
 * 客户信息更新自动化 CDP 动作序列。
 * 客户详情页 URL: https://fumamx.com/#/main/newClient/NewBF001/detail/{id}
 *
 * 选择器策略：Element Plus + 弹性 fallback 链
 * 参考: F-005/F-006 实际 DOM 验证
 */

import type { FumamxAction } from '../../holo-agent/electron/main/fumamx/types';
import { FUMAMX_BASE_URL } from './config';

export interface UpdateField {
  field: string;    // 字段显示名
  selector: string; // 目标 input 选择器
  value: string;    // 新值
}

export interface CustomerUpdateResult {
  success: boolean;
  customerNo: string;
  updatedFields: UpdateField[];
  failedFields: { field: string; error: string }[];
  error?: string;
}

// ─── 选择器库 ──────────────────────────────────────────────

/**
 * 客户详情页编辑表单字段选择器（弹性 fallback 链）
 */
export const UPDATE_FIELD_SELECTORS: Record<string, string[]> = {
  // 基本信息
  email: [
    'input[placeholder*="邮箱"]',
    'input[placeholder*="邮箱账号"]',
    'input.el-input__inner:nth-of-type(1)',
  ],
  phone: [
    'input[placeholder*="手机"]',
    'input[placeholder*="电话"]',
    'input[type="tel"]',
  ],
  address: [
    'input[placeholder*="地址"]',
    'input[placeholder*="详细地址"]',
    'textarea[placeholder*="地址"]',
  ],
  website: [
    'input[placeholder*="网址"]',
    'input[placeholder*="网站"]',
    'input[type="url"]',
  ],
  // 联系人信息
  contactName: [
    'input[placeholder*="姓名"]',
    'input[placeholder*="联系人"]',
    '[class*="contact"] input[type="text"]',
  ],
  contactTitle: [
    'input[placeholder*="职位"]',
    'input[placeholder*="职务"]',
    '[class*="contact"] input:nth-of-type(2)',
  ],
  // 备注
  remark: [
    'textarea[placeholder*="备注"]',
    'input[placeholder*="备注"]',
    'textarea',
  ],
};

/**
 * 固定页面元素选择器
 */
export const DETAIL_PAGE_SELECTORS = {
  // 编辑模式入口
  editButton: [
    'button:has-text("编辑")',
    'button:has-text("编辑客户")',
    '.el-button:has-text("编辑")',
    '[class*="action"] button:first-child',
    '[class*="toolbar"] button:nth-child(1)',
  ],
  // 编辑表单保存
  saveButton: [
    'button:has-text("保存")',
    '.el-button--primary:has-text("保存")',
    '[class*="form"] button:has-text("保")',
    '.el-dialog button.el-button--primary',
  ],
  // 编辑表单取消
  cancelButton: [
    'button:has-text("取消")',
    '.el-button:has-text("取消")',
  ],
  // 确认弹窗
  confirmDialog: [
    '.el-message-box__wrapper',
    '.el-overlay',
    '[class*="message-box"]',
  ],
  confirmOk: [
    '.el-message-box__btn:has-text("确定")',
    '.el-button--primary:has-text("确定")',
    'button:has-text("确定")',
  ],
  // 编辑模式指示器
  editModeIndicator: [
    '[class*="edit"]',
    '[class*="form--active"]',
    '.el-form-item',
  ],
};

// ─── Action Sequence Builders ─────────────────────────────────

/**
 * 构建"进入编辑模式"动作序列
 */
export function buildEnterEditSequence(): FumamxAction[] {
  return [
    {
      type: 'waitForSelector',
      selector: UPDATE_FIELD_SELECTORS.email[0],
      timeout: 10_000,
      state: 'attached',
    },
    {
      type: 'click',
      selector: DETAIL_PAGE_SELECTORS.editButton[0],
    },
    {
      type: 'waitForSelector',
      selector: DETAIL_PAGE_SELECTORS.saveButton[0],
      timeout: 8_000,
      state: 'visible',
    },
  ];
}

/**
 * 构建"填写单个字段"动作序列
 * 先尝试在 fallback 链中逐个尝试直到成功
 */
export function buildFillFieldSequence(field: UpdateField): FumamxAction[] {
  return [
    // 点击字段使其获得焦点
    {
      type: 'click',
      selector: field.selector,
    },
    // 清空并填写新值
    {
      type: 'fill',
      selector: field.selector,
      value: field.value,
      options: { clearFirst: true, delay: 50 },
    },
    // 等待值被写入
    {
      type: 'wait',
      ms: 300,
    },
  ];
}

/**
 * 构建"保存更新"动作序列
 */
export function buildSaveSequence(): FumamxAction[] {
  return [
    {
      type: 'waitForNetworkIdle',
      timeout: 5_000,
    },
    {
      type: 'click',
      selector: DETAIL_PAGE_SELECTORS.saveButton[0],
    },
    // 等待可能的确认弹窗
    {
      type: 'waitForSelector',
      selector: DETAIL_PAGE_SELECTORS.confirmDialog[0],
      timeout: 3_000,
      state: 'visible',
    },
  ];
}

/**
 * 构建"确认并完成"动作序列
 */
export function buildConfirmSequence(): FumamxAction[] {
  return [
    {
      type: 'waitForSelector',
      selector: DETAIL_PAGE_SELECTORS.confirmOk[0],
      timeout: 5_000,
      state: 'visible',
    },
    {
      type: 'click',
      selector: DETAIL_PAGE_SELECTORS.confirmOk[0],
    },
    {
      type: 'waitForNetworkIdle',
      timeout: 10_000,
    },
  ];
}

/**
 * 构建完整"客户更新"动作序列
 * 包含：导航 → 编辑 → 填字段 → 保存 → 确认
 */
export function buildCustomerUpdateSequence(
  customerId: string,
  fields: UpdateField[]
): FumamxAction[] {
  const actions: FumamxAction[] = [
    // Step 1: 导航到详情页
    {
      type: 'navigate',
      url: `${FUMAMX_BASE_URL}/#/main/newClient/NewBF001/detail/${customerId}`,
    },
    // Step 2: 等待页面加载
    {
      type: 'waitForSelector',
      selector: UPDATE_FIELD_SELECTORS.email[0],
      timeout: 15_000,
      state: 'attached',
    },
    // Step 3: 进入编辑模式
    ...buildEnterEditSequence(),
    // Step 4: 填写每个字段
    ...fields.flatMap((f) => buildFillFieldSequence(f)),
    // Step 5: 保存
    ...buildSaveSequence(),
    // Step 6: 确认（如有弹窗）
    ...buildConfirmSequence(),
  ];

  return actions;
}

/**
 * 构建"验证更新结果"脚本
 * 回读字段值，与预期对比
 */
export function buildVerifyUpdateScript(fields: UpdateField[]): string {
  const fieldChecks = fields.map((f) => {
    return `  '${f.field}': document.querySelector('${f.selector}')?.value || document.querySelector('${f.selector}')?.innerText || ''`;
  });

  return `(function() {
  const data = {
    ${fieldChecks.join(',\n    ')}
  };
  return JSON.stringify({
    success: true,
    verifiedAt: new Date().toISOString(),
    fieldValues: data,
  });
})()`;
}

/**
 * 提取客户详情页字段值的 evaluate 脚本
 * 用于获取当前字段旧值（更新前记录）
 */
export function buildExtractDetailScript(): string {
  return `(function() {
  const getField = (labelText) => {
    const labels = document.querySelectorAll('.field-label');
    for (const label of labels) {
      if (label.textContent.trim() === labelText) {
        const parent = label.parentElement;
        return parent?.querySelector('.field-content__text, .field-content, input, textarea')?.value
          || parent?.querySelector('.field-content__text, .field-content')?.textContent?.trim()
          || '';
      }
    }
    return '';
  };
  return JSON.stringify({
    customerNo: getField('客户编号'),
    customerName: getField('客户名称'),
    email: getField('主联系方式')?.match(/[\\w.-]+@[\\w.-]+\\.\\w+/)?.[0] || '',
    phone: getField('主联系方式')?.match(/[+]?[\\d\\s-]{7,}/)?.[0] || '',
    address: getField('地址'),
    website: getField('网址'),
  });
})()`;
}
