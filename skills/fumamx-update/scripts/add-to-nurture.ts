/**
 * Fumamx Add to Nurture — CDP Action Sequences
 *
 * 将客户添加到培育序列的 CDP 动作序列。
 * 培育（nurture/cultivation）是将客户放入跟进流程的自动化机制。
 *
 * 选择器策略：Element Plus + 弹性 fallback 链
 */

import type { FumamxAction } from '../../holo-agent/electron/main/fumamx/types';
import { FUMAMX_BASE_URL } from './config';

export interface NurtureTemplate {
  id: string;
  name: string;
  description?: string;
}

export interface AddToNurtureResult {
  success: boolean;
  customerNo: string;
  nurtureAdded: boolean;
  templateName?: string;
  nurtureRecordId?: string;
  error?: string;
}

// ─── 选择器库 ──────────────────────────────────────────────

export const NURTURE_SELECTORS = {
  // 添加到培育按钮（在客户详情页）
  addToNurtureButton: [
    'button:has-text("添加到培育")',
    'button:has-text("培育")',
    '[class*="nurture"] button',
    '[class*="action"] button:nth-child(2)',
    'button[class*="nurture"]',
    // Fallback: 在详情页工具栏中查找
    '.el-button:has-text("培育")',
  ],

  // 培育弹窗
  nurtureDialog: [
    '.el-dialog:has-text("培育")',
    '[class*="nurture"][class*="dialog"]',
    '.el-overlay:has-text("培育")',
  ],

  // 培育模板选择
  templateOption: (templateName: string) => [
    `.el-option:has-text("${templateName}")`,
    `.el-select-dropdown__item:has-text("${templateName}")`,
    `[class*="template"]:has-text("${templateName}")`,
    `.el-radio:has-text("${templateName}")`,
    `.el-checkbox:has-text("${templateName}")`,
  ],

  // 第一个可用模板（未指定模板名时）
  firstTemplate: [
    '.el-option:first-child',
    '.el-select-dropdown__item:first-child',
    '[class*="template"]:first-child',
  ],

  // 确认添加
  confirmButton: [
    '.el-dialog button.el-button--primary',
    'button:has-text("确定")',
    'button:has-text("确认")',
    'button:has-text("添加到培育")',
  ],

  // 取消
  cancelButton: [
    '.el-dialog button:has-text("取消")',
    'button:has-text("取消")',
  ],

  // 成功提示（Toast / message）
  successToast: [
    '.el-message--success',
    '[class*="message"][class*="success"]',
    '.el-notification--success',
  ],

  // 培育记录指示器
  nurtureRecord: [
    '[class*="nurture-record"]',
    '[class*="cultivation"]',
    '[class*="follow-up"]',
    // 详情页培育标签
    '.el-tabs__content:has-text("培育")',
  ],

  // 培育标签页
  nurtureTab: [
    'button:has-text("培育")',
    '.el-tab-pane:has-text("培育")',
    '[class*="tab"]:has-text("培育")',
  ],
};

// ─── Action Sequence Builders ─────────────────────────────────

/**
 * 构建"打开培育弹窗"动作序列
 */
export function buildOpenNurtureDialogSequence(): FumamxAction[] {
  return [
    {
      type: 'waitForSelector',
      selector: NURTURE_SELECTORS.addToNurtureButton[0],
      timeout: 10_000,
      state: 'visible',
    },
    {
      type: 'click',
      selector: NURTURE_SELECTORS.addToNurtureButton[0],
    },
    {
      type: 'waitForSelector',
      selector: NURTURE_SELECTORS.nurtureDialog[0],
      timeout: 8_000,
      state: 'visible',
    },
    // 等待弹窗动画
    {
      type: 'wait',
      ms: 500,
    },
  ];
}

/**
 * 构建"选择培育模板"动作序列
 */
export function buildSelectTemplateSequence(templateName?: string): FumamxAction[] {
  if (templateName) {
    return [
      {
        type: 'click',
        selector: NURTURE_SELECTORS.templateOption(templateName)[0],
      },
      {
        type: 'wait',
        ms: 300,
      },
    ];
  }

  // 未指定模板，选择第一个可用模板
  return [
    {
      type: 'click',
      selector: NURTURE_SELECTORS.firstTemplate[0],
    },
    {
      type: 'wait',
      ms: 300,
    },
  ];
}

/**
 * 构建"确认添加到培育"动作序列
 */
export function buildConfirmNurtureSequence(): FumamxAction[] {
  return [
    {
      type: 'waitForNetworkIdle',
      timeout: 5_000,
    },
    {
      type: 'click',
      selector: NURTURE_SELECTORS.confirmButton[0],
    },
    {
      type: 'waitForSelector',
      selector: NURTURE_SELECTORS.successToast[0],
      timeout: 10_000,
      state: 'visible',
    },
  ];
}

/**
 * 构建完整"添加到培育"动作序列
 */
export function buildAddToNurtureSequence(
  customerId: string,
  templateName?: string
): FumamxAction[] {
  return [
    // Step 1: 导航到详情页
    {
      type: 'navigate',
      url: `${FUMAMX_BASE_URL}/#/main/newClient/NewBF001/detail/${customerId}`,
    },
    // Step 2: 等待详情页加载
    {
      type: 'waitForNetworkIdle',
      timeout: 15_000,
    },
    // Step 3: 点击"添加到培育"
    ...buildOpenNurtureDialogSequence(),
    // Step 4: 选择模板
    ...buildSelectTemplateSequence(templateName),
    // Step 5: 确认
    ...buildConfirmNurtureSequence(),
  ];
}

/**
 * 构建"验证培育添加成功"脚本
 */
export function buildVerifyNurtureScript(): string {
  return `(function() {
  // 检查成功 Toast
  const toast = document.querySelector('.el-message--success, [class*="message"][class*="success"]');
  const hasToast = !!toast;

  // 检查培育记录是否出现
  const nurtureSection = document.querySelector('[class*="nurture-record"], [class*="cultivation"], [class*="follow-up"]');
  const hasNurtureRecord = !!nurtureSection;

  // 检查 URL 是否有变化（某些系统添加后跳转到培育页）
  const currentUrl = window.location.href;

  return JSON.stringify({
    success: hasToast || hasNurtureRecord,
    hasToast,
    hasNurtureRecord,
    currentUrl,
    verifiedAt: new Date().toISOString(),
  });
})()`;
}

/**
 * 提取可用培育模板列表（用户选择前展示）
 */
export function buildListTemplatesScript(): string {
  return `(function() {
  const options = document.querySelectorAll('.el-option, .el-select-dropdown__item, [class*="template"]');
  const templates = Array.from(options).map(opt => ({
    name: opt.textContent?.trim() || '',
    value: (opt as HTMLElement).dataset?.value || opt.getAttribute('value') || '',
  })).filter(t => t.name && !t.name.includes('请选择'));
  return JSON.stringify({ templates });
})()`;
}
