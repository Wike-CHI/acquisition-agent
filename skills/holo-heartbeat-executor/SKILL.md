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

执行 Pipeline 自动巡检13项检查，有问题才报告，无问题回复 `HEARTBEAT_OK`。

## 前置检查（必须先做）

执行 HEARTBEAT 前，必须先确认数据源：

```bash
# 1. 检查 NAS 是否挂载
net use 2>/dev/null | grep -q "192.168.0.194" && echo "NAS在线" || echo "NAS离线"

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
net use Y: \\192.168.0.194\home /user:HOLO-AGENT Hl88889999

# 报价资料盘
net use W: \\192.168.0.194\公司报价资料 /user:HOLO-AGENT Hl88889999
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

## HEARTBEAT 执行经验记录（2026-04-16）

### 实际Pipeline文件位置（WSL路径）
```
/mnt/c/Users/Administrator/WorkBuddy/20260330165354/红龙全球客户Pipeline-2026Q1.xlsx
/mnt/c/Users/Administrator/WorkBuddy/20260406084601/沙特客户Pipeline_4行业.xlsx
/mnt/c/Users/Administrator/WorkBuddy/20260406084602/东南亚获客Pipeline.xlsx
/mnt/c/Users/Administrator/WorkBuddy/20260409114812/印尼客户数据库.xlsx
```

### openpyxl 读取注意事项
- **行偏移**：每个Pipeline的列头行可能不在第1行。例如全球客户Pipeline第1行是合并标题，第2行才是列头，数据从第3行开始。**首次读取时先打印header确认**，不要假设row=2是数据起始。
- **读取模式**：必须用 `data_only=True, read_only=True`，避免日期被解析为浮点数。
- 所有日期字段用 `to_date()` 函数统一转换（处理 datetime/str/None）。
- Python datetime 比对而非字符串比对。

### WhatsApp 72h 窗口计算方法
1. 从 `whatsapp_send_results.json` 读取 `timestamp` 字段（实际发送时间）
2. 计算 `当前时间 - 发送时间` 得到已过小时数
3. 分级判断：48-60h预警 / 60-72h紧急 / >72h已过期
4. **注意**：`timestamp` 是实际发送时间，不是状态标记。所有记录如果都显示>72h已过期，说明确实是从该时间点发出的，计算逻辑正确。

### 常见问题发现（2026-04-17补充）

**execute_code 环境陷阱**：
- `glob` 和 `os` 模块**未预导入**，必须显式 `import glob, os`
- Indonesia数据库文件可能在比预期更新的timestamp目录：`20260409114812`
- 直接读取 `/tmp/us_outreach_log.md` 可获取美国市场邮件序列状态

### 常见问题发现
- 沙特Pipeline中 "已WhatsApp触达" 客户（标记WA发送）≠ 首封开发信已发送
- "待发送" 不代表已发送，可能是还没发过任何消息
- 邮箱标注"从孚盟CRM读取"但未实际填入 → 仍需去孚盟手动获取
- **全球客户Pipeline数据起始行**：先打印header确认，可能第1行是合并标题，第2行是列头，数据从第3行开始
- **印尼数据库 sheet名称**：不要用"Sheet1"，实际名称是"印尼客户数据库"，，用 `wb.sheetnames[0]` 或遍历发现

### 实测关键发现（2026-04-17）- 第一次执行

**Drip Campaign 全面停滞（高危）**：
- 所有客户卡在 "待发送" 状态，Day 3/7/14 序列从未启动
- 全球Pipeline（Q1）7个客户，从3月31日到4月17日（17天）未发送任何邮件
- 触发条件：开发信未发送 → 序列无法开始 → 所有后续节点累积延迟
- **建议**：优先批量发送 Day 1 首封，再一次性补充 Day 3/7 跟进

**记忆层系统性失效**：
- 所有 `.workbuddy/memory/MEMORY.md` 文件大小为 0 字节
- ChromaDB 和 LanceDB 目录不存在（未初始化）
- L3/L4 层记忆从未写入，CRM 快照无数据可用
- **建议**：重建记忆写入流程，先填充 L1 MemOS 再同步 L3/L4

**WSL 环境限制**：
- `net use` 命令在 bash 下不可用，必须用 `powershell.exe -Command`
- `powershell.exe` 也可能不存在（取决于 WSL 配置）
- **备援**：直接读取 Windows 路径文件（`/mnt/c/...`），绕过网络挂载

**Pipeline 文件 glob 模式**：
```bash
# ✅ 正确
files = sorted(glob.glob('/mnt/c/Users/Administrator/WorkBuddy/*/红龙全球客户Pipeline*.xlsx'), key=os.path.getmtime, reverse=True)

