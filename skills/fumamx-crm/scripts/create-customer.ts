/**
 * 孚盟MX CRM 客户创建自动化脚本
 * 基于 2026-04-24 实际 DOM 分析
 *
 * 创建流程:
 * 1. 导航到客户列表页
 * 2. 点击"新建"按钮打开全屏弹窗
 * 3. 等待弹窗加载
 * 4. 执行查重（使用弹窗内搜索框）
 * 5. 填写基本信息
 * 6. 添加联系人
 * 7. 提交
 */

import { URLS, CUSTOMER_LIST, NEW_CUSTOMER, WAIT_CONFIG } from './selectors'
import type { CdpAction } from './query-customer'

// ─── 数据类型 ─────────────────────────────────────────

export interface CreateCustomerInput {
  companyName: string
  country: string
  email: string
  phone: string
  creditCode?: string
  shortName?: string
  province?: string
  city?: string
  district?: string
  address?: string
  remark?: string
  customsData?: string
}

export interface CreateCustomerResult {
  success: boolean
  customerNumber?: string
  error?: string
  duplicate?: boolean
  timestamp: string
}

// ─── MVP 可填写字段 ────────────────────────────────────

const DIALOG_CONTAINER = '.el-dialog__wrapper, [class*="create-dialog"]'

/**
 * 生成客户创建的 CDP 动作序列
 */
export function buildCreateActions(input: CreateCustomerInput): CdpAction[] {
  const actions: CdpAction[] = [
    // 1. 导航到客户列表页
    { type: 'navigate', value: URLS.CUSTOMER_LIST },
    { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },

    // 2. 等待新建按钮出现
    {
      type: 'waitForSelector',
      selector: CUSTOMER_LIST.newCustomer[0],
      timeout: WAIT_CONFIG.ELEMENT_TIMEOUT,
    },

    // 3. 点击"新建"打开全屏弹窗
    { type: 'click', selector: CUSTOMER_LIST.newCustomer[0] },

    // 4. 等待弹窗内的抬头名称输入框
    {
      type: 'waitForSelector',
      selector: NEW_CUSTOMER.companyName[0],
      timeout: WAIT_CONFIG.DIALOG_OPEN * 2,
    },
  ]

  // 5. 查重：使用弹窗内搜索框搜索公司名
  if (NEW_CUSTOMER.companySearch[0]) {
    actions.push(
      { type: 'fill', selector: NEW_CUSTOMER.companySearch[0], value: input.companyName },
      { type: 'click', selector: `${DIALOG_CONTAINER} button:has-text("搜索")` },
      { type: 'wait', value: 1500 },
    )
  }

  // 6. 填写基本信息（MVP 有 placeholder 的字段）
  const fields: Array<{ selector: string; value: string }> = []

  if (NEW_CUSTOMER.companyName[0]) {
    fields.push({ selector: NEW_CUSTOMER.companyName[0], value: input.companyName })
  }
  if (input.creditCode && NEW_CUSTOMER.creditCode[0]) {
    fields.push({ selector: NEW_CUSTOMER.creditCode[0], value: input.creditCode })
  }
  if (input.shortName && NEW_CUSTOMER.shortName[0]) {
    fields.push({ selector: NEW_CUSTOMER.shortName[0], value: input.shortName })
  }
  if (NEW_CUSTOMER.country[0]) {
    fields.push({ selector: NEW_CUSTOMER.country[0], value: input.country })
  }
  if (input.province && NEW_CUSTOMER.province[0]) {
    fields.push({ selector: NEW_CUSTOMER.province[0], value: input.province })
  }
  if (input.city && NEW_CUSTOMER.city[0]) {
    fields.push({ selector: NEW_CUSTOMER.city[0], value: input.city })
  }
  if (input.district && NEW_CUSTOMER.district[0]) {
    fields.push({ selector: NEW_CUSTOMER.district[0], value: input.district })
  }
  if (input.address && NEW_CUSTOMER.address[0]) {
    fields.push({ selector: NEW_CUSTOMER.address[0], value: input.address })
  }
  if (input.remark && NEW_CUSTOMER.remark[0]) {
    fields.push({ selector: NEW_CUSTOMER.remark[0], value: input.remark })
  }

  for (const field of fields) {
    actions.push({ type: 'fill', selector: field.selector, value: field.value })
  }

  // 7. 添加联系人（MVP 只填邮箱和手机）
  if (NEW_CUSTOMER.addContact[0] && (input.email || input.phone)) {
    actions.push(
      { type: 'click', selector: NEW_CUSTOMER.addContact[0] },
      { type: 'wait', value: 800 },
    )

    if (input.email && NEW_CUSTOMER.contactEmail[0]) {
      actions.push({ type: 'fill', selector: NEW_CUSTOMER.contactEmail[0], value: input.email })
    }
    if (input.phone && NEW_CUSTOMER.contactPhone[0]) {
      actions.push({ type: 'fill', selector: NEW_CUSTOMER.contactPhone[0], value: input.phone })
    }
  }

  // 8. 截图确认
  actions.push({ type: 'screenshot' })

  // 9. 查重结果检测
  actions.push({
    type: 'evaluate',
    script: buildDuplicateCheckScript(),
  })

  return actions
}

/**
 * 生成提交表单的动作序列（查重通过后调用）
 */
export function buildSubmitActions(): CdpAction[] {
  return [
    // 点击弹窗内的保存/确定按钮
    { type: 'click', selector: `${DIALOG_CONTAINER} button:has-text("确定")` },
    { type: 'wait', value: 2000 },
    { type: 'screenshot' },
    {
      type: 'evaluate',
      script: buildSubmitResultScript(),
    },
  ]
}

// ─── 辅助检测脚本 ─────────────────────────────────────

function buildDuplicateCheckScript(): string {
  return `
    (function() {
      // 检查弹窗内是否有重复提示
      const dialog = document.querySelector('.el-dialog__wrapper') ||
                    document.querySelector('[class*="create-dialog"]');
      if (!dialog) return JSON.stringify({ duplicate: false });

      const text = dialog.innerText;
      const hasDuplicate = /已存在|重复|已录入|already exist/i.test(text);
      const match = text.match(/CU\\d{10,}/);
      const existingNumber = match ? match[0] : null;

      return JSON.stringify({ duplicate: hasDuplicate, existingNumber });
    })()
  `
}

function buildSubmitResultScript(): string {
  return `
    (function() {
      // 检查是否还有弹窗（弹窗关闭 = 提交成功）
      const dialog = document.querySelector('.el-dialog__wrapper') ||
                    document.querySelector('[class*="create-dialog"]');
      if (dialog && dialog.offsetParent !== null) {
        return JSON.stringify({ success: false, error: 'Dialog still open' });
      }

      // 检查是否有成功提示
      const toast = document.querySelector('.el-message--success') ||
                    document.querySelector('[class*="success"]');
      const errorToast = document.querySelector('.el-message--error') ||
                        document.querySelector('[class*="error"]');

      if (errorToast) {
        return JSON.stringify({ success: false, error: errorToast.textContent.trim() });
      }

      // 检查 URL 是否跳转到了详情页（包含 /detail/）
      const url = window.location.href;
      const detailMatch = url.match(/detail\\/([A-Z0-9]+)/);
      if (detailMatch) {
        return JSON.stringify({ success: true, customerNumber: detailMatch[1] });
      }

      return JSON.stringify({ success: true });
    })()
  `
}
