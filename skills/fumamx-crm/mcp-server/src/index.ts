/**
 * 孚盟 MX MCP Server
 *
 * 提供 25 个 MCP 工具，覆盖孚盟 10 大模块。
 * Agent 可通过结构化工具调用替代 CDP 浏览器自动化。
 *
 * 启动: node dist/index.js
 * 配置: 环境变量 FUNAMX_SESSION_COOKIE / FUNAMX_BASE_URL
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

import type { IFumamxClient } from "./client.js"
import {
  CdpFumamxClient,
  ApiFumamxClient,
} from "./client.js"
import type {
  FumamxCustomer,
  FumamxContact,
  FumamxFollowUp,
  FumamxQuotation,
  FumamxSalesOrder,
  FumamxEmail,
  FumamxTask,
} from "./types.js"

// ─── 配置 ─────────────────────────────────

const USE_API = process.env.FUMAMX_USE_API === "true"
const CDP_PORT = parseInt(process.env.FUMAMX_CDP_PORT || "9222", 10)
const BASE_URL = process.env.FUMAMX_BASE_URL || "https://fumamx.com"

// ─── 客户端工厂 ───────────────────────────

let client: IFumamxClient

if (USE_API) {
  client = new ApiFumamxClient({ baseUrl: BASE_URL, cdpPort: CDP_PORT })
} else {
  client = new CdpFumamxClient({ baseUrl: BASE_URL, cdpPort: CDP_PORT })
}

// ─── MCP Server ──────────────────────────

const server = new McpServer({
  name: "fumamx-mcp",
  version: "1.0.0",
  description: "孚盟MX CRM 操作工具集 — 客户管理、报价单、销售订单、邮件、培育、跟进、公海、任务、统计",
})

// ═══════════════════════════════════════════
// 客户管理 (6 tools)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_search_customers",
  {
    title: "搜索客户",
    description: "按公司名、国家、地区、来源、成交状态等条件搜索孚盟客户",
    inputSchema: {
      keyword: z.string().optional().describe("搜索关键词（公司名/联系人）"),
      country: z.string().optional().describe("国家/地区"),
      region: z.string().optional().describe("区域"),
      source: z.string().optional().describe("客户来源"),
      dealStatus: z.string().optional().describe("成交状态"),
      valueLevel: z.enum(["S", "A", "B", "C"]).optional().describe("价值等级"),
      page: z.number().optional().default(1).describe("页码"),
      pageSize: z.number().optional().default(20).describe("每页数量"),
    },
  },
  async (params) => {
    const result = await client.searchCustomers(params)
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    }
  },
)

server.registerTool(
  "fumamx_get_customer",
  {
    title: "查看客户详情",
    description: "根据客户编号获取客户完整信息，含评分、背调、跟进记录等",
    inputSchema: {
      customerNo: z.string().describe("客户编号，如 CU2604240002"),
    },
  },
  async ({ customerNo }) => {
    const customer = await client.getCustomer(customerNo)
    if (!customer) return { content: [{ type: "text", text: `客户 ${customerNo} 不存在` }] }
    return {
      content: [{ type: "text", text: JSON.stringify(customer, null, 2) }],
    }
  },
)

server.registerTool(
  "fumamx_create_customer",
  {
    title: "创建客户",
    description: "在孚盟中创建新客户记录。至少提供公司名和邮箱",
    inputSchema: {
      customerName: z.string().describe("客户公司名称"),
      country: z.string().optional().describe("国家/地区"),
      email: z.string().email().optional().describe("联系人邮箱"),
      phone: z.string().optional().describe("联系人手机"),
      shortName: z.string().optional().describe("客户简称"),
      address: z.string().optional().describe("地址"),
      website: z.string().optional().describe("网址"),
      industry: z.string().optional().describe("行业"),
      customerSource: z.string().optional().describe("客户来源"),
      remark: z.string().optional().describe("备注"),
      customsData: z.string().optional().describe("海关数据背调"),
    },
  },
  async (data) => {
    const customer = await client.createCustomer(data)
    return {
      content: [{ type: "text", text: `客户已创建: ${JSON.stringify(customer, null, 2)}` }],
    }
  },
)

server.registerTool(
  "fumamx_update_customer",
  {
    title: "更新客户信息",
    description: "更新孚盟中已有客户的字段信息",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
      customerName: z.string().optional(),
      shortName: z.string().optional(),
      country: z.string().optional(),
      address: z.string().optional(),
      website: z.string().optional(),
      industry: z.string().optional(),
      remark: z.string().optional(),
      customsData: z.string().optional(),
      latestProgress: z.string().optional().describe("最新进度描述"),
      nextFollowUp: z.string().optional().describe("下次跟进时间"),
    },
  },
  async ({ customerNo, ...data }) => {
    const customer = await client.updateCustomer(customerNo, data)
    return {
      content: [{ type: "text", text: `客户已更新: ${JSON.stringify(customer, null, 2)}` }],
    }
  },
)

server.registerTool(
  "fumamx_delete_customer",
  {
    title: "删除客户（放入回收站）",
    description: "将客户移入孚盟回收站。需要管理员权限",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
    },
  },
  async ({ customerNo }) => {
    await client.deleteCustomer(customerNo)
    return {
      content: [{ type: "text", text: `客户 ${customerNo} 已移入回收站` }],
    }
  },
)

server.registerTool(
  "fumamx_check_duplicate",
  {
    title: "客户查重",
    description: "检查孚盟中是否存在重复客户（按公司名/邮箱）",
    inputSchema: {
      keyword: z.string().describe("公司名或邮箱"),
    },
  },
  async ({ keyword }) => {
    const result = await client.searchCustomers({ keyword, pageSize: 5 })
    const dupes = result.list.filter(
      (c) =>
        c.customerName?.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.includes("@")
    )
    return {
      content: [
        {
          type: "text",
          text: dupes.length > 0
            ? `发现 ${dupes.length} 个可能重复的客户:\n${JSON.stringify(dupes, null, 2)}`
            : `未发现重复`,
        },
      ],
    }
  },
)

// ═══════════════════════════════════════════
// 联系人 (3 tools)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_list_contacts",
  {
    title: "查看联系人列表",
    description: "获取指定客户的所有联系人",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
    },
  },
  async ({ customerNo }) => {
    const contacts = await client.listContacts(customerNo)
    return {
      content: [{ type: "text", text: JSON.stringify(contacts, null, 2) }],
    }
  },
)

server.registerTool(
  "fumamx_add_contact",
  {
    title: "新增联系人",
    description: "为客户添加新联系人",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
      name: z.string().describe("联系人姓名"),
      email: z.string().email().optional().describe("邮箱"),
      phone: z.string().optional().describe("手机"),
      mobile: z.string().optional().describe("手机号"),
      position: z.string().optional().describe("职位"),
      department: z.string().optional().describe("部门"),
      decisionRole: z.string().optional().describe("决策角色"),
      whatsapp: z.string().optional(),
      wechat: z.string().optional(),
      gender: z.string().optional(),
      tags: z.string().optional().describe("标签,逗号分隔"),
    },
  },
  async (data) => {
    const contact = await client.addContact(data.customerNo, data)
    return {
      content: [{ type: "text", text: `联系人已添加: ${JSON.stringify(contact, null, 2)}` }],
    }
  },
)

server.registerTool(
  "fumamx_update_contact",
  {
    title: "更新联系人",
    description: "更新联系人信息",
    inputSchema: {
      contactId: z.string().describe("联系人ID"),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      position: z.string().optional(),
      decisionRole: z.string().optional(),
      whatsapp: z.string().optional(),
      wechat: z.string().optional(),
      tags: z.string().optional(),
    },
  },
  async ({ contactId, ...data }) => {
    const contact = await client.updateContact(contactId, data)
    return {
      content: [{ type: "text", text: `联系人已更新: ${JSON.stringify(contact, null, 2)}` }],
    }
  },
)

// ═══════════════════════════════════════════
// 跟进记录 (2 tools)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_list_followups",
  {
    title: "查看跟进记录",
    description: "获取客户的跟进历史",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
    },
  },
  async ({ customerNo }) => {
    const followUps = await client.listFollowUps(customerNo)
    return {
      content: [{ type: "text", text: JSON.stringify(followUps, null, 2) }],
    }
  },
)

server.registerTool(
  "fumamx_add_followup",
  {
    title: "添加跟进记录",
    description: "为客户添加一条跟进记录",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
      type: z.enum(["visit", "call", "email", "message", "meeting", "other"]).describe("跟进方式"),
      content: z.string().describe("跟进内容"),
      nextPlan: z.string().optional().describe("下一步计划"),
      nextFollowUpTime: z.string().optional().describe("下次跟进时间 (ISO 8601)"),
    },
  },
  async (data) => {
    const followUp = await client.addFollowUp(data as FumamxFollowUp)
    return {
      content: [{ type: "text", text: `跟进记录已添加: ${JSON.stringify(followUp, null, 2)}` }],
    }
  },
)

// ═══════════════════════════════════════════
// 报价单 (2 tools)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_list_quotations",
  {
    title: "查看报价单",
    description: "获取客户的报价单列表",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
    },
  },
  async ({ customerNo }) => {
    const quotations = await client.listQuotations(customerNo)
    return {
      content: [{ type: "text", text: JSON.stringify(quotations, null, 2) }],
    }
  },
)

server.registerTool(
  "fumamx_create_quotation",
  {
    title: "新建报价单",
    description: "在孚盟中为客户创建报价单",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
      subject: z.string().describe("报价主题"),
      customerEmail: z.string().email().optional().describe("客户邮箱"),
      amount: z.number().positive().describe("报价总金额"),
      currency: z.string().default("CNY").describe("币种"),
      priceTerm: z.enum(["FOB", "CIF", "EXW", "CFR"]).default("FOB").describe("价格条款"),
      notes: z.string().optional().describe("备注"),
      items: z.array(z.object({
        productName: z.string(),
        model: z.string(),
        qty: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })).optional().describe("产品明细"),
    },
  },
  async (data) => {
    const quotation = await client.createQuotation(data)
    return {
      content: [{ type: "text", text: `报价单已创建: ${JSON.stringify(quotation, null, 2)}` }],
    }
  },
)

// ═══════════════════════════════════════════
// 销售订单 (2 tools)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_list_orders",
  {
    title: "查看销售订单",
    description: "获取客户的销售订单列表",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
    },
  },
  async ({ customerNo }) => {
    const orders = await client.listOrders(customerNo)
    return {
      content: [{ type: "text", text: JSON.stringify(orders, null, 2) }],
    }
  },
)

server.registerTool(
  "fumamx_create_order",
  {
    title: "新建销售订单",
    description: "在孚盟中创建销售订单",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
      quotationNo: z.string().optional().describe("关联报价单号"),
      amount: z.number().positive().describe("订单金额"),
      currency: z.string().default("CNY").describe("币种"),
      deliveryDate: z.string().optional().describe("交货日期"),
      items: z.array(z.object({
        productName: z.string(),
        model: z.string(),
        qty: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })).optional(),
    },
  },
  async (data) => {
    const order = await client.createOrder(data)
    return {
      content: [{ type: "text", text: `销售订单已创建: ${JSON.stringify(order, null, 2)}` }],
    }
  },
)

// ═══════════════════════════════════════════
// 邮件 (2 tools)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_send_email",
  {
    title: "发送邮件",
    description: "通过孚盟发送邮件给客户",
    inputSchema: {
      to: z.string().email().describe("收件人邮箱"),
      subject: z.string().describe("邮件主题"),
      body: z.string().describe("邮件正文 (支持HTML)"),
      cc: z.string().optional().describe("抄送,逗号分隔"),
      customerNo: z.string().optional().describe("关联客户编号"),
      bodyType: z.enum(["html", "text"]).default("html").describe("正文格式"),
    },
  },
  async (data) => {
    const email = await client.sendEmail(data as FumamxEmail)
    return {
      content: [{ type: "text", text: `邮件已发送: ${JSON.stringify(email, null, 2)}` }],
    }
  },
)

server.registerTool(
  "fumamx_check_inbox",
  {
    title: "检查收件箱",
    description: "查看孚盟关联邮箱的收件箱",
    inputSchema: {},
  },
  async () => {
    const emails = await client.checkInbox()
    return {
      content: [{ type: "text", text: JSON.stringify(emails, null, 2) }],
    }
  },
)

// ═══════════════════════════════════════════
// 培育 (2 tools)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_add_to_nurture",
  {
    title: "加入培育序列",
    description: "将客户添加到培育流程",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
      templateName: z.string().optional().describe("培育模板名称"),
    },
  },
  async ({ customerNo, templateName }) => {
    const nurture = await client.addToNurture(customerNo, templateName)
    return {
      content: [{ type: "text", text: `客户 ${customerNo} 已加入培育: ${JSON.stringify(nurture, null, 2)}` }],
    }
  },
)

server.registerTool(
  "fumamx_get_nurture_status",
  {
    title: "查看培育状态",
    description: "查看客户的培育进度",
    inputSchema: {
      customerNo: z.string().describe("客户编号"),
    },
  },
  async ({ customerNo }) => {
    const status = await client.getNurtureStatus(customerNo)
    if (!status) return { content: [{ type: "text", text: `客户 ${customerNo} 未在培育流程中` }] }
    return {
      content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
    }
  },
)

// ═══════════════════════════════════════════
// 公海 (1 tool)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_claim_public_customer",
  {
    title: "领取公海客户",
    description: "从公海池领取客户到个人库",
    inputSchema: {
      customerNo: z.string().describe("公海客户编号"),
    },
  },
  async ({ customerNo }) => {
    await client.claimPublicCustomer(customerNo)
    return {
      content: [{ type: "text", text: `已领取公海客户 ${customerNo}` }],
    }
  },
)

// ═══════════════════════════════════════════
// 任务 (2 tools)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_get_daily_tasks",
  {
    title: "查看今日任务",
    description: "获取孚盟中的今日待办任务列表",
    inputSchema: {},
  },
  async () => {
    const tasks = await client.getDailyTasks()
    return {
      content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
    }
  },
)

server.registerTool(
  "fumamx_complete_task",
  {
    title: "完成任务",
    description: "标记任务为已完成",
    inputSchema: {
      taskId: z.string().describe("任务ID"),
    },
  },
  async ({ taskId }) => {
    await client.completeTask(taskId)
    return {
      content: [{ type: "text", text: `任务 ${taskId} 已完成` }],
    }
  },
)

// ═══════════════════════════════════════════
// 统计 (1 tool)
// ═══════════════════════════════════════════

server.registerTool(
  "fumamx_get_stats",
  {
    title: "数据统计",
    description: "获取孚盟销售数据概览（客户数/报价数/订单数/成交金额）",
    inputSchema: {},
  },
  async () => {
    const stats = await client.getStats()
    return {
      content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
    }
  },
)

// ═══════════════════════════════════════════
// 启动
// ═══════════════════════════════════════════

async function main() {
  // 尝试连接
  try {
    await client.connect()
    console.error("[fumamx-mcp] 已连接到孚盟")
  } catch (err) {
    console.error("[fumamx-mcp] 连接失败:", err)
    console.error("[fumamx-mcp] 将以离线模式启动（需要浏览器中登录孚盟）")
  }

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("[fumamx-mcp] Server ready (23 tools registered)")
}

main().catch((err) => {
  console.error("[fumamx-mcp] Fatal:", err)
  process.exit(1)
})
