/**
 * 孚盟MX CRM 客户查询自动化脚本
 * 基于 2026-04-24 实际 DOM 分析
 *
 * 查询流程:
 * 1. 检查登录状态
 * 2. 导航到客户列表页
 * 3. 输入搜索关键词
 * 4. 点击搜索
 * 5. 等待结果加载
 * 6. 提取客户数据
 * 7. (可选) 点击客户进入详情页获取更多信息
 */

import { URLS, CUSTOMER_LIST, CUSTOMER_DETAIL, PAGE_DETECTORS, WAIT_CONFIG } from './selectors'

// ─── 数据类型 ─────────────────────────────────────────

export interface CustomerListItem {
  customerCode: string
  customerName: string
  contactPerson: string
  region: string
  contactInfo: string
  source: string
  dealStatus: string
  createTime: string
}

export interface CustomerDetail {
  customerCode: string
  customerNumber: string
  customerName: string
  shortName: string
  country: string
  region: string
  address: string
  website: string
  mainContact: string
  customerSource: string
  dataCompleteness: number
  valueLevel: string
  dealStage: string
  owner: string
  department: string
  totalDealAmountUSD: number
  totalDealAmountCNY: number
  contactCount: number
  dealOrderCount: number
  firstDealTime: string
  lastFollowUp: string
  createTime: string
}

export interface QueryResult {
  success: boolean
  customers: CustomerListItem[]
  totalCount: number
  query: string
  timestamp: string
  error?: string
}

// ─── 查询动作定义 ─────────────────────────────────────

/**
 * 客户查询动作序列
 * 每个步骤通过 CDP bridge 执行
 */
export interface CdpAction {
  type: 'navigate' | 'click' | 'fill' | 'waitForSelector' | 'evaluate' | 'waitForNetworkIdle' | 'screenshot'
  selector?: string
  value?: string
  timeout?: number
  script?: string
}

/**
 * 生成客户查询的 CDP 动作序列
 */
export function buildQueryActions(query: string): CdpAction[] {
  return [
    // 1. 导航到客户列表页
    { type: 'navigate', value: URLS.CUSTOMER_LIST },
    { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },

    // 2. 等待搜索框出现
    {
      type: 'waitForSelector',
      selector: CUSTOMER_LIST.searchInput[0],
      timeout: WAIT_CONFIG.ELEMENT_TIMEOUT,
    },

    // 3. 填入搜索关键词
    { type: 'fill', selector: CUSTOMER_LIST.searchInput[0], value: query },

    // 4. 点击搜索按钮
    { type: 'click', selector: CUSTOMER_LIST.searchButton[0] },

    // 5. 等待搜索结果加载
    { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.SEARCH_RESULT },

    // 6. 截图 (用于调试和用户确认)
    { type: 'screenshot' },

    // 7. 提取客户列表数据
    {
      type: 'evaluate',
      script: buildExtractListScript(),
    },
  ]
}

/**
 * 生成客户详情提取的动作序列
 */
export function buildDetailActions(customerId: string): CdpAction[] {
  return [
    { type: 'navigate', value: URLS.CUSTOMER_DETAIL(customerId) },
    { type: 'waitForNetworkIdle', timeout: WAIT_CONFIG.ROUTE_CHANGE },
    { type: 'screenshot' },
    {
      type: 'evaluate',
      script: buildExtractDetailScript(),
    },
  ]
}

// ─── 数据提取脚本 ─────────────────────────────────────

/**
 * 从客户列表页提取数据的 JS 脚本
 */
function buildExtractListScript(): string {
  return `
    (function() {
      // 提取客户列表数据 (卡片式布局)
      const rows = document.querySelectorAll('.row--title__name.canJump');
      const customers = [];

      rows.forEach(row => {
        const card = row.closest('[class*="row"]');
        if (!card) return;

        const getText = (label) => {
          const el = card.querySelector('[class*="field"]') ||
                     card.parentElement;
          if (!el) return '-';
          // 在父级卡片中查找包含标签文本的元素
          const allText = el.querySelectorAll('[class*="field-content__text"], [class*="ellipsis"]');
          for (const t of allText) {
            if (t.textContent.trim()) return t.textContent.trim();
          }
          return '-';
        };

        customers.push({
          customerName: row.textContent.trim(),
        });
      });

      // 提取总数
      const pagination = document.querySelector('[class*="pagination"]');
      const totalMatch = pagination?.textContent?.match(/共\\s*(\\d+)\\s*条/);
      const totalCount = totalMatch ? parseInt(totalMatch[1]) : customers.length;

      return JSON.stringify({
        success: true,
        customers,
        totalCount,
        timestamp: new Date().toISOString(),
      });
    })()
  `
}

/**
 * 从客户详情页提取数据的 JS 脚本
 */
function buildExtractDetailScript(): string {
  return `
    (function() {
      const getField = (labelText) => {
        const labels = document.querySelectorAll('.field-label');
        for (const label of labels) {
          if (label.textContent.trim() === labelText) {
            const parent = label.parentElement;
            const content = parent?.querySelector('.field-content__text, .field-content');
            return content ? content.textContent.trim() : '';
          }
        }
        return '';
      };

      const getNumber = (labelText) => {
        const text = getField(labelText);
        const match = text.match(/([\\d,.]+)/);
        return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
      };

      const getPercent = (labelText) => {
        const text = getField(labelText);
        const match = text.match(/(\\d+)%/);
        return match ? parseInt(match[1]) : 0;
      };

      return JSON.stringify({
        customerCode: getField('客户代码'),
        customerNumber: getField('客户编号'),
        customerName: getField('客户名称'),
        shortName: getField('客户简称'),
        country: getField('国家/地区'),
        region: getField('区域'),
        address: getField('地址'),
        website: getField('网址'),
        mainContact: getField('主联系人和主联系方式'),
        customerSource: getField('客户来源'),
        dataCompleteness: getPercent('资料完整度'),
        valueLevel: getField('价值等级（S/A/B/C）'),
        dealStage: getField('成交阶段（帮助销售看"进攻方向"）'),
        owner: getField('所属人'),
        department: getField('所属部门'),
        totalDealAmountUSD: getNumber('成交金额（USD）'),
        totalDealAmountCNY: getNumber('成交金额（CNY）'),
        contactCount: getNumber('联系人数'),
        dealOrderCount: getNumber('成交订单数'),
        firstDealTime: getField('初次成交时间'),
        lastFollowUp: getField('最后跟进时间'),
        createTime: getField('创建时间'),
      });
    })()
  `
}
