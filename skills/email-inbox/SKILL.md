---
name: email-inbox
version: 1.0.0
description: 邮件收件检测技能。通过IMAP连接企业邮箱，检测客户回复和询价，自动触发CRM更新和日志记录。当用户需要：(1) 检查邮箱 (2) 查看新邮件 (3) 监听客户回复 时使用此技能。
always: false
triggers:
  - 检查邮箱
  - 查看邮件
  - 有新邮件吗
  - 收件箱
  - 客户回复
  - 有客户回信吗
  - 收到回复了吗
  - email inbox
  - check email
  - unread
  - new email
  - email received
---

# 邮件收件检测技能

通过IMAP连接企业邮箱，检测客户回复，自动记录日志并更新CRM。

---

## 一、邮箱配置

### 支持的邮箱服务

| 服务商 | IMAP服务器 | 端口 | SSL |
|--------|-----------|------|-----|
| **163邮箱** | imap.163.com | 993 | ✅ |
| **QQ邮箱** | imap.qq.com | 993 | ✅ |
| **126邮箱** | imap.126.com | 993 | ✅ |
| **Gmail** | imap.gmail.com | 993 | ✅ |
| **Outlook** | outlook.office365.com | 993 | ✅ |
| **阿里企业邮箱** | imap.aliyun.com | 993 | ✅ |
| **腾讯企业邮箱** | imap.exmail.qq.com | 993 | ✅ |

### 配置参数

```yaml
email: "your@email.com"      # 邮箱地址
imap_server: "imap.xxx.com"  # IMAP服务器
imap_port: 993              # 端口（默认993）
auth_code: "xxxxxx"         # 授权码（不是密码！）
```

---

## 二、核心功能

### 2.1 检查收件箱

```
用户：检查一下邮箱
→ 连接IMAP服务器
→ 获取最新邮件列表
→ 按时间/发件人/主题排序
→ 返回摘要报告
```

### 2.2 智能邮件分类

| 类型 | 识别关键词 | 处理方式 |
|------|-----------|---------|
| **客户回复** | Re:, 回复, Thank you, inquiry | 记录日志 + 更新CRM |
| **询价请求** | quote, price, brochure, 报价 | 标记优先级 + 触发报价流程 |
| **自动回复** | Auto Reply, Out of Office | 跳过不处理 |
| **垃圾邮件** | 推销, spam, unsubscribe | 标记垃圾 |

### 2.3 新邮件通知

| 场景 | 触发条件 |
|------|---------|
| 客户回复开发信 | 发件人匹配CRM客户 |
| 新询价 | 主题含询价关键词 |
| 紧急邮件 | 关键词：紧急, urgent, asap |

---

## 三、调用方式

### 手动检查

```
用户：检查邮箱
→ 加载 email-inbox skill
→ 执行 check_inbox.ps1
→ 返回邮件列表
→ 记录日志
```

### 自动化轮询（可选）

创建自动化任务定期检查：

```yaml
# 每30分钟检查一次
schedule: "每30分钟"
task: "检查邮箱并记录日志"
```

---

## 四、邮件数据结构

```json
{
  "email_id": "12345",
  "from_address": "buyer@company.com",
  "from_name": "John Smith",
  "subject": "Re: HOLO Belt Splice Machine Inquiry",
  "preview": "Thank you for your quotation...",
  "date": "2026-04-10 14:30:00",
  "is_read": false,
  "is_reply": true,
  "intent": "reply",
  "priority": "high"
}
```

---

## 五、日志记录

### 5.1 自动埋点（与 holo-activity-log 集成）

每次检查邮箱后，自动记录到活动日志：

| 场景 | action_type | 示例 |
|------|-------------|------|
| 检查收件箱 | `inbox_check` | 检查了邮箱 |
| 发现客户回复 | `email_reply` | 客户ABC回复了 |
| 发现新询价 | `email_inquiry` | 新询价：报价请求 |

**自动埋点参数**：
```yaml
skill_name: email-inbox
action_type: inbox_check / email_reply / email_inquiry
customer: "{{发件人公司}}"
result: success / partial
notes: "{{邮件摘要}}"
```

### 5.2 日志记录格式

```
timestamp: 2026-04-10 16:45:00
device_id: Administrator@192.168.0.170
skill_name: email-inbox
action_type: email_reply
customer: National Cement Ethiopia
result: success
notes: 回复主题：Re: Belt Splice Machine Inquiry
```

---

## 六、错误处理

| 错误 | 原因 | 处理方式 |
|------|------|---------|
| 连接失败 | IMAP服务器/端口错误 | 提示检查配置 |
| 认证失败 | 授权码错误 | 提示重新获取授权码 |
| 超时 | 网络问题 | 重试3次后记录失败日志 |

---

## 七、安全注意

> ⚠️ **重要**：邮箱凭据通过对话传递，不存储在文件中
>
> 授权码 ≠ 邮箱密码，需在邮箱设置中单独生成
