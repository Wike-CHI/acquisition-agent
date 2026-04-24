/**
 * 孚盟MX CRM 培育流程自动化脚本
 *
 * 添加到培育流程:
 * 1. 导航到客户详情页
 * 2. 点击"添加到培育"按钮
 * 3. 选择培育模板（如果有多个）
 * 4. 确认添加
 * 5. 验证培育记录出现
 */

import { URLS, NURTURE, WAIT_CONFIG } from './selectors'
import type { CdpAction } from './query-customer'

// ─── 数据类型 ─────────────────────────────────────────

export interface AddToNurtureInput {
  customerId: string
  templateName?: string
}

export interface NurtureResult {
  success: boolean
  customerId: string
  templateUsed?: string
  error?: string
  timestamp: string
}

/**
 * 生成添加到培育流程的 CDP 动作序列
 */
export function buildAddToNurtureActions(input: AddToNurtureInput): CdpAction[] {
  const actions: CdpAction[] = [
    // 1. 导航到客户详情页
    { type: 'navigate', value: URLS.CUSTOMER_DETAIL(input.customerId) },
    { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },

    // 2. 等待并点击培育按钮
    {
      type: 'waitForSelector',
      selector: NURTURE.addToNurture[0],
      timeout: WAIT_CONFIG.ELEMENT_TIMEOUT,
    },
    { type: 'click', selector: NURTURE.addToNurture[0] },
    { type: 'wait', value: WAIT_CONFIG.DIALOG_OPEN },
  ]

  // 3. 如果指定了培育模板，选择它
  if (input.templateName) {
    actions.push(
      {
        type: 'waitForSelector',
        selector: NURTURE.nurtureTemplate[0],
        timeout: 5000,
      },
      {
        type: 'select',
        selector: NURTURE.nurtureTemplate[0],
        value: input.templateName,
      },
      { type: 'wait', value: 800 },
    )
  }

  // 4. 确认添加
  actions.push(
    { type: 'screenshot' },
    { type: 'click', selector: NURTURE.confirmButton[0] },
    { type: 'wait', value: 2000 },
    { type: 'screenshot' },
    {
      type: 'evaluate',
      script: buildNurtureResultScript(),
    },
  )

  return actions
}

/**
 * 生成检查培育状态的 CDP 动作序列
 */
export function buildCheckNurtureStatusActions(customerId: string): CdpAction[] {
  return [
    { type: 'navigate', value: URLS.CUSTOMER_DETAIL(customerId) },
    { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },
    { type: 'screenshot' },
    {
      type: 'evaluate',
      script: buildCheckNurtureScript(),
    },
  ]
}

// ─── 检测脚本 ────────────────────────────────────────

function buildNurtureResultScript(): string {
  return `
    (function() {
      const toast = document.querySelector('.el-message--success');
      const errorToast = document.querySelector('.el-message--error');

      if (errorToast) {
        return JSON.stringify({ success: false, error: errorToast.textContent.trim() });
      }

      // 检查培育标签页是否出现培育中状态
      const statusEl = document.querySelector('[class*="tag"]:has-text("培育中")');
      const isNurturing = !!statusEl;

      return JSON.stringify({ success: true, isNurturing });
    })()
  `
}

function buildCheckNurtureScript(): string {
  return `
    (function() {
      const statusEl = document.querySelector('[class*="tag"]:has-text("培育中")');
      const statusText = statusEl ? statusEl.textContent.trim() : null;

      // 查找培育记录
      const nurtureItems = document.querySelectorAll('[class*="nurture"], [class*="培育"]');

      return JSON.stringify({
        isNurturing: !!statusEl,
        status: statusText,
        nurtureRecordCount: nurtureItems.length,
      });
    })()
  `
}
