---
name: holo-heartbeat-executor
description: |
  红龙获客系统 HEARTBEAT 执行器 v1.0 - 执行 Pipeline 自动巡检13项检查。
  触发：cron定时任务 "执行HEARTBEAT检查"
  前置条件：NAS挂载 或 本地CRM数据存在
triggers:
  - 执行HEARTBEAT检查
  - HEARTBEAT
  - Pipeline巡检
  - 心脏跳动检查
version: 1.0.0
---

# HOLO HEARTBEAT 执行器 v1.0

> **Skill Graph：** 领域 → [[_index-acquisition|核心获客领域]] | 上游 ← [[_index-operations|运营领域]] | 下游 → [[sales|Pipeline]] + [[follow-up-signal-monitor|跟进]] + [[email-inbox|邮件]] 自动巡检


执行 Pipeline 自动巡检13项检查，有问题才报告，无问题回复 `HEARTBEAT_OK`。

## 前置检查（必须先做）

执行 HEARTBEAT 前，必须先确认数据源：

```bash
# 1. 检查 NAS 是否挂载
net use 2>/dev/null | grep -q "192.168.0.98" && echo "NAS在线" || echo "NAS离线"

# 2. 检查本地 CRM 数据
find ~/.hermes/skills/acquisition -name "*.db" -o -name "customers.json" -o -name "Pipeline*.xlsx" 2>/dev/null

# 3. 检查 Supermemory
chroma:stats 2>/dev/null
memory:stats 2>/dev/null
```

## 数据源优先级

| 优先级 | 数据源 | 路径 | 说明 |
|--------|--------|------|------|
| 1 | 本地WorkBuddy Pipeline | `/mnt/c/Users/Administrator/WorkBuddy/*/沙特客户Pipeline*.xlsx` | 沙特4行业Pipeline |
| 1b | 本地WorkBuddy Pipeline | `/mnt/c/Users/Administrator/WorkBuddy/*/红龙全球客户Pipeline*.xlsx` | 全球客户Pipeline Q1 |
| 1c | 本地WorkBuddy Pipeline | `/mnt/c/Users/Administrator/WorkBuddy/*/东南亚获客Pipeline.xlsx` | 东南亚Pipeline |
| 1d | 本地WorkBuddy Pipeline | `/mnt/c/Users/Administrator/WorkBuddy/*/印尼客户数据库.xlsx` | 印尼客户数据库 |
| 1e | WhatsApp发送记录 | `/mnt/c/Users/Administrator/WorkBuddy/*/whatsapp_send_results.json` | WhatsApp发送历史 |
| 2 | 孚盟MX CRM | Web UI | 需浏览器自动化登录 |
| 2b | 邮件序列追踪 | `/tmp/us_outreach_log.md` | 文件型CRM备援（无本地DB时使用） |
| 3 | NAS共享盘 | Y:/knowledge/companies/ | 公司档案 |
| 4 | 本地ChromaDB | ~/.hermes/chromadb/ | 对话历史备份 |
| 5 | Supermemory | ~/.hermes/lancedb/ | 结构化记忆 |

> ⚠️ **关键发现**：Pipeline数据不在NAS上，而在本地Windows路径 `C:\Users\Administrator\WorkBuddy\` 的时间戳子目录中（格式：`YYYYMMDDhhmmss`）。HEARTBEAT执行时用 `find` 搜索最新时间戳目录中的 `.xlsx` 文件。WhatsApp发送记录在同一目录的 `whatsapp_send_results.json` 文件中。

## Pipeline Excel 文件列结构（必须用 openpyxl 读取）

### 沙特客户Pipeline_4行业.xlsx → Sheet: "沙特客户Pipeline"
```
序号(0), 行业(1), 等级(2), 公司名称(中)(3), 公司名称(EN)(4), 城市(5),
类型(6), 规模(7), 主营业务(8), 传送带相关需求(9), 红龙匹配产品(10),
官网(11), 联系人(12), 职位(13), 邮箱(14), 电话(15), ICP评分(16),
触达日期(17), 状态(18), 备注(19)
```
关键列：等级(2)=A/B, 邮箱(14), 电话(15), ICP评分(16), 触达日期(17), 状态(18)

### 红龙全球客户Pipeline-2026Q1.xlsx → Sheet: "客户Pipeline"
```
序号(0), 公司名(1), 国家(2), 市场(3), 邮箱(4), 电话(5), 等级(6),
推荐产品(7), ICP评分(8), 首次发送日期(9), 状态(10),
跟进日1(11), 跟进日2(12), 跟进日3(13), 备注(14)
```
关键列：等级(6)=S/A/A+/B, 邮箱(4), ICP评分(8), 首次发送日期(9), 状态(10)

### 东南亚获客Pipeline.xlsx → Sheet: "Pipeline"
```
ID(0), Company(1), Country(2), Type(3), Grade(4), ICP Score(5),
Email(6), Phone(7), WhatsApp(8), Contact Person(9), Title(10),
Channel(11), Status(12), Notes(13)
```

### WhatsApp发送记录 whatsapp_send_results.json
```json
[
  {"company": "...", "phone": "...", "success": true, "response": "...", "timestamp": "2026-04-06 13:10:05"},
  ...
]
```
通过 `timestamp` 字段计算 48h/60h/72h 窗口是否过期。

> ⚠️ 若 NAS 离线 + 邮件序列文件存在，Item 7 仍可正常执行。若文件也不存在，返回 `[SILENT]`。

## NAS 挂载命令

```powershell
# NAS 共享盘（公司资料）
net use Y: \\192.168.0.98\home /user:${env.NAS_USER} ${env.NAS_PASSWORD}

