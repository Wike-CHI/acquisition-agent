# Corrections Log — 夏夏实战纠错记录

> 保留最近50条纠错。3次同类→升入 memory.md（HOT）。

---

## 2026-03-31

### 10:00 — 特易 Vue SPA 输入框填值

- **纠正：** 用 native value setter (`Object.getOwnPropertyDescriptor...`) 填值后 Vue 不响应，查询不生效
- **正确做法：** 先 `find first "input[type=text]" fill "关键词"` 再 `find role button click --name "查询"` ← 能真正绑定 Vue 响应式数据
- **Context：** 南美/北美多市场扫描，第1次尝试用 eval JS setter 方式无效
- **Count：** 3 → **已 PROMOTE 到 memory.md**

---

### 10:05 — 特易换国家时用菜单导航

- **纠正：** 点击"特易搜搜"菜单项导致打开新 tab，当前 tab 变成 about:blank，session 丢失
- **正确做法：** 直接 `agent-browser open "https://et.topease.net/gt/company?wlf=gt_company"` 重新加载搜索页
- **Context：** 巴西搜索完，尝试切换智利时触发
- **Count：** 2 → 候选升HOT（待第3次确认）

---

### 10:10 — 等待时间不足导致国家列表空白

- **纠正：** `wait --load networkidle` 后国家列表仍空，JS eval 返回 0 个标签
- **正确做法：** 额外 `wait 3000`（SPA 异步渲染，networkidle 仅保证资源加载，不保证 Vue 渲染完成）
- **Context：** 每次打开搜索页后首次检查国家标签时发现
- **Count：** 3 → **已 PROMOTE 到 memory.md**

---

### 10:15 — agent-browser click @ref 语法不支持

- **纠正：** `agent-browser click @e94` 返回不支持，click 命令不接受 ref 参数
- **正确做法：** 用 CSS selector `find first "input[type=text]"` 或 `find role textbox`
- **Context：** 尝试点击关键词输入框时发现
- **Count：** 1（first occurrence）

---

### 10:20 — agent-browser 命令链式写法问题

- **纠正：** `command1 && command2` 在 PowerShell 中 agent-browser 命令不能 && 链接
- **正确做法：** 分开两行执行，每条命令单独调用 execute_command
- **Context：** 尝试 `fill "关键词" && click "查询"` 时偶发失败
- **Count：** 2 → 候选升HOT（待第3次确认）

---

### 10:25 — 多市场调研顺序优化

- **纠正：** 最初计划"搜完一国→立即深挖详情"，效率低
- **正确做法：** 先快速扫描所有目标国家（只取总数+首页公司列表），再汇总分析，最后生成综合报告
- **Context：** 本次调研中途调整策略，效果明显更好
- **Count：** 1（first occurrence）

---

## 2026-03-31（下午）

### 11:00 — WorkBuddy 自动化 scheduleType

- **纠正：** 误以为一次性任务也需要 rrule 参数
- **正确做法：** 一次性任务用 `scheduleType="once"` + `scheduledAt="2026-04-05T09:00"`，完全不需要 rrule
- **Context：** 创建 D5/D14 定时任务时确认
- **Count：** 1（first occurrence）

---

### 11:05 — Python SMTP 163邮箱授权码

- **纠正：** 用账号登录密码报 535 Auth 错误
- **正确做法：** 163邮箱 SMTP 必须用"授权码"（在邮箱设置-POP3/SMTP里生成），不是登录密码
- **Context：** 测试 send_batch_emails.py 时发现
- **Count：** 1（first occurrence，已写入 domains/email-outreach.md）

### 11:00 — 埃及特易搜索国家选择

- **纠正：** 直接在 URL 参数里加国家不生效（SPA，参数需 Vue router）
- **正确做法：** JS `Array.from(document.querySelectorAll('.country span')).find(el=>el.textContent.trim()==='埃及').closest('.country').click()`
- **Count：** 1（first occurrence，已写入 MARKET-DEEP-DIVE.md）
