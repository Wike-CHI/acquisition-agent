/**
 * 孚盟MX CRM 客户更新自动化脚本
 *
 * 更新流程:
 * 1. 导航到客户详情页
 * 2. 点击"修改"按钮打开编辑弹窗
 * 3. 填写需要更新的字段
 * 4. 截图预览
 * 5. 提交保存
 * 6. 验证结果
 */

import { URLS, CUSTOMER_UPDATE, WAIT_CONFIG } from './selectors'
import type { CdpAction } from './query-customer'

// ─── 数据类型 ─────────────────────────────────────────

export interface UpdateCustomerInput {
  customerId: string
  fields: {
    creditCode?: string
    shortName?: string
    address?: string
    remark?: string
    customsData?: string
  }
}

export interface UpdateCustomerResult {
  success: boolean
  customerId: string
  updatedFields: string[]
  error?: string
  timestamp: string
}

const DIALOG_CONTAINER = '.el-dialog__wrapper'

// ─── 可更新字段映射 ──────────────────────────────────

const EDITABLE_FIELDS: Record<string, readonly string[]> = {
  creditCode: CUSTOMER_UPDATE.creditCode,
  shortName: CUSTOMER_UPDATE.shortName,
  address: CUSTOMER_UPDATE.address,
  remark: CUSTOMER_UPDATE.remark,
  customsData: CUSTOMER_UPDATE.customsData,
}

/**
 * 生成预览动作序列 — 导航到详情页并打开编辑弹窗
 */
export function buildUpdatePreviewActions(input: UpdateCustomerInput): CdpAction[] {
  return [
    { type: 'navigate', value: URLS.CUSTOMER_DETAIL(input.customerId) },
    { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },
    { type: 'screenshot' },
    {
      type: 'waitForSelector',
      selector: CUSTOMER_UPDATE.editButton[0],
      timeout: WAIT_CONFIG.ELEMENT_TIMEOUT,
    },
    { type: 'click', selector: CUSTOMER_UPDATE.editButton[0] },
    { type: 'wait', value: WAIT_CONFIG.DIALOG_OPEN },
    { type: 'screenshot' },
  ]
}

/**
 * 生成字段更新的 CDP 动作序列
 * 在预览动作之后、用户确认后调用
 */
export function buildUpdateActions(input: UpdateCustomerInput): CdpAction[] {
  const actions: CdpAction[] = []
  const updatedFields: string[] = []

  for (const [fieldName, value] of Object.entries(input.fields)) {
    if (!value) continue
    const selectorChain = EDITABLE_FIELDS[fieldName]
    if (!selectorChain || !selectorChain[0]) continue

    actions.push({ type: 'fill', selector: selectorChain[0], value })
    updatedFields.push(fieldName)
  }

  // 如果没有需要更新的字段，只截图
  if (actions.length === 0) {
    actions.push({ type: 'screenshot' })
    return actions
  }

  // 截图确认填写内容
  actions.push({ type: 'screenshot' })

  // 提交
  actions.push({ type: 'click', selector: CUSTOMER_UPDATE.saveButton[0] })
  actions.push({ type: 'wait', value: 2000 })
  actions.push({ type: 'screenshot' })
  actions.push({
    type: 'evaluate',
    script: buildUpdateResultScript(updatedFields),
  })

  return actions
}

/**
 * 生成取消编辑的动作序列
 */
export function buildCancelUpdateActions(): CdpAction[] {
  return [
    { type: 'click', selector: CUSTOMER_UPDATE.cancelButton[0] },
    { type: 'wait', value: 500 },
    { type: 'screenshot' },
  ]
}

// ─── 检测脚本 ────────────────────────────────────────

function buildUpdateResultScript(updatedFields: string[]): string {
  return `
    (function() {
      // 检查弹窗是否关闭（关闭 = 保存成功）
      const dialog = document.querySelector('${DIALOG_CONTAINER}');
      const dialogVisible = dialog && dialog.offsetParent !== null;
      if (dialogVisible) {
        return JSON.stringify({ success: false, error: 'Dialog still open' });
      }

      // 检查成功/失败提示
      const toast = document.querySelector('.el-message--success');
      const errorToast = document.querySelector('.el-message--error');
      if (errorToast) {
        return JSON.stringify({ success: false, error: errorToast.textContent.trim() });
      }

      // 回读更新后的字段值来验证
      const fields = ${JSON.stringify(updatedFields)};
      const fieldLabels = {
        creditCode: '统一社会信用代码',
        shortName: '客户简称',
        address: '地址',
        remark: '备注信息',
        customsData: '海关数据背调',
      };

      const verified = {};
      for (const f of fields) {
        const label = fieldLabels[f];
        if (!label) continue;
        const el = document.querySelectorAll('.field-label');
        for (const e of el) {
          if (e.textContent.trim() === label) {
            const content = e.parentElement?.querySelector('.field-content__text');
            verified[f] = content ? content.textContent.trim() : '';
            break;
          }
        }
      }

      return JSON.stringify({ success: true, verified });
    })()
  `
}
