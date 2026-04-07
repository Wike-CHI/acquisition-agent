---
name: delivery-queue
version: 2.0.0
description: 消息分段发送技能。模拟真人发送节奏，避免被标记为垃圾信息。支持定时发送、drip campaign。支持邮件和WhatsApp双通道。
always: false
triggers:
  - 分段发送
  - 定时发送
  - drip campaign
  - 消息节奏
  - WhatsApp分段
  - channel whatsapp
---

# delivery-queue — 消息分段发送（v2.0 多通道版）

模拟真人发送节奏，避免被标记为垃圾信息。
**v2.0新增**：支持 `channel: whatsapp` 模式，通过wacli发送。

## 可执行脚本

本技能提供 Python 脚本（零第三方依赖），可直接管理发送队列：

```bash
# 添加邮件到队列
python scripts/queue_manager.py add --channel email --to "john@example.com" --subject "Hello" --body "Hi John, ..."

# 添加 WhatsApp 消息
python scripts/queue_manager.py add --channel whatsapp --to "+1234567890" --body "Hi John, ..."

# 查看队列状态
python scripts/queue_manager.py status

# 处理待发送（模拟节奏）
python scripts/queue_manager.py process [--dry-run]

# 取消/清理
python scripts/queue_manager.py cancel --id msg_xxx
python scripts/queue_manager.py clean

# 测试消息分段
python scripts/queue_manager.py segment --channel whatsapp --body "长消息内容..."
```

> 队列数据存储在 `~/.workbuddy/delivery_queue/queue.json`。脚本使用标准库，无需 `pip install`。

---

## 🎯 使用场景

| 场景 | 说明 |
|------|------|
| **长产品介绍** | 分成3-5条消息发送 |
| **跟进消息** | 定时发送（如客户本地时间9点） |
| **Drip Campaign** | 多天分批发送 |
| **避免垃圾标记** | 控制发送频率 |
| **WhatsApp分段** | 长消息拆分为多段，通过wacli分段发送 |

---

## ⚙️ 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `interval` | 300 | 消息间隔（秒） |
| `max_per_hour` | 5 | 每小时最多发送条数 |
| `max_per_day` | 30 | 每天最多发送条数 |
| `channel` | email | 发送通道：email / whatsapp |

---

## 📋 消息分段规则

### 邮件分段
- 每段不超过 200 字
- 间隔 5-15 分钟
- 标题和正文分开

### WhatsApp分段
- 每段不超过 300 字符
- 间隔 2-5 分钟
- 避免连续发送超过 3 条
- 发送失败自动重试（最多3次）
- 重试间隔： 30秒 → 60秒 → 120秒
- 3次失败后标记为发送失败

---

## ⚠️ 注意事项

1. **不要过度分段** - 保持消息完整性
2. **尊重时区** - 在客户工作时间发送
3. **避免垃圾模式** - 同一客户每小时最多5条消息
4. **自然语言** - 分段后保持对话流畅

---

## 📊 与其他技能配合

| 技能 | 配合方式 |
|------|----------|
| email-sender | 邮件发送前先分段 |
| whatsapp-outreach | WhatsApp消息发送前先分段 |
| sdr-humanizer | 分段后拟人化 |
| customer-intelligence | 根据客户评分调整发送策略 |

---

## 📋 命令

| 指令 | 功能 |
|------|------|
| `deliver:schedule` | 安排消息定时发送 |
| `deliver:list` | 查看待发送消息 |
| `deliver:cancel` | 取消待发送消息 |
| `deliver:flush` | 立即发送所有消息 |

---
_版本: 2.0.0_
_更新: 2026-04-06_
_新增: WhatsApp通道支持（channel: whatsapp）_
_依赖: wacli CLI (skill://WhatsApp)_
