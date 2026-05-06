/**
 * FumamxApiClient — 孚盟 MX 操作客户端
 *
 * 提供统一接口，支持两种后端:
 *   - CdpBackend: 浏览器自动化 (CDP)，当前可用
 *   - ApiBackend:  直接 HTTP 调用，API 逆向完成后切换
 *
 * MCP Tools 面向该接口编程，切换后端无需修改工具层。
 */

import type {
  FumamxConfig,
  FumamxCustomer,
  FumamxContact,
  FumamxFollowUp,
  FumamxQuotation,
  FumamxSalesOrder,
  FumamxEmail,
  FumamxNurture,
  FumamxTask,
  FumamxStats,
  CustomerSearchParams,
  FumamxPaginatedData,
} from "./types.js"

// ─── 客户端接口 ─────────────────────────────────

export interface IFumamxClient {
  // 生命周期
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  // 客户管理
  searchCustomers(params: CustomerSearchParams): Promise<FumamxPaginatedData<FumamxCustomer>>
  getCustomer(customerNo: string): Promise<FumamxCustomer | null>
  createCustomer(data: Partial<FumamxCustomer>): Promise<FumamxCustomer>
  updateCustomer(customerNo: string, data: Partial<FumamxCustomer>): Promise<FumamxCustomer>
  deleteCustomer(customerNo: string): Promise<void>

  // 联系人
  listContacts(customerNo: string): Promise<FumamxContact[]>
  addContact(customerNo: string, data: Partial<FumamxContact>): Promise<FumamxContact>
  updateContact(contactId: string, data: Partial<FumamxContact>): Promise<FumamxContact>

  // 跟进
  listFollowUps(customerNo: string): Promise<FumamxFollowUp[]>
  addFollowUp(data: FumamxFollowUp): Promise<FumamxFollowUp>

  // 报价单
  listQuotations(customerNo: string): Promise<FumamxQuotation[]>
  createQuotation(data: Partial<FumamxQuotation>): Promise<FumamxQuotation>

  // 销售订单
  listOrders(customerNo: string): Promise<FumamxSalesOrder[]>
  createOrder(data: Partial<FumamxSalesOrder>): Promise<FumamxSalesOrder>

  // 邮件
  sendEmail(data: FumamxEmail): Promise<FumamxEmail>
  checkInbox(): Promise<FumamxEmail[]>

  // 培育
  addToNurture(customerNo: string, templateName?: string): Promise<FumamxNurture>
  getNurtureStatus(customerNo: string): Promise<FumamxNurture | null>

  // 任务
  getDailyTasks(): Promise<FumamxTask[]>
  completeTask(taskId: string): Promise<void>

  // 公海
  claimPublicCustomer(customerNo: string): Promise<void>

  // 统计
  getStats(): Promise<FumamxStats>
}

// ─── CDP 后端实现 ──────────────────────────────

export class CdpFumamxClient implements IFumamxClient {
  private config: FumamxConfig
  private connected = false

  constructor(config: FumamxConfig) {
    this.config = {
      baseUrl: "https://fumamx.com",
      cdpPort: 9222,
      ...config,
    }
  }

  async connect(): Promise<void> {
    // 通过 CDP 连接到已打开的孚盟标签页
    const wsUrl = await this.getFumamxTabWsUrl()
    if (!wsUrl) {
      throw new Error("未找到孚盟标签页，请先在 Chrome 中登录 https://fumamx.com")
    }
    this.connected = true
    // CDP WebSocket 连接由工具层按需管理
  }

  async disconnect(): Promise<void> {
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }

  // ─── 客户 ──────────────────────────────

  async searchCustomers(params: CustomerSearchParams): Promise<FumamxPaginatedData<FumamxCustomer>> {
    return this.cdpExecute("searchCustomers", params) as Promise<FumamxPaginatedData<FumamxCustomer>>
  }

  async getCustomer(customerNo: string): Promise<FumamxCustomer | null> {
    return this.cdpExecute("getCustomer", { customerNo }) as Promise<FumamxCustomer | null>
  }

  async createCustomer(data: Partial<FumamxCustomer>): Promise<FumamxCustomer> {
    return this.cdpExecute("createCustomer", data) as Promise<FumamxCustomer>
  }

  async updateCustomer(customerNo: string, data: Partial<FumamxCustomer>): Promise<FumamxCustomer> {
    return this.cdpExecute("updateCustomer", { customerNo, ...data }) as Promise<FumamxCustomer>
  }

  async deleteCustomer(customerNo: string): Promise<void> {
    return this.cdpExecute("deleteCustomer", { customerNo }) as Promise<void>
  }

  // ─── 联系人 ──────────────────────────────

