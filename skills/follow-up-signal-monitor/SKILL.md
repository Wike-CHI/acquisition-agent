---
name: follow-up-signal-monitor
version: 1.0.0
description: >
  跟进信号监控系统 — 提案/邮件发出后，自动感知客户动静。
  覆盖：沉默检测（3/7/14/30天分级）、价值型跟进内容生成、IMAP邮件监控。
  当用户说「检查跟进信号」「客户没回复」「沉默检测」「提案后续」「跟进提醒」时使用。
triggers:
  - 检查跟进信号
  - 客户没回复
  - 沉默检测
  - 提案后续
  - 跟进提醒
  - 跟进监控
  - follow up
  - 客户还在沉默
  - 等客户回复
category: holo-acquisition
tags: [follow-up, signal, monitor, silence, email, CRM]
memory: null
---

# 跟进信号监控 v1.0.0

## 核心定位

提案发了、邮件发了，客户没回复——之前是干等，现在是系统自动感知。

**不是问「发没发」，是问「客户有没有动静」。**

---

## 架构

```
客户状态
  ├─ 已发提案（holo-proposal-generator）
  ├─ 已发开发信（cold-email-generator）
  └─ 已发初次触达

           ↓ 每天监控（cron或手动触发）

信号感知层
  ├─ IMAP邮件检查（新邮件？已读回执？）
  ├─ 沉默天数计时
  └─ 市场动态触发

           ↓

触发动作
  ├─ 沉默≥7天  → 生成价值型跟进草稿 → 业务员确认 → 发送
  ├─ 沉默≥14天  → 深度价值跟进
  ├─ 沉默≥30天  → 弱信号降级
  └─ 有新邮件   → 触发 inquiry-response

           ↓

CRM更新（sales-pipeline-tracker）
  ├─ 沉默第7天
  ├─ 已发送价值型跟进
  └─ 弱信号标记
```

---

## 沉默分级规则

| 天数 | 级别 | 定义 | 动作 |
|------|------|------|------|
| 0-3天 | 正常 | 客户可能正在内部审批 | 等待 |
| 4-6天 | 关注 | 轻度沉默，关注但不强打扰 | 偶有点击信号则升一级 |
| **7-13天** | **警戒** | 正常沉默上限，应触发价值型跟进 | 生成跟进内容草稿，等待业务员确认 |
| **14-29天** | **深度跟进** | 客户需要更多信息或理由 | 深度价值推送 |
| 30天+ | 弱信号 | 客户暂无需求，降低触达频率 | 标记弱信号，季度再联系 |

---

## 价值型跟进内容策略

### 原则：永远不重发一遍同样的内容

```
❌ 错误示范：
「您好，请问收到我的提案了吗？」  ← 这是在催，不是跟进

✅ 正确示范：
「给您发完方案后，注意到贵行业有个消息想分享一下...」
「有个和您情况类似的客户案例，想让您看看...」
「方案里有个付款方式可能更适合您的情况，给您更新版...」
```

---

### 分级跟进内容库

#### 7-13天跟进（价值型A）

**类型A1：市场情报推送**

```
Subject: [行业动态] 巴西皮带进口数据更新

Hi {{contact_name}},

上次给您发了 {{proposal_product}} 的方案后，注意到最近巴西工业皮带市场有些变化想跟您分享一下：

- 2024年Q4巴西皮带进口量同比增长 {{x}}%
- 中国对巴皮带出口价格走势 {{up/down}}
- 同行业 {{similar_company}} 刚完成扩产项目

这些信息可能对您目前的采购决策有帮助。需要的话我可以给您出一份更详细的分析。

Best,
{{your_name}}
```

**类型A2：案例匹配推送**

```
Subject: 和您情况类似的案例，想给您看看

Hi {{contact_name}},

上次给您发了方案后，想起我们正好有一个和您情况相近的项目：

- 客户：{{case_company}}（{{case_country}}）
- 项目：{{case_product}} 用于 {{case_application}}
- 结果：连续运转 {{case_months}} 个月零停机

如果对您有参考价值，我可以安排15分钟给您讲讲细节。

Best,
{{your_name}}
```

**类型A3：付款方式优化**

```
Subject: 方案更新 — 付款方式有更灵活的选择

Hi {{contact_name}},

上次给您发的方案里，付款方式是 T/T 30%/70%。考虑到您那边可能有一些资金周转的考虑，我特意申请了一个更灵活的方案：

T/T 20% deposit + 80% before shipment，附带2年质保延期。

这个方案我们通常只给长期合作客户申请。您的情况我觉得可以特殊申请试试。

有兴趣的话，我们约个电话聊聊？

Best,
{{your_name}}
```

---

#### 14-29天跟进（价值型B）

**类型B1：技术澄清**

```
Subject: 关于您可能在犹豫的技术问题

Hi {{contact_name}},

上次发完方案后，我估计您可能在几个技术细节上有疑问。我整理了几个我们客户最常问的问题：

Q1: {{common_technical_question_1}}
Q2: {{common_technical_question_2}}
Q3: {{common_technical_question_3}}

有其他问题欢迎直接问我。

Best,
{{your_name}}
```

