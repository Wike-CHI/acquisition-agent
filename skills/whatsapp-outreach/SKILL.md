---
name: whatsapp-outreach
version: 2.0.0
description: WhatsApp触达技能。通过wacli发送WhatsApp消息触达客户，支持文本、文件、产品目录、批量发送。适用于有WhatsApp号码的海外客户。
always: false
triggers:
  - WhatsApp
  - 发WhatsApp
  - WhatsApp消息
  - wa消息
  - whatsapp outreach
  - 智能触达
  - 多渠道触达
  - 批量发送
---

# whatsapp-outreach — WhatsApp触达 v2.0

> 基于wacli CLI的WhatsApp消息触达能力，集成进HOLO获客系统的触达层。
> v2.0 更新：加入实战验证的批量发送流程、JID格式优化、号码搜索脚本。

---

## 🎯 使用场景

| 场景 | 说明 |
|------|------|
| **WhatsApp直联** | 客户留有WhatsApp号码，直接发送消息 |
| **渠道降级** | 邮件发不了时，降级到WhatsApp |
| **多渠道触达** | 邮件+WhatsApp双通道触达 |
| **文件/目录发送** | 发产品PDF、报价单、企业画册 |
| **快速跟进** | 已有WhatsApp对话的客户，直接跟进 |

---

## 📋 消息风格规范

**WhatsApp ≠ 邮件开发信！** 必须遵守以下风格规则：

| 规则 | 说明 |
|------|------|
| **长度** | 50-150词，不超过手机一屏 |
| **语气** | 半正式（semi-formal），比邮件轻松但保持专业 |
| **Emoji** | 可用1-2个，不要过度（🤝 ✅ 📋 可接受，❌🎉🔥 不用） |
| **段落** | 每段1-2句话，用空行分隔 |
| **CTA** | 明确但不过于推销（"Shall I send you our catalog?" 而非 "BUY NOW"） |
| **开头** | 直呼名字，不用Dear/Sir（"Hi Ahmed," 而非 "Dear Mr. Ahmed,"） |
| **结尾** | 简短落款（"- Wike, Honglong Industrial" 一行即可） |

### 消息模板

#### 模板1：首次触达（渠道商/集成商）

```
Hi {name},

I'm Wike from Honglong Industrial — we manufacture conveyor belt processing equipment (slitting, splicing, skiving machines) in China.

I noticed {company} works with conveyor systems in Saudi Arabia. We're looking for a reliable channel partner in the region.

Would you be open to reviewing our product catalog?

- Wike, Honglong Industrial
```

#### 模板2：首次触达（终端用户）

```
Hi {name},

I'm Wike from Honglong Industrial. We make conveyor belt processing equipment — slitting machines, splicing presses, and skiving tools.

I understand {company} operates conveyor systems. Our machines help reduce belt maintenance costs by up to 40%.

Shall I share our latest catalog?

- Wike, Honglong Industrial
```

#### 模板3：跟进（已发邮件无回复）

```
Hi {name},

I sent an email last week about our conveyor belt equipment. Just wanted to follow up here — happy to answer any questions directly.

Our machines are used by distributors in 30+ countries.

- Wike
```

#### 模板4：产品目录/报价发送（带文件）

```
Hi {name},

Here's our product catalog as promised. Key highlights:
- Air-cooled splicing presses (300-3600mm)
- Water-cooled presses for heavy-duty belts
- Complete skiving & slitting solutions

Happy to discuss specific models for your needs.

- Wike
```

---

## 🔧 执行流程

```
客户有WhatsApp号码？
  ├─ 是 → 检查wacli认证状态
  │        ├─ 已认证 → 生成WhatsApp风格消息 → 确认 → 发送
  │        └─ 未认证 → 提示用户执行 wacli auth
  └─ 否 → 尝试搜索号码（search_whatsapp.py）→ 找到则继续 / 找不到降级到邮件
```

### 单条发送流程

1. **号码验证**：确认客户号码格式（国际格式，如 +966xxxxxxxxx）
2. **消息生成**：根据客户背景+产品匹配度生成WhatsApp风格消息
3. **消息评分**：评分≥8.0分才发送（WhatsApp容忍度比邮件低）
4. **用户确认**：展示消息内容+收件人，等待用户确认
5. **发送**：`wacli send text --to "号码@s.whatsapp.net" --message "消息"`
6. **文件发送**（可选）：`wacli send file --to "号码@s.whatsapp.net" --file /path/file.pdf --caption "说明"`

### 批量发送流程（已验证）

> 实战数据：2026-04-06 沙特客户 8/8 全部成功

```
Step 1: 搜索号码
  └─ 运行 search_whatsapp.py 从 DuckDuckGo 搜索客户 WhatsApp 号码
  └─ 结果保存到 whatsapp_search_results.json

Step 2: 更新 Pipeline
  └─ 将找到的号码回填到 Excel Pipeline

Step 3: 批量发送
  └─ 运行 whatsapp_bulk_send.py --yes
  └─ 自动读取 Excel 中有号码的客户
  └─ 按行业选择消息模板，个性化生成
  └─ 每条间隔 30-60 秒随机延迟
  └─ 发送完成自动更新 Excel 状态为「已WhatsApp触达」

Step 4: 结果汇总
  └─ 发送结果保存到 whatsapp_send_results.json
  └─ Excel 状态列更新
```

