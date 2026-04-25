/**
 * Fumamx Update Skill — Shared Configuration
 *
 * Feature Flag: FUMAMX_ENABLE_UPDATE=true
 * 默认关闭，需在环境变量中设置后方可使用。
 */

export const FUMAMX_BASE_URL =
  process.env.FUMAMX_BASE_URL || 'https://fumamx.com';

/** 客户详情页 URL 模板 */
export const CUSTOMER_DETAIL_URL = (customerId: string) =>
  `${FUMAMX_BASE_URL}/#/main/newClient/NewBF001/detail/${customerId}`;

/** 客户列表页 URL */
export const CUSTOMER_LIST_URL = `${FUMAMX_BASE_URL}/#/main/newClient/NewBF001/list`;

/** CDP 操作超时（毫秒） */
export const CDP_TIMEOUT = {
  navigation: 20_000,
  elementVisible: 10_000,
  networkIdle: 15_000,
  confirmation: 8_000,
} as const;

/** Feature Flag 检查 */
export function isUpdateEnabled(): boolean {
  return process.env.FUMAMX_ENABLE_UPDATE === 'true';
}