  async listContacts(customerNo: string): Promise<FumamxContact[]> {
    return this.cdpExecute("listContacts", { customerNo }) as Promise<FumamxContact[]>
  }

  async addContact(customerNo: string, data: Partial<FumamxContact>): Promise<FumamxContact> {
    return this.cdpExecute("addContact", { customerNo, ...data }) as Promise<FumamxContact>
  }

  async updateContact(contactId: string, data: Partial<FumamxContact>): Promise<FumamxContact> {
    return this.cdpExecute("updateContact", { contactId, ...data }) as Promise<FumamxContact>
  }

  // ─── 跟进 ──────────────────────────────

  async listFollowUps(customerNo: string): Promise<FumamxFollowUp[]> {
    return this.cdpExecute("listFollowUps", { customerNo }) as Promise<FumamxFollowUp[]>
  }

  async addFollowUp(data: FumamxFollowUp): Promise<FumamxFollowUp> {
    return this.cdpExecute("addFollowUp", data) as Promise<FumamxFollowUp>
  }

  // ─── 报价单 ──────────────────────────────

  async listQuotations(customerNo: string): Promise<FumamxQuotation[]> {
    return this.cdpExecute("listQuotations", { customerNo }) as Promise<FumamxQuotation[]>
  }

  async createQuotation(data: Partial<FumamxQuotation>): Promise<FumamxQuotation> {
    return this.cdpExecute("createQuotation", data) as Promise<FumamxQuotation>
  }

  // ─── 销售订单 ──────────────────────────────

  async listOrders(customerNo: string): Promise<FumamxSalesOrder[]> {
    return this.cdpExecute("listOrders", { customerNo }) as Promise<FumamxSalesOrder[]>
  }

  async createOrder(data: Partial<FumamxSalesOrder>): Promise<FumamxSalesOrder> {
    return this.cdpExecute("createOrder", data) as Promise<FumamxSalesOrder>
  }

  // ─── 邮件 ──────────────────────────────

  async sendEmail(data: FumamxEmail): Promise<FumamxEmail> {
    return this.cdpExecute("sendEmail", data) as Promise<FumamxEmail>
  }

  async checkInbox(): Promise<FumamxEmail[]> {
    return this.cdpExecute("checkInbox", {}) as Promise<FumamxEmail[]>
  }

  // ─── 培育 ──────────────────────────────

  async addToNurture(customerNo: string, templateName?: string): Promise<FumamxNurture> {
    return this.cdpExecute("addToNurture", { customerNo, templateName }) as Promise<FumamxNurture>
  }

  async getNurtureStatus(customerNo: string): Promise<FumamxNurture | null> {
    return this.cdpExecute("getNurtureStatus", { customerNo }) as Promise<FumamxNurture | null>
  }

  // ─── 任务 ──────────────────────────────

  async getDailyTasks(): Promise<FumamxTask[]> {
    return this.cdpExecute("getDailyTasks", {}) as Promise<FumamxTask[]>
  }

  async completeTask(taskId: string): Promise<void> {
    return this.cdpExecute("completeTask", { taskId }) as Promise<void>
  }

  // ─── 公海 ──────────────────────────────

  async claimPublicCustomer(customerNo: string): Promise<void> {
    return this.cdpExecute("claimPublicCustomer", { customerNo }) as Promise<void>
  }

  // ─── 统计 ──────────────────────────────

  async getStats(): Promise<FumamxStats> {
    return this.cdpExecute("getStats", {}) as Promise<FumamxStats>
  }

  // ─── CDP 核心 ──────────────────────────

  private async getFumamxTabWsUrl(): Promise<string | null> {
    try {
      const resp = await fetch(`http://127.0.0.1:${this.config.cdpPort}/json`)
      const tabs: Array<{ url: string; webSocketDebuggerUrl: string }> = await resp.json()
      const fumamx = tabs.find((t) => t.url.includes("fumamx.com"))
      return fumamx?.webSocketDebuggerUrl ?? null
    } catch {
      return null
    }
  }

  /**
   * 通过 CDP 执行操作。
   * 当前版本: 使用现有的 CDP 动作序列脚本 (scripts/*.ts)
   * 升级路径: 替换为 HTTP fetch 调用孚盟内部 API
   */
  private async cdpExecute(action: string, params: unknown): Promise<unknown> {
    // 委托给 holo-desktop 的 CDP 执行器
    // 在 Electron 环境中通过 IPC 调用，在独立 MCP Server 中通过 WebSocket 直连
    throw new Error(
      `CDP action "${action}" requires holo-desktop runtime integration. ` +
      `Params: ${JSON.stringify(params)}`
    )
  }
}

// ─── HTTP API 后端实现（API 逆向完成后启用）───