**类型B2：紧迫感（真实）**

```
Subject: 提醒 — 上次的方案下周到期

Hi {{contact_name}},

提醒您一下，上次给您发的方案（编号 {{quote_id}}）有效期到 {{expiry_date}}。

如果还需要调整的话，这周告诉我还来得及。过了有效期，价格和货期可能需要重新确认。

不着急，如果您已经有其他选择，也告诉我一声，省得我继续打扰您。

Best,
{{your_name}}
```

**类型B3：主动示弱（软着陆）**

```
Subject: 一个简单的问题

Hi {{contact_name}},

上个月给您发了 {{proposal_product}} 的方案，想确认一下：

您有没有把这个项目暂时搁置？如果是的话，我就不再打扰您了，把这个案子在我的系统里标注一下就行。

如果不是，我还是很乐意继续跟进这个项目的。

Best,
{{your_name}}
```

---

## 技术实现

### IMAP邮件监控

通过163邮箱IMAP检查：

```python
import imaplib, email
from email.header import decode_header

def check_inbox(user, password, folder='INBOX'):
    """检查163邮箱收件箱，返回未读邮件列表"""
    mail = imaplib.IMAP4_SSL('imap.163.com', 993)
    mail.login(user, password)
    mail.select(folder)

    # 搜索未读邮件
    status, messages = mail.search(None, 'UNSEEN')
    mail_ids = messages[0].split()

    results = []
    for mail_id in mail_ids:
        status, msg_data = mail.fetch(mail_id, '(RFC822)')
        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)

        # 解析发件人、主题、时间
        subject = decode_str(msg['Subject'])
        from_ = decode_str(msg['From'])
        date = msg['Date']

        results.append({
            'subject': subject,
            'from': from_,
            'date': date,
        })

    mail.logout()
    return results
```

### 沉默天数计算

```python
from datetime import datetime, timedelta

SILENCE_TIERS = {
    'normal':       (0,  3),   # 正常等待
    'attention':    (4,  6),   # 轻度关注
    'warning':      (7,  13),  # 价值型跟进
    'deep':         (14, 29),  # 深度跟进
    'weak':         (30, 999), # 弱信号
}

def get_silence_tier(last_contact_date):
    days = (datetime.now() - last_contact_date).days
    for tier, (min_d, max_d) in SILENCE_TIERS.items():
        if min_d <= days <= max_d:
            return tier, days
    return 'weak', days
```

### 跟进草稿生成

```python
def generate_followup_tier(tier, client_info):
    """根据沉默级别生成对应的跟进内容"""
    if tier == 'warning':
        return random.choice([
            followup_A1_market_intel(client_info),
            followup_A2_case_match(client_info),
            followup_A3_payment_option(client_info),
        ])
    elif tier == 'deep':
        return random.choice([
            followup_B1_technical(client_info),
            followup_B2_expiry_reminder(client_info),
            followup_B3_soft_landing(client_info),
        ])
    elif tier == 'weak':
        return None  # 标记弱信号，不主动跟进
```

---

## CRM集成

每次触发跟进后，更新 sales-pipeline-tracker 中的客户状态：

```
客户 Belttech (Brazil)
  ├─ 提案发出：2026-04-09
  ├─ 沉默天数：12天
  ├─ 当前级别：warning（警戒）
  ├─ 跟进草稿：已生成（A2案例推送）
  ├─ 跟进状态：待确认
  └─ 下次检查：2026-04-23
```

---

## 使用方式

### 手动触发（业务员随时可以检查）

```
业务员：检查跟进信号
系统：
  ① 正在检查所有进行中的客户状态...
  ② 发现 3 个客户进入警戒阶段（沉默7-13天）
  ③ 正在生成跟进草稿...

  ┌─────────────────────────────────────────┐
  │ Belttech (巴西) — 沉默12天               │
  │ 推荐跟进类型：A2 案例匹配推送              │
  │ 关联案例：智利铜矿项目                    │
  │                                        │
  │ 【跟进草稿预览】                          │
  │ Subject: 和您情况类似的案例，想给您看看    │
  │ ...                                     │
  │                                        │
  │ [确认发送]  [修改内容]  [跳过本次]        │
  └─────────────────────────────────────────┘
```

### 定时自动（每日cron）

每天早上9点自动检查，对所有「警戒」和「深度跟进」客户生成草稿但不发送（需要业务员确认）。

---

## 依赖

- Python标准库：imaplib、email、datetime、json
- CRM集成：sales-pipeline-tracker
- 邮件发送：email-sender（163 SMTP）

---

## 文件结构

```
follow-up-signal-monitor/
├── SKILL.md                    # 本文件
├── references/
│   ├── signal-templates.md      # 价值型跟进模板（6类型×4语种）
│   └── silence-rules.md         # 沉默天数规则+触发逻辑
└── scripts/
    └── monitor.py              # 核心监控脚本（IMAP+天数计算+草稿生成）
```

---

## 版本历史

- v1.0.0 (2026-04-14) — 初版，5级沉默检测、3类价值型跟进内容、IMAP邮件监控、CRM集成