### 相关脚本

| 脚本 | 路径 | 用途 |
|------|------|------|
| `search_whatsapp.py` | workspace 根目录 | 搜索客户 WhatsApp 号码 |
| `whatsapp_bulk_send.py` | `skill://whatsapp-outreach/scripts/whatsapp_bulk_send.py` | 批量发送 WhatsApp 消息（含锁清理+自动重试） |

**推荐使用脚本发送**，脚本已内置：
- 发送前自动停止残留 wacli 进程
- 自动清理 `~/.wacli/LOCK` 残留文件
- 锁冲突时自动重试（最多2次）
- 发送间隔 30-60 秒安全控制

---

## ⚙ 配置

```yaml
# WhatsApp触达配置
max_message_length: 500       # 单条消息最大字符数
quality_score_min: 8.0        # 消息最低评分（满分10分）
quiet_hours:                  # 静默时段（沙特时间）
  start: "23:00"              # UTC+3
  end: "08:00"
max_daily_per_contact: 3      # 每天每个联系人最多3条
follow_up_delay_hours: 48     # 跟进消息最少间隔48小时
```

---

## 🔗 与其他技能配合

| 技能 | 配合方式 |
|------|----------|
| cold-email-generator | 邮件优先，WhatsApp作为补充/降级渠道 |
| email-sender | 邮件发不了时降级到WhatsApp |
| delivery-queue | 共用分段队列，channel=whatsapp |
| customer-intelligence | 根据ICP评分决定是否用WhatsApp触达 |
| honglong-products | 发送产品PDF文件 |

---

## 📊 渠道选择逻辑

```
客户联系方式？
  ├─ 有邮箱 + 有WhatsApp → 双通道触达（先邮件，48h后WhatsApp跟进）
  ├─ 只有邮箱 → 邮件触达
  ├─ 只有WhatsApp → WhatsApp触达
  └─ 都没有 → 跳过，记录到Pipeline
```

---

## ⚠️ 安全铁律

1. **禁止群发**：每条消息必须个性化，禁止模板群发
2. **频率控制**：同一联系人每天最多3条，间隔≥2小时
3. **静默时段**：对方当地时间22:00-08:00不发送
4. **内容审核**：发之前必须让用户确认
5. **号码格式**：必须使用国际格式（+国家代码+号码）
6. **回复即停**：客户回复后停止自动跟进，转人工对话
7. **拉黑处理**：消息发送失败或被标记为垃圾 → 立即停止该联系人所有触达

---

## 🔍 wacli 命令参考

### 认证与连接

```bash
wacli auth                    # QR码登录（手机 WhatsApp → 设置 → 关联设备 → 扫码）
wacli doctor                  # 检查连接状态（AUTHENTICATED/CONNECTED/FTS5）
```

### 发送消息（关键技巧）

```bash
# ✅ 推荐：用 JID 格式直接发送，跳过号码查询，不会超时
wacli send text --to "966501234567@s.whatsapp.net" --message "消息内容"

# ❌ 容易超时：用国际号码格式，需要先查询号码是否注册
wacli send text --to "+966501234567" --message "消息内容"

# JID 格式规则：去掉 + 号，拼接 @s.whatsapp.net
# +966501234567 → 966501234567@s.whatsapp.net
# +8613112345678 → 8613112345678@s.whatsapp.net
```

### 发送文件

```bash
wacli send file --to "966501234567@s.whatsapp.net" --file /path/file.pdf --caption "文件说明"
```

### 同步聊天

```bash
wacli sync                    # 一次性同步
wacli sync --follow           # 持续同步（后台运行）
```

### 查找

```bash
wacli chats list --limit 20 --json
wacli messages search "关键词" --limit 20
```

### ⚠️ 重要注意事项

1. **sync 和 send 不能同时运行** — 发消息前必须停止 sync 进程
2. **JID 格式避免超时** — 始终用 `号码@s.whatsapp.net` 格式
3. **QR 码有效期约 20 秒** — 认证时需要用户快速扫码
4. **Windows 环境** — wacli 需要编译自源码（CGO_ENABLED=1），见 MEMORY.md
5. **LOCK 文件残留问题** — `wacli sync --follow` 被 kill 后，`~/.wacli/LOCK` 文件可能残留导致后续所有 send 失败（报错含 "lock"）。解决方案：
   ```bash
   # 手动清理锁文件
   Stop-Process -Name wacli -Force
   Remove-Item ~/.wacli/LOCK -Force
   # 重试发送
   ```
   **whatsapp_bulk_send.py 已内置自动清理锁 + 重试逻辑**，优先使用脚本发送。

---

_版本: 2.0.0_
_更新: 2026-04-06_
_依赖: wacli CLI_
_实战验证: 2026-04-06 沙特客户 8/8 批量发送成功_
