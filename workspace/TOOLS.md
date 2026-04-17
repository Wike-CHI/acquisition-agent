# TOOLS.md — 红龙获客系统工具配置

## 邮件发送（163邮箱 SMTP）

### 配置
- **发送脚本**: `/tmp/sender.mjs`（nodemailer）
- **凭证**: 环境变量 `HOLO_SMTP_USER` / `HOLO_SMTP_PASS` 注入
- **SMTP**: smtp.163.com:465 (SSL)
- **发送邮箱**: wikeye2025@163.com

### 使用方式
```javascript
// 凭证通过环境变量注入，不写死在代码里
process.env.HOLO_SMTP_USER  // wikeye2025@163.com
process.env.HOLO_SMTP_PASS  // 163邮箱授权码
```

### 发送命令
```bash
# 终端测试
node /tmp/sender.mjs --to "客户邮箱" --subject "邮件主题" --body "正文"
```

## WhatsApp（wacli）

### 状态
✅ 已配置可用

### 发送方式
```bash
wacli send --phone "+86138xxxx" --message "消息内容"
```

### 规则
- 72h 窗口内: 可主动推送
- 72h 窗口外: 必须客户先回复，否则切换 Email
- 每次发送间隔 > 10 秒
- 不发纯数字验证码类内容

### 市场优先级
| 市场 | 主渠道 | 次渠道 |
|------|--------|--------|
| 非洲（尼日利亚/肯尼亚/加纳）| **WhatsApp** | Email |
| 中东（沙特/阿联酋）| **WhatsApp** | Email / LinkedIn |
| 东南亚（越南/菲律宾/印尼）| **WhatsApp** | Email |
| 拉美（巴西/智利/阿根廷）| **WhatsApp** | Email |
| 南亚（印度/巴基斯坦）| **WhatsApp** | Email |
| 欧洲（德国/法国/意大利）| **Email** | WhatsApp / LinkedIn |
| 独联体（俄罗斯/哈萨克）| **Telegram** | Email / WhatsApp |
| 伊朗 | **Telegram** | Email |

## Telegram Bot

### 状态
⚠️ 待配置（Bot Token 未设置）

### 配置方法
1. @BotFather 创建 Bot，获取 Token
2. 配置到环境变量 `TELEGRAM_BOT_TOKEN`
3. 更新技能 `telegram-toolkit`

### 适用场景
- 俄罗斯/独联体市场优先渠道
- 大文件（PDF catalog > 10MB / 视频 / 认证文档）
- 正式文件（合同 / PI）发送

## LinkedIn

### 状态
⚠️ 待配置（Cookie 未注入）

### 适用场景
- 欧洲市场 B2B 触达
- 决策人搜索
- 企业主页研究

## CRM（孚盟 MX）

### 状态
⚠️ 未连通（未登录）

### 技能
- `fumamx-crm` — 孚盟 MX CRM 自动化操作
- 支持: 客户管理 / 查询 / 创建 / 更新 / 筛选 / 发送邮件

### 备选
- **Google Sheets Pipeline** — `C:/Users/Administrator/WorkBuddy/` 路径
- 字段: name / company / whatsapp / email / country / language / status / source / icp_score / lead_tier / product_interest / created_at / last_contact / next_action / notes

## Exa 搜索

### 状态
✅ 已配置（免费版）

### 工具
- `exa-web-search-free` — 必须通过 `mcporter` 调用
- `web_search_exa` — MCP 工具（最稳定）
- `crawling_exa` / `web_search_advanced_exa` — ⚠️ 经常报 "Tool not found"

### 使用
```bash
mcporter exa search --query "客户公司名 + procurement"
```

## 网页内容获取

### 工具优先级
1. `r.jina.ai` — 最稳定，用于读取官网
2. `browser-automation` — 动态页面
3. 直接 curl — 简单页面

### 官网研究（Layer 1）
```
curl -H "Accept: text/html" "https://r.jina.ai/https://客户官网.com"
```

## NAS 挂载

### 状态
⚠️ 未挂载

### 挂载命令（Windows）
```powershell
net use Y: \\192.168.0.194\home /user:HOLO-AGENT Hl88889999
```

### 用途
- 产品图片、视频目录
- 原始技术文档
- 认证文件库

## 开发信发送

### 流程
1. `cold-email-generator` 生成个性化开发信
2. `sdr-humanizer` 去 AI 味
3. 评分 ≥ 9.0 才发送
4. `163-email-sender` / `/tmp/sender.mjs` 发送
5. `delivery-queue` 控制节奏

### 4步序列
| 步次 | 时间 | 内容类型 |
|------|------|---------|
| Day 0 | 首日 | 个性化开场 |
| Day 3 | 第3天 | 价值型跟进 |
| Day 7 | 第7天 | 直接诉求 |
| Day 14 | 第14天 | 最终跟进 |

## 报价系统

### 技能
- `smart-quote` — 先背调后报价，给利润率范围
- `quotation-generator` — PDF 形式发票
- `holo-proposal-generator` — 数字提案包 PDF

### 流程
```
客户问价 → 锁对话 → 背调 → 利润率区间 → 老板审批 → 发送报价 → CRM 更新
```

### 报价后追踪
| 天数 | 动作 |
|------|------|
| Day 0 | 报价发出 |
| Day 3 | 无回复 → 跟进 |
| Day 7 | 无回复 → 第二轮跟进 |
| Day 14 | 无回复 → 最终跟进或移入 nurture |

## Cron 自动任务

### 状态
✅ 7 个定时任务运行中

| 任务 | 频率 |
|------|------|
| HEARTBEAT（Pipeline 巡检）| 每 15 分钟 |
| 线索发现 | 定时 |
| 邮件序列 Day3/7/14 | 定时 |
| CRM 备份 | 定时 |
| 竞品监控 | 定时 |
| 周度培育 | 每周 |

详见 `HEARTBEAT.md`
