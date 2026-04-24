/**
 * 孚盟MX CRM 批量操作自动化脚本
 *
 * 支持:
 * 1. Excel 批量导入客户
 * 2. 批量添加到培育
 * 3. 进度追踪 + 取消支持
 */

import { URLS, BATCH, CUSTOMER_LIST, WAIT_CONFIG } from './selectors'
import type { CdpAction } from './query-customer'

// ─── 数据类型 ─────────────────────────────────────────

export type BatchOperationType = 'import' | 'nurture' | 'tag' | 'email'

export interface BatchInput {
  operation: BatchOperationType
  /** 导入时: 客户数据数组; 培育时: 客户 ID 数组 */
  items: Array<Record<string, unknown>>
  /** 标签操作时的标签名 */
  tagName?: string
  /** 邮件操作时的模板名 */
  emailTemplate?: string
}

export interface BatchProgress {
  total: number
  completed: number
  failed: number
  current: number
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'error'
  errors: Array<{ index: number; item: Record<string, unknown>; error: string }>
}

export interface BatchResult {
  success: boolean
  total: number
  completed: number
  failed: number
  duration: number
  errors: BatchProgress['errors']
  timestamp: string
}

/**
 * 生成批量导入预览动作序列 — 打开导入对话框
 */
export function buildBatchImportPreviewActions(): CdpAction[] {
  return [
    { type: 'navigate', value: URLS.CUSTOMER_LIST },
    { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },
    {
      type: 'waitForSelector',
      selector: CUSTOMER_LIST.newCustomer[0],
      timeout: WAIT_CONFIG.ELEMENT_TIMEOUT,
    },
    { type: 'screenshot' },
    {
      type: 'waitForSelector',
      selector: BATCH.importButton[0],
      timeout: 5000,
    },
    { type: 'click', selector: BATCH.importButton[0] },
    { type: 'wait', value: WAIT_CONFIG.DIALOG_OPEN },
    { type: 'screenshot' },
  ]
}

/**
 * 为每个客户生成逐个创建的动作序列
 * 批量创建 = 对每个客户执行单条创建流程
 *
 * 注意：孚盟MX 的导入功能是通过上传 Excel 文件实现的，
 * CDP 无法直接操作文件上传。因此批量创建采用逐个创建策略。
 */
export function buildBatchCreateActions(
  customers: Array<{
    companyName: string
    country: string
    email: string
    phone?: string
  }>,
): Array<{ customerIndex: number; companyName: string; actions: CdpAction[] }> {
  return customers.map((customer, index) => {
    const actions: CdpAction[] = [
      // 导航回客户列表（每个客户都从列表开始）
      { type: 'navigate', value: URLS.CUSTOMER_LIST },
      { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },
      {
        type: 'waitForSelector',
        selector: CUSTOMER_LIST.newCustomer[0],
        timeout: WAIT_CONFIG.ELEMENT_TIMEOUT,
      },
      { type: 'click', selector: CUSTOMER_LIST.newCustomer[0] },
      {
        type: 'waitForSelector',
        selector: 'input[placeholder="抬头名称"]',
        timeout: WAIT_CONFIG.DIALOG_OPEN * 2,
      },
      // 填写基本信息
      { type: 'fill', selector: 'input[placeholder="抬头名称"]', value: customer.companyName },
      { type: 'fill', selector: 'input[placeholder="国家/地区"]', value: customer.country },
      // 添加联系人
      { type: 'click', selector: 'button:has-text("新增联系人")' },
      { type: 'wait', value: 800 },
      { type: 'fill', selector: 'input[placeholder*="邮箱账号"]', value: customer.email },
    ]

    if (customer.phone) {
      actions.push({ type: 'fill', selector: 'input[placeholder*="手机"]', value: customer.phone })
    }

    // 提交
    actions.push(
      { type: 'click', selector: '.el-dialog__wrapper button:has-text("确定")' },
      { type: 'wait', value: 2000 },
      {
        type: 'evaluate',
        script: `
          (function() {
            const dialog = document.querySelector('.el-dialog__wrapper');
            if (dialog && dialog.offsetParent !== null) {
              return JSON.stringify({ success: false, error: 'Dialog still open' });
            }
            const errorToast = document.querySelector('.el-message--error');
            if (errorToast) {
              return JSON.stringify({ success: false, error: errorToast.textContent.trim() });
            }
            return JSON.stringify({ success: true });
          })()
        `,
      },
    )

    return { customerIndex: index, companyName: customer.companyName, actions }
  })
}

/**
 * 生成批量添加到培育的动作序列
 */
export function buildBatchNurtureActions(
  customerIds: string[],
  templateName?: string,
): Array<{ customerId: string; actions: CdpAction[] }> {
  return customerIds.map((customerId) => {
    const actions: CdpAction[] = [
      { type: 'navigate', value: URLS.CUSTOMER_DETAIL(customerId) },
      { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },
      {
        type: 'waitForSelector',
        selector: '[class*="cursor:pointer"]:has-text("添加到培育")',
        timeout: WAIT_CONFIG.ELEMENT_TIMEOUT,
      },
      { type: 'click', selector: '[class*="cursor:pointer"]:has-text("添加到培育")' },
      { type: 'wait', value: WAIT_CONFIG.DIALOG_OPEN },
    ]

    if (templateName) {
      actions.push(
        {
          type: 'waitForSelector',
          selector: '.el-select .el-input__inner',
          timeout: 5000,
        },
        {
          type: 'select',
          selector: '.el-select .el-input__inner',
          value: templateName,
        },
        { type: 'wait', value: 800 },
      )
    }

    actions.push(
      { type: 'click', selector: '.el-dialog__wrapper button:has-text("确定")' },
      { type: 'wait', value: 1500 },
      {
        type: 'evaluate',
        script: `
          (function() {
            const toast = document.querySelector('.el-message--success');
            const errorToast = document.querySelector('.el-message--error');
            if (errorToast) {
              return JSON.stringify({ success: false, error: errorToast.textContent.trim() });
            }
            return JSON.stringify({ success: !!toast });
          })()
        `,
      },
    )

    return { customerId, actions }
  })
}

/**
 * 批量操作进度检测脚本
 * 在批量操作执行过程中定期调用，检测当前进度
 */
export function buildBatchProgressScript(): string {
  return `
    (function() {
      // 检测进度条
      const progress = document.querySelector('.el-progress');
      if (progress) {
        const text = progress.textContent.trim();
        const match = text.match(/(\\d+)%/);
        const percent = match ? parseInt(match[1]) : 0;
        return JSON.stringify({ hasProgress: true, percent });
      }

      // 检测是否有操作中的弹窗
      const loading = document.querySelector('.el-loading-mask');
      if (loading) {
        return JSON.stringify({ hasProgress: true, percent: -1, loading: true });
      }

      return JSON.stringify({ hasProgress: false });
    })()
  `
}