# 报价资料盘
net use W: \\192.168.0.98\公司报价资料 /user:${env.NAS_USER} ${env.NAS_PASSWORD}
```

## 13项检查执行顺序

### 1. 新线索检查
- **触发**: 每次心跳
- **逻辑**: CRM中 `created_at = 今天 AND status = new`
- **数据源**: 孚盟CRM / 本地客户池
- **输出**: `[新线索] 找到 X 条`

### 2. 停滞线索检查
- **触发**: 每次心跳
- **逻辑**: `status IN (contacted, interested, quote_sent, negotiating) AND last_contact > 5工作日`
- **输出**: `[停滞线索] 找到 X 条`

### 3. 报价追踪
- **触发**: 每次心跳
- **逻辑**: `status = quote_sent AND last_contact > 3工作日`
- **输出**: `[报价追踪] 找到 X 条`

### 4. 今日行动提醒
- **触发**: 每次心跳
- **逻辑**: `next_action 包含今天日期`
- **输出**: `[今日行动] 找到 X 条`

### 5. 培育/休眠/流失检查
- **触发**: 每周一 08:30
- **逻辑**:
  - `status = nurture AND last_contact > 14天`
  - `status = closed_won AND last_contact > 30天`
  - `status = closed_lost AND last_contact > 90天`
- **输出**: `[培育检查]` 三类统计

### 6. 数据质量检查
- **触发**: 工作日每日一次
- **逻辑**:
  - `whatsapp 为空 AND status NOT IN (closed_won, closed_lost)`
  - `icp_score 为空 AND status != new`
- **输出**: `[数据质量] 找到 X 条需补充`

### 7. 邮件序列检查
> ⚠️ 本地无CRM数据库时，使用文件追踪：`/tmp/us_outreach_log.md`（主记录）+ `/tmp/email_followup_*.html`（跟进正文）
> 详见 `acquisition-workflow/SKILL.md` → "CRM数据源说明" 节

- **触发**: 每日 11:00
- **逻辑（文件模式）**: 读取 `/tmp/us_outreach_log.md`，按状态列和文件mtime判断序列阶段
  - `状态 = SENT` → 检查首封日期 + mtime of `email_followup_*.html`
  - Day 3：首封+3天 且 `email_followup_1.html` mtime超期
  - Day 7：首封+7天 且 `email_followup_2.html` 不存在
  - Day 14：首封+14天
  - `状态 = REPLIED` → 新回复待处理
  - `状态 = BOUNCED/SPAM` → 标记并停止接触
- **输出**: `[邮件序列] Day3待发: X / Day7待发: X / Day14最终: X / 新回复: X`

### 8. 线索发现
- **触发**: 每日 10:00（按星期轮换市场）
- **逻辑**: Exa搜索新客户 → ICP评分 → 创建CRM
- **市场轮换**: 周一非洲/周二非洲/周三中东/周四东南亚/周五拉美/周六南亚/周日欧洲
- **输出**: `[线索发现] 今日目标：[市场] 发现 X 家`

### 9. 邮箱收件检测
- **触发**: 每次心跳
- **逻辑**: 连接163邮箱IMAP检查新回复
- **输出**: `[邮箱收件]` 新回复/新询盘统计

### 10. 竞品动态
- **触发**: 每周五 14:00
- **逻辑**: 搜索Beltwin等竞品动态
- **输出**: `[竞品动态]`

### 11. 记忆健康检查
- **触发**: 每日 14:00
- **逻辑**: `memory:stats` + `chroma:stats`
- **输出**: `[记忆健康]` 统计

### 12. CRM快照备份
- **触发**: 每日 12:00
- **逻辑**: 读取CRM → 存入ChromaDB + Supermemory
- **输出**: `[CRM快照] 已备份 X 条`

### 13. WhatsApp 72h窗口期检测
- **触发**: 每次心跳
- **逻辑**: `status IN (...) AND primary_channel = WhatsApp AND now - last_contact > 48h`
- **分级**: 48-60h预警 / 60-72h紧急 / >72h已过期
- **输出**: `[WhatsApp窗口]` 三类统计

## 无数据时的处理

### 场景：NAS离线 + 无本地CRM

```
1. 尝试验证NAS连接（2秒超时）
2. 检查本地备援数据
3. 如均无数据 → 返回 [SILENT]
```

### 场景：CRM为空（全新系统）

```
1. 检查客户数量
2. 如为0 → [SILENT]
3. 记录：系统尚未填充客户数据，建议先执行「线索发现」
```

## 关键参数

```yaml
stale_threshold_days: 5          # 停滞线索阈值
quote_followup_days: 3           # 报价无反馈阈值
nurture_days: 14                # nurture激活周期
closed_won_care_days: 30        # 售后关怀周期
closed_lost_followup_days: 90   # 失单跟进周期
whatsapp_warning_hours: 48      # WhatsApp窗口预警
whatsapp_expiry_hours: 72       # WhatsApp窗口过期
email_day3_followup: 3           # Day3跟进
email_day7_followup: 7          # Day7跟进
email_day14_final: 14           # Day14最终跟进
```

## 输出格式规则

```
✅ 有问题：按各检查项格式输出详情 + 建议动作
✅ 无问题：只回复 HEARTBEAT_OK
✅ 混合情况：有问题项输出详情，无问题项不输出
```

## 已知限制

1. **Pipeline数据路径**：Pipeline数据在本地Windows路径 `C:\\Users\\Administrator\\WorkBuddy\\` 的时间戳子目录中，非NAS。每次HEARTBEAT需用 `find` 搜索最新时间戳目录中的 `.xlsx` 文件。
2. **数据孤岛**：全球Pipeline（Q1）和沙特Pipeline（4行业）是两个独立文件，可能出现状态不一致，HEARTBEAT需分别检查。
3. **孚盟CRM**：需浏览器自动化，暂不支持API直连
4. **时区**：所有时间使用服务器本地时间
5. **权限**：ChromaDB/Supermemory 需要正确的存储路径权限
6. **ChromaDB冷启动**：ChromaDB 首次使用时需要下载 embedding 模型（`all-MiniLM-L6-v2`，~79MB），通过内嵌 uvicorn 下载，**会阻塞直到完成**。如 ChromaDB 未安装，先用 `pip install chromadb --break-system-packages` 预装，再用 `python3.13 -c \"import chromadb\"` 预热模型。
7. **Python 版本陷阱**：ChromaDB 在 Python 3.13 环境安装后，需要用 `python3.13` 调用（系统默认 Python 3.11 不识别）。
8. **备援存储**：ChromaDB/LanceDB 不可用时，JSON 文件备援存储到 `/root/.hermes/memories/pipeline_snapshot_YYYY-MM-DD.json`，文件格式兼容 HEARTBEAT 输出格式。

