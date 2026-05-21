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
- 所有 `acquisition-agent/memory/MEMORY.md` 文件大小为 0 字节
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
