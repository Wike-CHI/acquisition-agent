---
name: fumamx-crm
version: 2.0.0
description: 孚盟MX CRM AI Agent 操作技能。B+C 双轨架构：MCP Server (23 tools) + CDP 浏览器自动化。覆盖客户/联系人/跟进/报价单/销售订单/邮件/培育/公海/任务/统计 10 大模块。
always: false
triggers:
  - 孚盟CRM
  - 添加到CRM
  - 搜索客户
  - 创建客户
  - 更新客户
  - 删除客户
  - 批量添加到CRM
  - 批量导出
  - 查重
  - 检查客户数据质量
  - 查看客户详情
  - 获取客户列表
  - 检查停滞客户
  - 跟进客户培育流程
  - 查看今日任务
  - 查看昨日邮件
  - 查看客户画像
  - 获取联系方式
  - 查看销售机会
  - 查看线索跟进状态
  - 查看数据统计报表
  - 查看线索详情
  - 添加跟进备注
  - 记录跟进历史
  - 孚盟报价
  - 孚盟订单
  - 孚盟邮件
  - 孚盟任务
---

## 架构 (v2.0 B+C)

```
Agent (holo-desktop)
  │
  ├─ MCP 工具调用 (首选) ──── fumamx-mcp-server ──── HTTP API ──── 孚盟后端
  │                          (23 tools, Zod schema)    (逆向中)
  │
  └─ CDP 浏览器自动化 (降级) ── Chrome CDP ── 孚盟 SPA 页面
                                (scripts/*.ts)
```

**B 路线 (API 逆向)**: `scripts/capture-api.py` 捕获孚盟内部 API → `ApiFumamxClient` 直调 HTTP
**C 路线 (MCP Server)**: `mcp-server/` 将 10 大模块封装为 23 个 MCP 结构化工具

### MCP Server 工具清单

启动: `cd mcp-server && npm start`

| # | 工具名 | 模块 | 操作 |
|---|--------|------|------|
| 1 | `fumamx_search_customers` | 客户 | 按条件搜索客户 |
| 2 | `fumamx_get_customer` | 客户 | 查看客户详情 |
| 3 | `fumamx_create_customer` | 客户 | 创建客户 |
| 4 | `fumamx_update_customer` | 客户 | 更新客户信息 |
| 5 | `fumamx_delete_customer` | 客户 | 删除客户（回收站） |
| 6 | `fumamx_check_duplicate` | 客户 | 客户查重 |
| 7 | `fumamx_list_contacts` | 联系人 | 查看联系人列表 |
| 8 | `fumamx_add_contact` | 联系人 | 新增联系人 |
| 9 | `fumamx_update_contact` | 联系人 | 更新联系人 |
| 10 | `fumamx_list_followups` | 跟进 | 查看跟进历史 |
| 11 | `fumamx_add_followup` | 跟进 | 添加跟进记录 |
| 12 | `fumamx_list_quotations` | 报价单 | 查看报价单列表 |
| 13 | `fumamx_create_quotation` | 报价单 | 新建报价单 |
| 14 | `fumamx_list_orders` | 销售订单 | 查看订单列表 |
| 15 | `fumamx_create_order` | 销售订单 | 新建销售订单 |
| 16 | `fumamx_send_email` | 邮件 | 发送邮件 |
| 17 | `fumamx_check_inbox` | 邮件 | 检查收件箱 |
| 18 | `fumamx_add_to_nurture` | 培育 | 加入培育序列 |
| 19 | `fumamx_get_nurture_status` | 培育 | 查看培育状态 |
| 20 | `fumamx_claim_public_customer` | 公海 | 领取公海客户 |
| 21 | `fumamx_get_daily_tasks` | 任务 | 查看今日任务 |
| 22 | `fumamx_complete_task` | 任务 | 完成任务 |
| 23 | `fumamx_get_stats` | 统计 | 销售数据概览 |

### API 逆向 (capture-api.py)

```bash
# 1. 启动 Chrome 远程调试

> **Skill Graph：** 领域 → [[_index-conversion|报价与转化领域]] | 上游 ← [[crm|通用CRM]] ← [[_index-conversion|转化领域]] | 下游 → [[fumamx-update|CRM客户更新]]

chrome.exe --remote-debugging-port=9222

# 2. 登录孚盟
# 打开 https://fumamx.com/#/login 并登录

# 3. 运行捕获脚本
cd scripts && python capture-api.py

# 4. 在 Chrome 中操作孚盟各个模块
# (查客户 → 建报价单 → 发邮件 → ...)

# 5. Ctrl+C 停止，输出 captured-apis.json
```

捕获的 API 端点用于填充 `ApiFumamxClient` 的端点路径，替换占位符 URL。

---

## CDP 降级路径 (v1.x 保留)

当 MCP Server 不可用或 API 端点未知时，降级使用 CDP 浏览器自动化:

| 脚本 | 功能 |
|------|------|
| `scripts/query-customer.ts` | 查询客户 |
| `scripts/create-customer.ts` | 创建客户 |
| `scripts/update-customer.ts` | 更新客户 |
| `scripts/batch-operations.ts` | 批量操作 |
| `scripts/add-to-nurture.ts` | 添加到培育 |
| `scripts/selectors.ts` | DOM 选择器配置 (Element Plus) |

### 安全策略
- 私人信息（手机号、邮箱、客户详情）永不在消息中暴露
- 每次CRM操作后记录操作日志
- 定期备份（每两周）
- 批量操作（>10条）需管理员审批

### 孚盟访问信息

| 配置项 | 值 |
|------|-----|
| **登录URL** | https://fumamx.com/#/login |
| **UI 框架** | Vue + Element Plus (el-*) |
| **路由模式** | SPA hash routing (/#/...) |
| **API 端点** | 待捕获 (运行 capture-api.py) |