export class ApiFumamxClient implements IFumamxClient {
  private config: FumamxConfig
  private connected = false
  private authHeaders: Record<string, string> = {}

  constructor(config: FumamxConfig) {
    this.config = {
      baseUrl: "https://fumamx.com",
      cdpPort: 9222,
      ...config,
    }
  }

  async connect(): Promise<void> {
    // 从浏览器提取 session cookie → authHeaders
    this.connected = true
  }

  async disconnect(): Promise<void> {
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }

  // 各方法通过 HTTP fetch 调用孚盟内部 API
  // 端点列表由 capture-api.py 捕获后填充

  async searchCustomers(params: CustomerSearchParams): Promise<FumamxPaginatedData<FumamxCustomer>> {
    const qs = new URLSearchParams()
    if (params.keyword) qs.set("keyword", params.keyword)
    if (params.country) qs.set("country", params.country)
    if (params.page) qs.set("page", String(params.page))
    if (params.pageSize) qs.set("pageSize", String(params.pageSize))
    return this.get(`/api/client/list?${qs}`)
  }

  async getCustomer(customerNo: string): Promise<FumamxCustomer | null> {
    return this.get(`/api/client/detail/${customerNo}`)
  }

  async createCustomer(data: Partial<FumamxCustomer>): Promise<FumamxCustomer> {
    return this.post("/api/client/create", data)
  }

  async updateCustomer(customerNo: string, data: Partial<FumamxCustomer>): Promise<FumamxCustomer> {
    return this.post(`/api/client/update/${customerNo}`, data)
  }

  async deleteCustomer(customerNo: string): Promise<void> {
    return this.post(`/api/client/delete/${customerNo}`, {})
  }

  async listContacts(customerNo: string): Promise<FumamxContact[]> {
    return this.get(`/api/contact/list/${customerNo}`)
  }

  async addContact(customerNo: string, data: Partial<FumamxContact>): Promise<FumamxContact> {
    return this.post(`/api/contact/create`, { customerNo, ...data })
  }

  async updateContact(contactId: string, data: Partial<FumamxContact>): Promise<FumamxContact> {
    return this.post(`/api/contact/update/${contactId}`, data)
  }

  async listFollowUps(customerNo: string): Promise<FumamxFollowUp[]> {
    return this.get(`/api/followup/list/${customerNo}`)
  }

  async addFollowUp(data: FumamxFollowUp): Promise<FumamxFollowUp> {
    return this.post("/api/followup/create", data)
  }

  async listQuotations(customerNo: string): Promise<FumamxQuotation[]> {
    return this.get(`/api/quotation/list/${customerNo}`)
  }

  async createQuotation(data: Partial<FumamxQuotation>): Promise<FumamxQuotation> {
    return this.post("/api/quotation/create", data)
  }

  async listOrders(customerNo: string): Promise<FumamxSalesOrder[]> {
    return this.get(`/api/order/list/${customerNo}`)
  }

  async createOrder(data: Partial<FumamxSalesOrder>): Promise<FumamxSalesOrder> {
    return this.post("/api/order/create", data)
  }

  async sendEmail(data: FumamxEmail): Promise<FumamxEmail> {
    return this.post("/api/email/send", data)
  }

  async checkInbox(): Promise<FumamxEmail[]> {
    return this.get("/api/email/inbox")
  }

  async addToNurture(customerNo: string, templateName?: string): Promise<FumamxNurture> {
    return this.post("/api/nurture/add", { customerNo, templateName })
  }

  async getNurtureStatus(customerNo: string): Promise<FumamxNurture | null> {
    return this.get(`/api/nurture/status/${customerNo}`)
  }

  async getDailyTasks(): Promise<FumamxTask[]> {
    return this.get("/api/task/daily")
  }

  async completeTask(taskId: string): Promise<void> {
    return this.post(`/api/task/complete/${taskId}`, {})
  }

  async claimPublicCustomer(customerNo: string): Promise<void> {
    return this.post(`/api/public/claim/${customerNo}`, {})
  }

  async getStats(): Promise<FumamxStats> {
    return this.get("/api/stats/overview")
  }

  // ─── HTTP 辅助 ──────────────────────────

  private async get<T>(path: string): Promise<T> {
    const resp = await fetch(`${this.config.baseUrl}${path}`, {
      headers: { ...this.authHeaders, "Content-Type": "application/json" },
      credentials: "include",
    })
    if (!resp.ok) throw new Error(`GET ${path} → ${resp.status}`)
    return resp.json()
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const resp = await fetch(`${this.config.baseUrl}${path}`, {
      method: "POST",
      headers: { ...this.authHeaders, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
    if (!resp.ok) throw new Error(`POST ${path} → ${resp.status}`)
    return resp.json()
  }
}
