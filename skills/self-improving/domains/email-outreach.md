# Domain Memory — B2B 邮件外联（Email Outreach）

> **Namespace:** domains/email-outreach
> **首次建立：** 2026-03-31（红龙获客系统实战提炼）
> **适用范围：** B2B 外贸海外获客邮件

---

## Python SMTP 发送最佳实践

### 163 邮箱配置

```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header

SMTP_CONFIG = {
    "host": "smtp.163.com",
    "port": 465,        # SSL 端口
    "username": "xxx@163.com",
    "password": "授权码",  # ⚠️ 必须是授权码，不是登录密码
    "use_ssl": True,
}

# 连接方式
smtp = smtplib.SMTP_SSL(host, port)
smtp.login(username, password)
```

**常见错误：**
- `535 Auth Failed` → 使用了登录密码，改用授权码（邮箱设置 → POP3/SMTP → 开启服务 → 获取授权码）
- `421 Too many` → 发送太频繁，每封间隔至少 15 秒

### 邮件构建模板

```python
msg = MIMEMultipart("alternative")
msg["Subject"] = Header(subject, "utf-8")
msg["From"] = f"姓名 <邮箱>"
msg["To"] = recipient_email
msg["Date"] = datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0800")
msg.attach(MIMEText(body, "plain", "utf-8"))
smtp.sendmail(sender, [recipient], msg.as_string())
```

### 批量发送脚本结构（CLI 参数控制）

```python
# 多批次用 CLI 参数控制
if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "day5"
    if mode == "day5":
        send_batch(FOLLOWUP_DAY5, "第5天跟进")
    elif mode == "day14":
        send_batch(FOLLOWUP_DAY14, "第14天最终")
```

---

## B2B 多触达节奏（已验证）

```
D0  → 正式开发信（个性化，提具体价值点）
D3  → LinkedIn 连接请求（不发消息，先加人）
D5  → 第一封跟进邮件（简短，降低门槛，问一个问题）
D7  → WhatsApp 产品图/视频（如有号码）
D14 → 最终邮件（明确是最后一封，优雅收尾，留联系方式）
```

---

## 开发信写作原则（已验证）

### D0 正式开发信
- 开头：称呼 + 我注意到你们的业务（具体，如"看到贵司进口了14000+次皮带相关产品"）
- 中间：一句话说清楚我们是谁 + 我们能解决什么问题
- 结尾：明确的 CTA（一个低门槛行动，如"能否发一份产品手册？"）
- 长度：≤200 词，不超过 5 段

### D5 跟进邮件
- 开头：直接说"follow up on my previous email"，不解释太多
- 核心：给一个新的价值点或更低门槛的行动（"只需2分钟看一下对比表"）
- 备选路径：若不是对的人，问"能否指引我联系对的人？"
- 长度：≤150 词

### D14 最终邮件
- 明确：这是最后一封
- 保持大门开着：留联系方式，说欢迎未来联系
- 无压力：不要催促或抱怨
- 长度：≤100 词

---

## 邮件主题行公式

```
[产品品类] Supplier from China | [公司名或具体产品]
Follow-up: [具体主题] for [客户公司名]
Last note: HONGLONG [产品] — [客户简称]
```

---

## WorkBuddy 自动化集成

### 创建一次性定时邮件任务

```
automation_update 参数：
- mode: "suggested create"
- scheduleType: "once"
- scheduledAt: "2026-04-05T09:00"   # ISO 8601，不需要 rrule
- cwds: "C:/项目目录"
- prompt: "cd '目录' && python follow_up_emails.py day5"
- status: "ACTIVE"
```

### 多阶段触达完整任务 ID 命名规范

| 阶段 | ID | 说明 |
|------|----|------|
| D0群发 | d0 | 正式开发信 |
| D3提醒 | d3-linkedin | LinkedIn 手动操作提醒 |
| D5跟进 | d5 | 自动发跟进邮件 |
| D14最终 | d14 | 自动发最终邮件 |

---

## 市场语言策略

| 市场 | 邮件语言 | 主要痛点切入 |
|------|---------|------------|
| 越南 | 英语 | 皮带维护成本高，设备帮助降成本 |
| 马来西亚 | 英语 | 区域代理独家权益 + 技术支持 |
| 印度 | 英语 | 设备精度（±1°C 温度均匀性）+ 质量一致性 |
| 巴西 | 英语（葡语更佳） | 价格比欧洲低 30-40%，CE 认证同等质量 |
| 智利/墨西哥 | 西班牙语优先 | 智利强调矿山应用；墨西哥强调快速交货 |
| 埃及 | 英语 | WhatsApp 联系优先于邮件 |
