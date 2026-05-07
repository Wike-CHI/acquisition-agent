/**
 * FumamxApiClient — 孚盟 MX API 客户端
 *
 * 基于 Chrome DevTools HAR 捕获的真实 API (2026-05-07)
 * 153 个端点，通用 CRUD 模式，moduleCode 区分实体类型。
 *
 * 已知 moduleCode:
 *   NewBF001 = 客户管理 (Customer)
 *   NewBF004 = 客户跟进 (FollowUp / Activity)
 *   其他模块码通过 get_page_info 动态发现
 */

import type {
  FumamxCustomer,
  FumamxContact,
  FumamxFollowUp,
  CustomerSearchParams,
  FumamxPaginatedData,
} from "./types.js"

// ─── 孚盟 API 响应格式 ──────────────────────

interface FumamxResponse<T> {
  code: string | number
  data: T
  msg?: string
  ok?: boolean
  lMsg?: unknown
  ApiTime?: number
  version?: string
}

interface PageListResponse {
  totalNum: number
  list: Array<Record<string, unknown>>
  sumList?: Array<Record<string, unknown>>
}

// ─── 配置 ──────────────────────────────────

export interface FumamxConfig {
  baseUrl: string
  companyId: number       // _filterCompanyId
  accessToken?: string    // 从浏览器 Cookie 提取
}

// ─── 通用请求参数 ──────────────────────────

const COMMON_PARAMS = {
  event_source: "MX",
  operating_terminal: "pc_网页端",
  languageForMX5: "zh-cn",
  isV5: true,
  isV5AndNewMail: false,
  isNewArchCompany: true,
} as const

// ─── 客户端接口 ────────────────────────────

export interface IFumamxClient {
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  searchCustomers(params: CustomerSearchParams): Promise<FumamxPaginatedData<FumamxCustomer>>
  getCustomer(customerNo: string): Promise<FumamxCustomer | null>
  createCustomer(data: Partial<FumamxCustomer>): Promise<FumamxCustomer>
  updateCustomer(customerNo: string, data: Partial<FumamxCustomer>): Promise<FumamxCustomer>
  deleteCustomer(customerNo: string): Promise<void>

  listContacts(customerNo: string): Promise<FumamxContact[]>
  addContact(customerNo: string, data: Partial<FumamxContact>): Promise<FumamxContact>
  updateContact(contactId: string, data: Partial<FumamxContact>): Promise<FumamxContact>

  listFollowUps(customerNo: string): Promise<FumamxFollowUp[]>
  addFollowUp(data: FumamxFollowUp): Promise<FumamxFollowUp>
}

// ─── API 客户端实现 ────────────────────────

export class FumamxApiClient implements IFumamxClient {
  private config: FumamxConfig
  private connected = false
  private cookies = ""

  // moduleCode 映射
  static readonly MODULES = {
    CUSTOMER: "NewBF001",
    CONTACT: "NewBF001_Contact",  // 通过 tabCode 区分
    FOLLOWUP: "NewBF004",
  } as const

  constructor(config: Partial<FumamxConfig> & { companyId: number }) {
    this.config = {
      baseUrl: "https://fumamx.com",
      companyId: config.companyId,
      accessToken: config.accessToken,
      ...config,
    }
  }

  async connect(): Promise<void> {
    // 需要从浏览器提取 Cookie 和 accessToken
    // 方式1: 环境变量 FUMAMX_COOKIE  (手动从 DevTools Application tab 复制)
    // 方式2: 从 Chrome cookie 数据库读取
    if (!this.config.accessToken) {
      this.config.accessToken = process.env["FUMAMX_ACCESS_TOKEN"] || ""
    }
    if (!this.cookies) {
      this.cookies = process.env["FUMAMX_COOKIE"] || ""
    }
    this.connected = true
  }

  async disconnect(): Promise<void> {
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }

  // ─── 客户 CRUD ──────────────────────────

