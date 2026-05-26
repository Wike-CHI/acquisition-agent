---
name: company-research
version: 3.1.0
description: Use when 用户需要做海外B2B企业背景调查、查公司信息、调研客户时。路由：背调前必须先用 lead_query 查CRM是否已有该线索（避免重复调研），再用此技能做外部信息搜集。
allowed-tools: Bash
triggers:
  - 公司调研
  - company research
  - 企业背调
  - 调查公司
  - 调研客户
  - research company
  - background check
---

# 海外B2B企业背景调查 v3.1

红龙获客系统的海外客户企业背调工具。输入企业名称（英文），自动搜索公开信息并输出结构化背调报告。

> **导航链：** 上游 ← [[_index-discovery|客户发现领域]] | 下游 → [[cold-email-generator|开发信生成]]（个性化）→ [[smart-quote|智能报价]]（ICP评分驱动） | 存储 → [[knowledge-base|团队知识库]] | 快速初筛 → [[five-step-bg-check|5招背调法]]

> v3.1 变更：修复 NAS 保存路径；NAS 挂载失败时强制降级存本地并告知用户；脚本路径修正为相对于知识库根目录。
> v3.0 变更：搜索工具从 agent-browser 切换为 Exa MCP（mcporter），不再依赖浏览器。

---

## 前置条件：NAS 凭据配置（首次使用必须）

知识库脚本需要 NAS 访问凭据，**仅需配置一次**：

```powershell
# 创建凭据文件（只需运行一次，IP 已写死为 192.168.0.194）
$cred = Get-Credential -Message "输入 NAS 登录账号（格式: 用户名 或 域名\用户名）"
$cred | Select-Object -ExpandProperty UserName | Out-File "$env:USERPROFILE\.openclaw\.nas_credentials" -Encoding UTF8
$pass = $cred.Password | ConvertFrom-SecureString
@{User=$cred.UserName; Pass=$pass} | ConvertTo-Json | Out-File "$env:USERPROFILE\.openclaw\.nas_credentials" -Encoding UTF8
```

或者手动创建 `C:\Users\你的用户名\.openclaw\.nas_credentials`，内容为：
```json
{"User":"你的NAS账号","Pass":"加密密码（由上面脚本生成）"}
```

> 技能执行时会自动尝试挂载 K: 盘指向 `\\192.168.0.194\home`，无需手动挂载。

---

## 执行流程（强制顺序）

```
输入：公司名
       ↓
[Step 1] 读知识库 — 检查是否已有档案
       ↓
[Step 2] 执行背调 — 搜索 + 生成报告
       ↓
[Step 3] 保存知识库（必须）— NAS 或本地降级
       ↓
[Step 4] 输出报告 + A2UI 卡片
```

**禁止跳过 Step 3。** 无论 NAS 是否可用，背调结果必须存入知识库。

## 搜索工具

### 主力工具：Exa MCP（通过 mcporter）

```bash
# 通用搜索
mcporter call exa.web_search_exa 'query={搜索关键词}&numResults=10'

# 高级搜索（支持日期范围、域名过滤）
mcporter call exa.web_search_advanced_exa 'query={关键词}&numResults=10&startPublishedDate=2025-01-01'

# 公司专属搜索
mcporter call exa.company_research_exa 'query={公司名}&numResults=5'

# 人物搜索（LinkedIn 决策者）
mcporter call exa.people_search_exa 'query={姓名} {公司名}&numResults=5'
```

### 降级工具：内置 web_search / web_fetch

当 mcporter 不可用时，使用内置工具：

```
web_search({query: "搜索关键词"})
web_fetch({url: "https://目标URL"})
```

### 降级判断

```
1. 先执行 mcporter call exa.web_search_exa 测试连通性
2. 如果返回正常结果 → 使用 Exa MCP 完成所有搜索
3. 如果报错或超时 → 降级到 web_search + web_fetch
4. 降级时告知用户："Exa 搜索暂不可用，使用内置搜索工具"
```

## URL 拼接规则（严格遵守）

搜索结果中常见的残缺 URL 必须补全：

| 残缺格式 | 补全为 |
|---------|--------|
| `br.linkedin.com/in/xxx` | `https://br.linkedin.com/in/xxx` |
| `linkedin.com/in/xxx` | `https://www.linkedin.com/in/xxx` |
| `www.example.com` | `https://www.example.com` |
| `example.com/path` | `https://example.com/path` |

**规则**：所有输出的 URL 必须包含 `https://` 协议前缀。如果搜索结果中的链接缺少协议前缀，自动补全后再输出。

---

## 详细参考

> 以下内容已拆分到 [[references/search-procedures.md]]，仅在需要时读取：
> - 搜索步骤
> - 输出格式
> - 信息质量规则
> - 详细参考
>
> 详细搜索步骤、命令模板、知识库脚本、信息质量规则。