## 关键发现（经验证）

### Global Pipeline 读取陷阱
- `红龙全球客户Pipeline-2026Q1.xlsx` **第1行是合并标题行**（"红龙工业设备 — 全球客户开发 Pipeline (2026-03-31)"），**第2行才是列头**
- 如果用 `min_row=2` 读取会把标题行当数据，导致所有字段为 `?`
- **正确方法**：`header=2` 或 `min_row=3` 并显式用 `ws[2]` 获取headers

### "待发送"状态的真实含义
- Global Pipeline 中很多公司标记 `首发送日期=2026-03-31` 且 `状态=待发送`
- **这不是"已发送"，而是"计划发送但实际未发"**
- 区分方式：`状态` 列值为 "待发送" = 从未发送过；首发送日期只是计划日期
- **正确判断**：只有 `状态 = "已发送" / "SENT"` 且 `首发送日期` 有值才代表实际发送

### SEA Pipeline 邮件发送判断
- SEA 中 `Status="Sent (Apr 6)"` 是真实发送记录（不是计划）
- 但D3/D7/D14跟进从未执行，需要基于 Apr 6 真实计算

### WhatsApp 72h 窗口判断逻辑
- 如果所有WA记录都显示 >72h 过期，这是**正常现象**，不是误报
- 说明WA触达后**确实没有任何后续跟进动作**
- 处理方式：报告全部过期 + 建议切换邮件为主力通道

### 停滞线索判定前提
- 沙特客户的 `已WhatsApp触达` 状态 ≠ 首封开发信已发送
- 只有当状态同时包含"已WhatsApp触达"**且**有真实触达日期时才算真正的活跃线索
- 如果WA过期+无邮件发送记录，实际上已是死线索

### 邮件序列积压优先级
```
US D7今日到期 > Global补发首封 > SEA补D7 > Global补D3/D7/D14
```
US的5家公司是当前最高优先级（ICP 86-95，全部A级），D7是最终激活机会。

---

---

## 详细参考

> 以下内容已拆分到 [[references/extended-guide.md]]，仅在需要时读取：
> - HEARTBEAT 执行经验记录（2026-04-16）
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