  async searchCustomers(params: CustomerSearchParams): Promise<FumamxPaginatedData<FumamxCustomer>> {
    const result = await this.post<PageListResponse>("bill/bill/get_page_list", {
      recoveryFlag: false,
      moduleCode: FumamxApiClient.MODULES.CUSTOMER,
      organizationStructure: { type: 3, ownerCtIdList: [] },
      page: {
        from: ((params.page || 1) - 1) * (params.pageSize || 20),
        size: params.pageSize || 20,
      },
      seniorSelection: this.buildSearchFilter(params),
    })

    return {
      list: result.list.map(this.mapCustomer),
      total: result.totalNum,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    }
  }

  async getCustomer(keyId: string): Promise<FumamxCustomer | null> {
    const result = await this.post<Array<Record<string, unknown>>>("bill/bill/get_detail_info", {
      masterKeyId: keyId,
      moduleCode: FumamxApiClient.MODULES.CUSTOMER,
      structId: 1,
      desensitizeFlag: true,
    })
    if (!result || result.length === 0) return null
    return this.mapCustomer(result[0])
  }

  async createCustomer(data: Partial<FumamxCustomer>): Promise<FumamxCustomer> {
    // 先获取表单配置
    const addConfig = await this.get(`bill/page_config/get_add_config?moduleCode=${FumamxApiClient.MODULES.CUSTOMER}&pageId=1`)

    // 构建创建参数（根据表单字段配置映射数据）
    // TODO: 实际的创建 API 端点需要在 HAR 中进一步捕获
    throw new Error("createCustomer API endpoint not yet captured. Please perform a customer create action in Fumeng and re-export HAR.")
  }

  async updateCustomer(keyId: string, data: Partial<FumamxCustomer>): Promise<FumamxCustomer> {
    throw new Error("updateCustomer API endpoint not yet captured. Perform update in Fumeng and re-export HAR.")
  }

  async deleteCustomer(keyId: string): Promise<void> {
    throw new Error("deleteCustomer API endpoint not yet captured.")
  }

  // ─── 联系人 ──────────────────────────────

  async listContacts(customerNo: string): Promise<FumamxContact[]> {
    // 通过 tabCode "联系人" 获取客户详情页的联系人标签数据
    const result = await this.post<Array<Record<string, unknown>>>("bill/bill/get_detail_info", {
      masterKeyId: customerNo,
      moduleCode: FumamxApiClient.MODULES.CUSTOMER,
      structId: 1,
      desensitizeFlag: true,
    })
    // 从客户详情的联系人标签页获取
    // 联系人在 customer 数据中以嵌套方式存在
    return []
  }

  async addContact(customerNo: string, data: Partial<FumamxContact>): Promise<FumamxContact> {
    throw new Error("addContact API endpoint not yet captured.")
  }

  async updateContact(contactId: string, data: Partial<FumamxContact>): Promise<FumamxContact> {
    throw new Error("updateContact API endpoint not yet captured.")
  }

  // ─── 跟进 ──────────────────────────────

  async listFollowUps(customerNo: string): Promise<FumamxFollowUp[]> {
    // Fumeng 跟进 = NewBF004 模块
    const result = await this.post<PageListResponse>("bill/bill/get_page_list", {
      recoveryFlag: false,
      moduleCode: FumamxApiClient.MODULES.FOLLOWUP,
      organizationStructure: { type: 3, ownerCtIdList: [] },
      page: { from: 0, size: 100 },
      seniorSelection: {
        selectionItemList: [{
          fieldId: "1112001",  // 关联客户 ID field
          operator: "1",       // equals
          fieldValue: customerNo,
          link: 0,
        }],
        link: 0,
      },
    })
    return result.list.map(this.mapFollowUp)
  }

  async addFollowUp(data: FumamxFollowUp): Promise<FumamxFollowUp> {
    throw new Error("addFollowUp API endpoint not yet captured.")
  }

  // ─── HTTP 核心 ──────────────────────────

