/**
 * 孚盟 MX 实体类型定义
 * 基于 selectors.ts 中映射的 50+ 数据字段
 * 以及实际 API 交互中补充的类型
 */

// ─── 基础类型 ──────────────────────────

export interface FumamxConfig {
  baseUrl: string
  cdpPort: number
  sessionCookie?: string
}

// ─── 客户 ──────────────────────────────

export interface FumamxCustomer {
  customerCode: string          // 客户代码
  customerNo: string            // 客户编号 (CU2604240002)
  customerName: string          // 客户名称
  shortName?: string            // 客户简称
  country?: string              // 国家/地区
  region?: string               // 区域
  province?: string
  city?: string
  district?: string
  address?: string
  website?: string
  creditCode?: string           // 统一社会信用代码
  customerType?: string         // 客户类型
  customerSource?: string       // 客户来源
  industry?: string             // 行业/应用场景

  // 评分与状态
  valueLevel?: 'S' | 'A' | 'B' | 'C'  // 价值等级
  dealStage?: string            // 成交阶段
  dealStatus?: string           // 成交状态
  customerScore?: number        // 客户评分
  dataCompleteness?: number     // 资料完整度(%)

  // 业务数据
  businessDescription?: string  // 业务描述与产品线
  equipmentDemand?: string      // 设备需求背调
  customsData?: string          // 海关数据背调
  backgroundCheck?: string      // 背调描述
  latestProgress?: string       // 最新进度描述
  paymentCredit?: string        // 付款与信用

  // 金额统计
  totalDealAmountUSD?: number
  totalDealAmountCNY?: number
  contactCount?: number
  dealOrderCount?: number

  // 归属
  owner?: string
  department?: string
  creator?: string
  branchAgent?: string

  // 时间
  firstDealTime?: string
  lastFollowUp?: string
  nextFollowUp?: string
  publicSeaDeadline?: string
  createTime?: string
  modifyTime?: string

  // 标签
  tags?: string[]
  remark?: string
}

export interface CustomerSearchParams {
  keyword?: string              // 公司名/联系人
  country?: string
  region?: string
  source?: string
  dealStatus?: string
  valueLevel?: string
  owner?: string
  page?: number
  pageSize?: number
}

// ─── 联系人 ────────────────────────────

export interface FumamxContact {
  id?: string
  customerNo: string
  name: string
  nickname?: string            // WeChat昵称
  gender?: string
  birthday?: string
  department?: string
  position?: string
  decisionRole?: string        // 决策角色
  workStatus?: string
  email?: string
  phone?: string
  mobile?: string
  whatsapp?: string
  wechat?: string
  landline?: string
  intimacy?: string            // 亲密度
  personalityType?: string     // 性格类型
  religion?: string
  tags?: string[]
  marketingFeedback?: string   // 营销反馈
  owner?: string
  lastFollowUp?: string
}

// ─── 跟进记录 ──────────────────────────

export interface FumamxFollowUp {
  id?: string
  customerNo: string
  contactId?: string
  type: 'visit' | 'call' | 'email' | 'message' | 'meeting' | 'other'
  content: string
  nextPlan?: string
  nextFollowUpTime?: string
  attachments?: string[]
  createdAt?: string
  createdBy?: string
}

// ─── 报价单 ────────────────────────────

export interface FumamxQuotation {
  id?: string
  quotationNo: string          // 报价单编号
  customerNo: string
  subject: string              // 报价主题
  customerEmail?: string
  amount: number               // 报价金额
  currency: string             // 结算币种
  priceTerm?: string           // 价格条款 (FOB/CIF/EXW)
  quotationDate?: string
  status?: string              // 单据状态
  salesRep?: string            // 业务员
  tags?: string[]
  notes?: string
  country?: string
  owner?: string
  department?: string
  items?: FumamxQuotationItem[]
  createdAt?: string
}

export interface FumamxQuotationItem {
  productName: string
  model: string
  description?: string
  qty: number
  unitPrice: number
  totalPrice: number
}

// ─── 销售订单 ──────────────────────────

export interface FumamxSalesOrder {
  id?: string
  orderNo: string
  quotationNo?: string
  customerNo: string
  amount: number
  currency: string
  status?: string
  orderDate?: string
  deliveryDate?: string
  salesRep?: string
  items?: FumamxQuotationItem[]
  createdAt?: string
}

// ─── 邮件 ──────────────────────────────

export interface FumamxEmail {
  id?: string
  customerNo?: string
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  bodyType?: 'html' | 'text'
  attachments?: string[]
  status?: 'draft' | 'sent' | 'failed'
  sentAt?: string
}

// ─── 培育 ──────────────────────────────

export interface FumamxNurture {
  id?: string
  customerNo: string
  templateName?: string
  status?: 'active' | 'paused' | 'completed'
  startDate?: string
  nextActionDate?: string
  steps?: FumamxNurtureStep[]
}

export interface FumamxNurtureStep {
  name: string
  type: 'email' | 'call' | 'message'
  scheduledDays: number
  status: 'pending' | 'done' | 'skipped'
  completedAt?: string
}

// ─── 任务 ──────────────────────────────

export interface FumamxTask {
  id?: string
  customerNo?: string
  title: string
  type?: string
  priority?: 'high' | 'medium' | 'low'
  status?: 'pending' | 'done' | 'overdue'
  dueDate?: string
  doneAt?: string
  createdAt?: string
}

// ─── 统计 ──────────────────────────────

export interface FumamxStats {
  totalCustomers?: number
  totalQuotations?: number
  totalOrders?: number
  totalDealAmount?: number
  monthlyNewCustomers?: number
  monthlyQuotations?: number
  monthlyOrders?: number
  monthlyDealAmount?: number
}

// ─── API 响应 ──────────────────────────

export interface FumamxApiResponse<T> {
  code: number
  data: T
  msg?: string
  success?: boolean
}

export interface FumamxPaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
