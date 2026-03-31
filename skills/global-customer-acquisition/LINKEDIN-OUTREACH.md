# LinkedIn 私信外联流程

_最后更新：2026-03-30_

---

## 概述

LinkedIn 私信是获客流程的**第6步**（在 Exa 发现决策人 URL 之后、邮件跟进之前）。

```
特易/Exa 发现公司 → Exa 找到决策人 LinkedIn URL → 本流程：发连接+私信 → 邮件跟进
```

底层工具：**`agent-browser`**（AI 实时操控浏览器，非脚本）

---

## 触发条件

用以下意图触发：
- "给这些决策人发 LinkedIn 私信"
- "LinkedIn 连接请求"
- "发 InMail"
- "LinkedIn outreach"
- 上游任务输出了一批 `linkedin.com/in/xxx` URL

---

## 完整执行流程

### Step 0：确认准备工作

```
[ ] agent-browser 已安装（npm install -g agent-browser）
[ ] Session 文件存在：C:/Users/Administrator/.workbuddy/sessions/linkedin-session.json
[ ] 目标列表准备好：[{name, company, linkedin_url, message}]
[ ] 用户已确认消息内容
```

Session 不存在时，提示：
> "需要先完成 LinkedIn 首次登录。请执行：
> `agent-browser open https://www.linkedin.com/login --headed`
> 手动登录后告诉我，我来保存 session。"

---

### Step 1：验证 Session 有效性

```bash
agent-browser state load C:/Users/Administrator/.workbuddy/sessions/linkedin-session.json
agent-browser open https://www.linkedin.com/feed/
agent-browser snapshot -i
```

**判断**：
- 看到 `nav` 里有用户名 → ✅ 已登录，继续
- 出现登录表单 → ❌ Session 过期，提示用户重新登录

---

### Step 2：逐条发送私信

**对每个目标**（按队列顺序）：

```
1. 打开 Profile
   agent-browser open {linkedin_url}
   agent-browser wait --load networkidle

2. 快照，找按钮
   agent-browser snapshot -i
   # 优先找 "Message" 按钮（已连接）
   # 其次找 "Connect" 按钮（未连接）

3a. 已连接 → 发私信
    agent-browser click @{message_btn_ref}
    agent-browser wait --text "Write a message"
    agent-browser snapshot -i
    agent-browser fill @{input_ref} "{个性化消息内容}"
    agent-browser find role button click --name "Send"
    agent-browser wait 2000

3b. 未连接 → 发连接请求+附言
    agent-browser find role button click --name "Connect"
    agent-browser wait --text "Add a note"
    agent-browser find text "Add a note" click
    agent-browser snapshot -i
    agent-browser fill @{note_ref} "{附言内容，≤300字}"
    agent-browser find role button click --name "Send"
    agent-browser wait 2000

4. 截图存档
   agent-browser screenshot C:/Users/Administrator/.workbuddy/logs/linkedin-{DATE}-{N}.png

5. 随机等待（模拟真人节奏）
   agent-browser wait {RANDOM: 8000-20000}

6. 更新 CRM 状态
   通过 fumamx-crm 将该客户状态改为"已触达-LinkedIn"
```

---

### Step 3：批量限速规则

| 规则 | 限制 |
|------|------|
| 单批最大数量 | 20 条 |
| 每条之间等待 | 随机 8-20 秒 |
| 批间隔 | ≥ 30 分钟 |
| 单日上限 | 50 条（LinkedIn 风控阈值） |
| CAPTCHA | 立即停止，截图报告 |

---

### Step 4：结果汇总

每批完成后输出：

```
## LinkedIn 私信汇总 - {DATE}

发送成功：{N} 条
失败/跳过：{M} 条（原因：xxx）

成功列表：
- {姓名} | {公司} | {URL} | 状态：私信✅/连接请求✅
- ...

失败列表：
- {姓名} | {公司} | 原因：页面结构异常/CAPTCHA/按钮未找到
```

截图存档路径：`C:/Users/Administrator/.workbuddy/logs/linkedin-{DATE}-*.png`

---

## 消息个性化规则

从上游（Exa 背调结果）提取以下字段填入模板：

| 占位符 | 来源 |
|--------|------|
| `{FIRST_NAME}` | 决策人名字 |
| `{COMPANY}` | 公司名称 |
| `{INDUSTRY_KEYWORD}` | 行业关键词（如 "conveyor belt", "rubber belt" ） |
| `{PAIN_POINT}` | 可选，Exa 背调发现的业务痛点 |

**个性化程度要求**：每条消息至少包含 1 个与目标相关的定制内容（公司名或行业词），不能发完全相同的消息。

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| Session 过期 | 暂停，提示重新登录 |
| CAPTCHA 出现 | 立即停止本批，截图，等待用户处理 |
| 按钮未找到（页面改版） | 截图记录，跳过该目标，继续下一条 |
| 已达限速上限 | 停止，记录剩余队列，等待 30 分钟后继续 |
| 对方未开放私信 | 记录"仅可发连接请求"，改发连接+附言 |

---

## 与其他模块的关系

```
上游 → exa skill（搜索 LinkedIn 决策人 URL）
本流程 → linkedin skill（agent-browser 私信）
下游 → delivery-queue（邮件跟进）
      → fumamx-crm（更新客户状态）
```
