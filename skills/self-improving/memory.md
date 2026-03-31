# HOT Memory — 夏夏学习记录

> ≤100 行，每次加载都读取。已验证3次以上的模式写在这里。
> 最后更新：2026-03-31

---

## 用户偏好

- 沟通：直接简洁，不废话，不问没必要的确认
- 输出：Markdown 报告，带行动清单（P0/P1/P2）
- 语言：中文，英语只用于对外文档
- 结果优先：先交付可用结果，再解释原因

---

## 全局流程模式（已验证）

### 特易海关 Vue SPA 操作

- **填词方式**：`find first "input[type=text]" fill "关键词"` 是最稳定的方式（Vue双向绑定）
- **提交查询**：`find role button click --name "查询"` 不要用 `press Enter`（有时无效）
- **换国家**：`open "https://et.topease.net/gt/company?wlf=gt_company"` 重新进页面，**不要**用菜单导航（开新tab→about:blank）
- **登录方式**：JS native setter + dispatchEvent("input") + 点 `button.login_btn`
- **会话保持**：同一 agent-browser 进程内 session 持续，超时后自动重定向到登录页需重新登录

### 多市场批量扫描节奏

- 单个市场：open → 点国家 → fill关键词 → 点查询 → 等5秒 → eval tab数量 → eval innerText提取
- 4个市场约90分钟（含偶发的重新登录时间）
- 高效路径：特易搜索页 `?wlf=gt_company` 比 `/gt/company/index` 更快加载国家列表

### 报告生成

- 模板：市场规模 → TOP10客户（ICP评分）→ 行业分析 → 竞品来源 → 行动清单 → 开发信
- ICP 6维度：行业匹配(20) + 采购能力(20) + 频率(20) + 客户类型(15) + 中国经验(15) + 联系方式(10)
- 分级：S(90+) / A(70-89) / B(50-69) / C(<50)

---

## 项目默认值

- 主项目：global-customer-acquisition（红龙获客系统）
- 报告路径：`C:\Users\Administrator\WorkBuddy\20260330165354\`
- 特易账号：ty50445562 / tyholobelt2025（**勿写入外部文档**）
- 发件邮箱：wikeye2025@163.com

---

### B2B 邮件自动化触达流程（已验证）

- **脚本架构**：`send_batch_emails.py`（D0群发）+ `follow_up_emails.py`（D5/D14跟进），CLI参数 `day5`/`day14`
- **SMTP 配置**：163邮箱用 `smtplib.SMTP_SSL(host, 465)`，密码用授权码非登录密码
- **发送间隔**：每封间隔 15 秒，避免被标记垃圾邮件
- **WorkBuddy 自动化**：用 `automation_update` tool，`scheduleType="once"`，`scheduledAt` ISO 8601 格式
- **节奏模板**：D0发信 → D3 LinkedIn → D5跟进邮件 → D7 WhatsApp → D14最终邮件

### WorkBuddy 自动化任务创建

- **工具**：`automation_update`，`mode="suggested create"`
- **一次性任务**：`scheduleType="once"`，提供 `scheduledAt`（如 `"2026-04-05T09:00"`），不需要 rrule
- **CWD 必须填**：指定工作目录，Python 脚本才能找到相对路径文件
- **Prompt 写法**：先 `cd 工作目录`，再执行命令，两步合一写

---

## 待升为HOT的候选模式（2次以上）

- LinkedIn 决策人挖掘用 exa + web_search（特易数据无联系人）[2次]
- 巴西客户优先试 borpac.com.br 直接联系页面（有效）[2次]
- 多市场调研顺序：先扫全部国家数量 → 再集中深挖重点国家（更高效）[2次]