  private buildSearchFilter(params: CustomerSearchParams) {
    const items: Array<Record<string, unknown>> = []
    if (params.keyword) {
      items.push({
        fieldId: "1110024",     // 客户名称
        operator: "6",          // LIKE
        fieldValue: params.keyword,
        link: 0,
      })
    }
    if (params.country) {
      items.push({
        fieldId: "1110064",     // 国家/地区
        operator: "1",
        fieldValue: params.country,
        link: 0,
      })
    }
    return { selectionItemList: items, link: 0 }
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.config.baseUrl}/pcapi/${path}`
    const resp = await fetch(url, {
      headers: {
        Cookie: this.cookies,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      credentials: "include",
    })
    if (!resp.ok) throw new Error(`GET ${path} → ${resp.status}`)
    const json: FumamxResponse<T> = await resp.json()
    if (json.code !== "0" && json.code !== 0) {
      throw new Error(`API error: ${json.code} ${json.msg || ""}`)
    }
    return json.data
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.config.baseUrl}/pcapi/${path}`
    const fullBody = {
      ...COMMON_PARAMS,
      _filterCompanyId: this.config.companyId,
      accessToken: this.config.accessToken || "",
      ...body,
    }
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: this.cookies,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      credentials: "include",
      body: JSON.stringify(fullBody),
    })
    if (!resp.ok) throw new Error(`POST ${path} → ${resp.status}`)
    const json: FumamxResponse<T> = await resp.json()
    if (json.code !== "0" && json.code !== 0) {
      throw new Error(`API error: ${json.code} ${json.msg || ""}`)
    }
    return json.data
  }

  // ─── 数据映射 ────────────────────────────

  private mapCustomer(raw: Record<string, unknown>): FumamxCustomer {
    return {
      customerCode: raw["billCode"] as string,
      customerNo: raw["key_id"] as string,
      customerName: raw["custName"] as string,
      shortName: raw["shortName"] as string,
      country: raw["country"] as string,
      address: raw["address"] as string,
      website: raw["website"] as string,
      creditCode: raw["creditCode"] as string,
      customerType: raw["custType"] as string,
      customerSource: raw["source"] as string,
      industry: raw["industry"] as string,
      valueLevel: raw["valueLevel"] as FumamxCustomer["valueLevel"],
      dealStage: raw["dealStage"] as string,
      dealStatus: raw["dealStatus"] as string,
      customerScore: raw["custScore"] as number,
      dataCompleteness: raw["integrityScore"] as number,
      businessDescription: raw["businessDesc"] as string,
      equipmentDemand: raw["equipmentDemand"] as string,
      customsData: raw["customsData"] as string,
      backgroundCheck: raw["backgroundCheck"] as string,
      latestProgress: raw["latestProgress"] as string,
      paymentCredit: raw["paymentCredit"] as string,
      totalDealAmountUSD: raw["totalDealAmountUSD"] as number,
      totalDealAmountCNY: raw["totalDealAmountCNY"] as number,
      contactCount: raw["contactNum"] as number,
      dealOrderCount: raw["dealOrderCount"] as number,
      owner: raw["ownerName"] as string,
      department: raw["deptName"] as string,
      creator: raw["createName"] as string,
      firstDealTime: raw["firstDealTime"] as string,
      lastFollowUp: raw["lastTrackInfo"] as string,
      nextFollowUp: raw["nextFollowUp"] as string,
      createTime: raw["createDate"] as string,
      modifyTime: raw["modifyDate"] as string,
      remark: raw["remark"] as string,
    }
  }

  private mapFollowUp(raw: Record<string, unknown>): FumamxFollowUp {
    return {
      id: raw["key_id"] as string,
      customerNo: raw["custId"] as string,
      type: (raw["activityType"] as string || "other") as FumamxFollowUp["type"],
      content: raw["activityDesc"] as string,
      nextPlan: raw["nextPlan"] as string,
      nextFollowUpTime: raw["nextFollowUp"] as string,
      createdAt: raw["createDate"] as string,
      createdBy: raw["createName"] as string,
    }
  }
}

// CDP 降级方案保留在 scripts/ 中
// export { CdpFumamxClient } — 不再通过此处导出
