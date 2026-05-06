# fumamx-mcp-server

孚盟 MX CRM 的 MCP Server，将孚盟 10 大模块封装为 23 个结构化 AI Agent 工具。

## 快速开始

```bash
cd mcp-server
npm install
npm run build
npm start
```

## 架构

```
┌─ AI Agent (holo-desktop / Claude) ─┐
│  调用 MCP tools:                    │
│  fumamx_search_customers(...)       │
│  fumamx_create_quotation(...)       │
│  fumamx_send_email(...)             │
└─────────────┬───────────────────────┘
              │ MCP Protocol (stdio)
┌─────────────▼───────────────────────┐
│  fumamx-mcp-server                  │
│  ├─ index.ts   (23 tools, Zod)      │
│  └─ client.ts  (双后端)             │
│       ├─ ApiFumamxClient  (直调API) │
│       └─ CdpFumamxClient (浏览器)   │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
 HTTP fetch        Chrome CDP
 (API 逆向完成后)   (当前可用)
```

## 配置

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `FUMAMX_USE_API` | `false` | `true`=直调API / `false`=CDP浏览器 |
| `FUMAMX_CDP_PORT` | `9222` | Chrome 远程调试端口 |
| `FUMAMX_BASE_URL` | `https://fumamx.com` | 孚盟地址 |

## 工具全览 (23 tools)

### 客户管理 (6)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_search_customers` | keyword, country, valueLevel, page... | 客户列表 |
| `fumamx_get_customer` | customerNo | 客户详情 |
| `fumamx_create_customer` | customerName, country, email... | 新客户 |
| `fumamx_update_customer` | customerNo + 待更新字段 | 更新后客户 |
| `fumamx_delete_customer` | customerNo | void |
| `fumamx_check_duplicate` | keyword | 重复客户列表 |

### 联系人 (3)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_list_contacts` | customerNo | 联系人列表 |
| `fumamx_add_contact` | customerNo, name, email, phone... | 新联系人 |
| `fumamx_update_contact` | contactId + 待更新字段 | 更新后联系人 |

### 跟进 (2)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_list_followups` | customerNo | 跟进历史 |
| `fumamx_add_followup` | customerNo, type, content... | 新跟进记录 |

### 报价单 (2)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_list_quotations` | customerNo | 报价单列表 |
| `fumamx_create_quotation` | customerNo, subject, amount, items... | 新报价单 |

### 销售订单 (2)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_list_orders` | customerNo | 订单列表 |
| `fumamx_create_order` | customerNo, amount, items... | 新订单 |

### 邮件 (2)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_send_email` | to, subject, body, cc... | 发送结果 |
| `fumamx_check_inbox` | — | 收件箱邮件 |

### 培育 (2)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_add_to_nurture` | customerNo, templateName | 培育记录 |
| `fumamx_get_nurture_status` | customerNo | 培育状态 |

### 公海 (1)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_claim_public_customer` | customerNo | void |

### 任务 (2)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_get_daily_tasks` | — | 今日任务列表 |
| `fumamx_complete_task` | taskId | void |

### 统计 (1)
| 工具 | 输入 | 输出 |
|------|------|------|
| `fumamx_get_stats` | — | 销售概览 |

## API 逆向流程

当前 `ApiFumamxClient` 中的端点路径是占位符。完成 API 逆向后替换:

```bash
# 1. Chrome 开启远程调试
chrome.exe --remote-debugging-port=9222

# 2. 登录 https://fumamx.com/#/login

# 3. 运行捕获
cd ../scripts && python capture-api.py

# 4. 操作孚盟各模块 (5-10分钟)

# 5. Ctrl+C 保存 → captured-apis.json

# 6. 用捕获的端点更新 client.ts 中的 URL
```

捕获的输出 `captured-apis.json` 包含:
- 请求 URL（分组去重）
- HTTP 方法
- 请求体 (POST body)
- 响应状态码和响应体
- 请求频率统计

## 集成到 holo-desktop

在 holo-desktop 的 MCP 配置中添加:

```json
{
  "mcpServers": {
    "fumamx": {
      "command": "node",
      "args": ["path/to/acquisition-agent/skills/fumamx-crm/mcp-server/dist/index.js"],
      "env": {
        "FUMAMX_CDP_PORT": "9222"
      }
    }
  }
}
```

Agent 即可通过 `fumamx_*` 工具直接操作孚盟，无需 CDP 浏览器自动化。

## 升级路径

| 阶段 | 后端 | 状态 |
|------|------|------|
| v2.0 (当前) | CDP 浏览器自动化 | 可用 |
| v2.1 | API 逆向完成 → `ApiFumamxClient` | 待捕获 |
| v2.2 | MCP Server 独立运行 | 待集成 |
| v3.0 | 事件监听 + 主动触发 | 规划中 |
