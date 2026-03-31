---
name: linkedin
version: 2.0.0
description: LinkedIn AI-driven outreach via agent-browser. Search for decision makers, send connection requests and InMail messages. Uses agent-browser CLI for AI-controlled browser interaction (no Playwright scripts).
homepage: https://linkedin.com
metadata: {"clawdbot":{"emoji":"💼"}}
---

# LinkedIn 私信外联（AI 浏览器驱动）

> **搜索功能** → 改用 `exa` skill（Exa 索引 LinkedIn 公开档案，更稳定）
> **私信/连接请求** → 本 skill 负责，底层用 `agent-browser` CLI，由 AI 实时操控浏览器

---

## 前置条件

### 1. 安装 agent-browser

```bash
npm install -g agent-browser
agent-browser install
```

### 2. 首次登录（保存 Session）

```bash
agent-browser open https://www.linkedin.com/login --headed
# 手动在弹出窗口里完成登录
agent-browser state save C:/Users/Administrator/.workbuddy/sessions/linkedin-session.json
agent-browser close
```

> Session 文件保存后，后续操作无需重复登录，直接 `state load`。

---

## 核心操作 SOP

### SOP-1：给已知 LinkedIn 主页 URL 发私信

```
1. 加载 session
   agent-browser state load C:/Users/Administrator/.workbuddy/sessions/linkedin-session.json

2. 打开目标主页
   agent-browser open https://www.linkedin.com/in/{USERNAME}/

3. 快照，找到消息按钮
   agent-browser snapshot -i
   # 找到 button "Message" 或 "Connect"，记下 ref（如 @e12）

4. 点击消息按钮
   agent-browser click @e12

5. 等待消息框出现
   agent-browser wait --text "Write a message"

6. 快照，找到输入框
   agent-browser snapshot -i
   # 找到 textbox（输入框 ref，如 @e20）

7. 输入私信内容
   agent-browser fill @e20 "{MESSAGE_CONTENT}"

8. 发送
   agent-browser find role button click --name "Send"

9. 验证
   agent-browser wait --text "Message sent"
   agent-browser screenshot C:/Users/Administrator/.workbuddy/logs/linkedin-sent-{TIMESTAMP}.png
```

---

### SOP-2：发送连接请求（带附言）

```
1. 加载 session
   agent-browser state load C:/Users/Administrator/.workbuddy/sessions/linkedin-session.json

2. 打开目标主页
   agent-browser open https://www.linkedin.com/in/{USERNAME}/

3. 快照
   agent-browser snapshot -i

4. 点击 Connect 按钮
   agent-browser find role button click --name "Connect"

5. 等待对话框
   agent-browser wait --text "Add a note"

6. 点击 "Add a note"
   agent-browser find text "Add a note" click

7. 快照，找到附言输入框
   agent-browser snapshot -i

8. 填写附言（≤300字）
   agent-browser fill @e_note "{NOTE_CONTENT}"

9. 发送
   agent-browser find role button click --name "Send"

10. 验证 & 截图留存
    agent-browser screenshot C:/Users/Administrator/.workbuddy/logs/linkedin-connect-{TIMESTAMP}.png
```

---

### SOP-3：批量私信（队列模式）

批量操作时，**必须加随机延迟**，避免触发 LinkedIn 风控：

```
对每个目标（URL + 消息内容）循环执行：

1. agent-browser state load {SESSION_FILE}
2. agent-browser open {PROFILE_URL}
3. agent-browser wait 随机 3000-8000ms（agent-browser wait {RANDOM_MS}）
4. 执行 SOP-1 第3-9步
5. agent-browser wait 随机 5000-15000ms（发完等待，模拟真人节奏）
6. 记录结果到日志

建议每次会话不超过 20 条私信，间隔 ≥ 30 分钟再继续
```

---

## 私信内容模板（获客场景）

### 模板A：初次连接附言（≤300字）

```
Hi {FIRST_NAME},

I came across your profile while researching conveyor belt solution providers. 
We manufacture industrial belt splicing equipment at Honglong (holobelt.com) — 
used by 200+ factories across Asia.

Would love to connect and share our product overview when you have a moment.

Best,
Wike | Honglong Industrial
```

### 模板B：直接私信（决策人，已连接）

```
Hi {FIRST_NAME},

Hope this finds you well. I noticed {COMPANY} works with industrial conveyor systems 
— we specialize in belt splicing presses and cooling equipment for high-throughput lines.

We've helped similar operations cut belt replacement time by 40%. Happy to send over 
a quick spec sheet or arrange a call if relevant?

Best regards,
[Your Name] | Honglong Industrial Equipment
holobelt.com | [Your Mobile] (WhatsApp)
```

---

## AI 决策指引

执行 LinkedIn 私信任务时，AI 应按以下逻辑决策：

1. **检查 Session 是否有效**
   - `agent-browser state load {SESSION}` → 打开 linkedin.com/feed 验证是否已登录
   - 未登录 → 提示用户手动重新登录并保存 Session

2. **从 Exa 搜索结果中提取 LinkedIn URL**
   - Exa 返回的搜索结果通常包含 `linkedin.com/in/xxx` 格式的 URL
   - 提取后逐一放入私信队列

3. **消息个性化**
   - 从 Exa / 企业背调结果中提取：公司名、职位、行业
   - 填充模板中的 `{FIRST_NAME}`、`{COMPANY}` 占位符

4. **限速保护**
   - 每条之间随机等待 5-15 秒
   - 每批最多 20 条，批间隔 ≥ 30 分钟
   - 触发 CAPTCHA → 立即停止，通知用户

5. **结果记录**
   - 每条私信操作截图保存至 `logs/linkedin-sent-{DATE}-{N}.png`
   - 状态写入 fumamx-crm（客户节点更新为"已触达-LinkedIn"）

---

## 安全规则

- ❌ **绝对不自动发送**，每批发送前必须让用户确认消息内容
- ❌ 不接受/发送连接请求，除非用户明确指定
- ✅ 异常（CAPTCHA/登录过期/页面结构变化）时立即暂停并报告
- ✅ 所有发送操作截图存档

---

## Session 文件路径

```
C:/Users/Administrator/.workbuddy/sessions/linkedin-session.json
```

> 如果文件不存在，提示用户先执行首次登录流程（见"前置条件"第2步）