# ✅ 备援查找（无通配符时）
find /mnt/c/Users/Administrator/WorkBuddy -name "*Pipeline*.xlsx" -newer /mnt/c/Users/Administrator/WorkBuddy/20260301000000 -type f 2>/dev/null
```

### 日期解析陷阱
```python
# ❌ 错误：混用 datetime 和 date 对象
today = date(2026, 4, 17)
sent_date = datetime(2026, 4, 10)  # datetime对象
days = (today - sent_date).days  # TypeError!

# ✅ 正确：统一用 date 或 datetime
today = datetime(2026, 4, 17).date()
sent_date = datetime(2026, 4, 10)
days = (today - sent_date.date()).days

# ✅ 或统一用 datetime
today = datetime(2026, 4, 17)
sent_date = datetime(2026, 4, 10)
days = (today - sent_date).days
```

### 邮件序列文件格式 `/tmp/us_outreach_log.md`
实际格式是 Markdown 表格，不是纯文本。文件包含：
- **第一行**: `# 美国市场开发信发送记录`
- **表格列**: `# | 客户 | 邮箱 | 主题 | 状态 | MessageID`
- **状态值**: `SENT` / `REPLIED` / `BOUNCED` / `SPAM`
- **跟进计划**: Markdown 列表格式，标注 D3/D7/D14 日期
- **第二批待发**: 单独 Markdown 列表

**读取方式**: 用 `read_file()` 读取完整内容，解析 Markdown 表格行（含 `|` 分隔），提取邮箱和状态。

### Item 7 邮件序列检查 - 两套独立系统
邮件序列存在于两个独立系统，必须分别检查：

| 系统 | 数据源 | 客户群 | 特点 |
|------|--------|--------|------|
| Pipeline Excel | 全球/SEA/沙特/印尼Pipeline | 美国市场外所有客户 | 状态=待发送/待开发等 |
| 邮件追踪文件 | `/tmp/us_outreach_log.md` | 美国市场客户 | 状态=SENT/REPLIED |

**执行 Item 7 时必须同时读取两个数据源**，否则漏掉美国市场的邮件序列。

**Global Pipeline 序列状态解读**：
- `待发送` = 序列从未启动（首封未发）
- `待获邮箱` = 缺邮箱，无法启动序列
- SEA Pipeline: `Sent (Apr 6)` = Day0 已发，但 Day3/7/14 跟进未执行

**实际发现的序列积压情况（2026-04-17）**：
- Global Pipeline 5家（D14已过，2026-03-31发送）
- SEA Pipeline 8家（D7/D3均已过，2026-04-06发送）
- US市场 D7今日到期（2026-04-10发送）

### Item 13 WhatsApp 72h 窗口 - 正确理解
所有记录显示 >72h 是**正常行为**，不是误报：
- 8个沙特客户全部在 4月6日 发送
- 当前日期 4月17日，已过 256 小时
- 这反映的是**真实的跟进缺口**：WA触达后没有任何后续动作
- 处理方式：报告全部过期 + 建议切换邮件为主力通道

### Item 6 数据质量检查 - 优先查A级客户
数据质量问题的优先级：
- **A级/S级客户缺联系方式 = CRITICAL**，优先处理
- B级客户可暂缓
- 检查逻辑：
  - Saudi: `等级=A` 且 `邮箱=null` 且 `电话=null` → CRITICAL
  - SEA: `Grade=A/S` 且 `Email=null` 且 `Phone=null` → CRITICAL
  - Global: `等级=S/A` 且 `邮箱=null` → CRITICAL

### SEA Pipeline sheet名称确认
Sheet名称就是 `"Pipeline"`（不是"Sheet1"或其他）。用 `wb.sheetnames[0]` 获取第一个sheet即可。

### 印尼客户数据库位置
印尼数据存在独立文件 `印尼客户数据库.xlsx`，位于 timestamp `20260409114812` 目录。当前检查优先级低于前三个Pipeline。

---

_Version: 1.1.0_
_Author: HOLO获客系统_
_Author: HOLO获客系统_
