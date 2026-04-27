# HEARTBEAT.md — 红龙获客系统 Pipeline 自动巡检

> 红龙获客系统的定时自动化心跳任务。Cron 触发后逐项检查，有问题才报告，无问题回复 HEARTBEAT_OK。
> 基于 B2B-SDR template v2026.4.24 的 14 项心跳改造，适配红龙业务场景。
> 最后更新：2026-04-27

---

## 运行规则

- **触发频率**：主 Cron 每 15 分钟一次，每次心跳执行全部 14 项检查
- **报告格式**：有问题列出详情 + 建议动作，无问题只回复 `HEARTBEAT_OK`
- **执行顺序**：按编号顺序执行，遇到需要阻塞的重大事项（报价超时）立即升级

---

## 1. 新线索检查

**触发**：每次心跳
**对应 Pipeline**：阶段1 Lead Capture
**逻辑**：读取 CRM，找到 `created_at = 今天 AND status = new` 的记录

**报告格式**：
```
[新线索] 找到 X 条
1. [公司名] | [国家] | [产品兴趣] | 来源：[来源]
...
建议：对每条执行 ICP 评分 → 决定发邮件还是进入培育池
```

---

## 2. 停滞线索检查

**触发**：每次心跳
**对应 Pipeline**：阶段2-6 全流程
**逻辑**：读取 CRM，找到 `status IN (contacted, interested, quote_sent, negotiating) AND last_contact > 5个工作日`

**报告格式**：
```
[停滞线索] 找到 X 条（>5工作日无互动）
1. [公司名] | [国家] | 当前阶段：[stage] | 最后联系：[日期]
...
建议：生成跟进消息草稿
```

---

## 3. 报价追踪

**触发**：每次心跳
**对应 Pipeline**：阶段5 Quotation
**逻辑**：读取 CRM，找到 `status = quote_sent AND last_contact > 3个工作日`

**报告格式**：
```
[报价追踪] 找到 X 条（报价发出 >3天无反馈）
1. [公司名] | 报价单号：[编号] | 发出日期：[日期]
建议：发送跟进消息（价值强化，不提价格）
```

---

## 4. 今日行动提醒

**触发**：每次心跳
**对应 Pipeline**：阶段2-8 全流程
**逻辑**：读取 CRM，找到 `next_action 包含今天日期` 的记录

**报告格式**：
```
[今日行动] 找到 X 条
1. [公司名] | 行动：[next_action内容]
建议：确认准备完毕
```

---

## 5. 培育 / 休眠 / 流失 检查

**触发**：每周一 08:30
**对应 Pipeline**：阶段8 Nurture
**逻辑**：
- `status = nurture AND last_contact > 14天` → 建议培育触达
- `status = closed_won AND last_contact > 30天` → 建议售后关怀
- `status = closed_lost AND last_contact > 90天` → 建议季度跟进

**报告格式**：
```
[培育检查]
- nurture待激活（>14天）：X 条
- closed_won待关怀（>30天）：X 条
- closed_lost待跟进（>90天）：X 条
```

---

## 6. 数据质量检查

**触发**：工作日每日一次
**对应 Pipeline**：阶段3 CRM Entry
**逻辑**：
- `whatsapp 为空 AND status NOT IN (closed_won, closed_lost)` → 缺失联系方式
- `icp_score 为空 AND status != new` → 缺失评分
- `email 包含 info@/sales@/contact@` → 泛用邮箱，标记需替换

**报告格式**：
```
[数据质量] 找到 X 条需补充
- 缺失 WhatsApp/邮箱：X 条
- 缺失 ICP 评分：X 条
- 泛用邮箱待替换：X 条
建议：优先补充 hot_lead 和 warm_lead 的数据
```

---

## 7. 邮件序列检查

**触发**：每日 11:00
**对应 Pipeline**：阶段9 Email Outreach
**逻辑**：读取 CRM，找到 `status = email_sent` 的记录：

| 条件 | 动作 |
|------|------|
| Day 3 无回复 | 发送跟进邮件 #2（价值型） |
| Day 7 无回复 | 发送跟进邮件 #3（直接诉求） |
| Day 14 无回复 | 发送最终跟进，移动到 nurture |
| 有回复 | 更新状态为 `email_replied`，通知 owner |

**报告格式**：
```
[邮件序列]
- Day 3 待跟进：X 封
- Day 7 待跟进：X 封
- Day 14 最终跟进：X 封
- 新回复（待处理）：X 封
```

---

## 8. 线索发现

**触发**：每日 10:00
**对应 Pipeline**：阶段1 Lead Capture（主动）
**逻辑**：按星期轮换目标市场，执行 Exa 搜索发现新客户：

| 星期 | 目标市场 |
|------|---------|
| 周一 | 非洲（尼日利亚/肯尼亚/坦桑尼亚） |
| 周二 | 非洲（加纳/南非/埃塞俄比亚） |
| 周三 | 中东（沙特/阿联酋/伊朗） |
| 周四 | 东南亚（菲律宾/越南/印尼） |
| 周五 | 拉美（巴西/智利/阿根廷） |
| 周六 | 南亚（印度/巴基斯坦/孟加拉） |
| 周日 | 欧洲 + 其他 |

**搜索模板**：
```
"conveyor belt buyers [country] 2026"
"belt manufacturer [country] procurement"
"industrial belt importer [country]"
```

**评估流程**：
1. Exa 搜索发现公司
2. 读取官网提取信息（r.jina.ai）
3. ICP 评分 ≥ 75 → 创建 CRM 记录（source=web_discovery）
4. ICP ≥ 90 → 标记 hot_lead，优先发开发信

**报告格式**：
```
[线索发现] 今日目标：[市场]
发现 X 家潜在客户：
1. [公司名] | [国家] | ICP：[分数]/100 | 规模：[规模]
   产品线：[产品线] | 官网：[URL]
   建议：[发开发信 / 进一步背调 / 进入培育池]
```

---

## 9. 邮箱收件检测

**触发**：每次心跳
**对应 Pipeline**：阶段1 Lead Capture（被动）
**逻辑**：连接 163 邮箱 IMAP，检查新增客户回复

| 情况 | 动作 |
|------|------|
| 新回复来自已有 CRM 记录 | 更新 last_contact，通知 owner |
| 新回复来自新发件人 | 创建 CRM 记录，标记来源=email_reply，开始 BANT |
| 匹配到询盘关键词 | 触发 inquiry-response 技能 |

**报告格式**：
```
[邮箱收件]
- 新客户回复：X 封（已创建/更新 CRM）
- 新询盘：X 封（待 BANT）
```

---

## 10. 竞品动态

**触发**：每周五 14:00
**对应 Pipeline**：阶段4 Research
**逻辑**：搜索主要竞品动态（重点关注 Beltwin）：

- Beltwin 是否进入新市场
- Beltwin 是否有价格变动
- 行业是否有新技术/认证变化

**存储**：重要发现存入 Supermemory，tag=`competitor_intel`

**报告格式**：
```
[竞品动态]
- Beltwin：[动态描述]
- 行业：[新动态]
- 建议：[应对策略]
```

---

## 11. 记忆健康检查

**触发**：每日 14:00
**对应 Pipeline**：L1-L4 全层
**逻辑**：执行 `memory:stats` 和 `chroma:stats`

**监控指标**：
- Supermemory：总条目数、各 tag 分布、最近 24h 新增
- ChromaDB：总 turn 数、覆盖客户数、最近 24h 新增 turn
- 异常检测：24h 无新增 turn → L3 可能未捕获 / Supermemory 无 customer_fact → 研究存储异常

**报告格式**：
```
[记忆健康]
- Supermemory：X 条 facts，X 条 insights，X 条 market_signals
- ChromaDB：X 条 conversation turns，覆盖 X 个客户
- 问题：[如有异常]
```

---

## 12. CRM 快照备份

**触发**：每日 12:00
**对应 Pipeline**：L4 灾难恢复
**逻辑**：
1. 读取当前 CRM 全部数据
2. 生成 Pipeline 摘要（stage 分布、Pipeline 价值估算）
3. 存储到 ChromaDB 作为 L4 灾难恢复
4. 同步存 Supermemory 作为备份

**报告格式**：
```
[CRM快照] 已备份 X 条 active leads 到 ChromaDB
Pipeline价值：[汇总]
按阶段分布：new:X / contacted:X / interested:X / quote_sent:X / negotiating:X / nurture:X
```

---

## 13. WhatsApp 72h 窗口期检测

**触发**：每次心跳
**对应 Pipeline**：阶段10 Multi-Channel
**逻辑**：读取 CRM，找到 `status IN (contacted, interested, quote_sent, negotiating) AND primary_channel = WhatsApp AND now - last_contact > 48h`

| 时间段 | 动作 |
|--------|------|
| 48-60h | 发送温馨跟进（WhatsApp），提醒窗口即将过期 |
| 60-72h | 再次尝试 WhatsApp，附上 Telegram/邮箱备选 |
| >72h | 切换到 Telegram 或 Email，CRM 备注"窗口过期已切换渠道" |

**报告格式**：
```
[WhatsApp窗口]
- 即将过期（48-60h）：X 条
- 紧急（60-72h）：X 条
- 已过期（>72h）：X 条（已切换渠道）
```

---

## 14. 客户回复全渠道检测

**触发**：每次心跳
**对应 Pipeline**：阶段1-6 全流程
**逻辑**：扫描所有活跃渠道的客户回复：

| 渠道 | 检测方式 |
|------|---------|
| WhatsApp | wacli 检查新消息 |
| Email (163) | IMAP 检查新邮件 |
| Telegram | Bot API getUpdates（如已配置） |
| LinkedIn | 检查新 InMail（如已配置） |

| 情况 | 动作 |
|------|------|
| 已有客户回复 | 更新 CRM last_contact，立即处理回复 |
| 新客户首次联系 | 创建 CRM 记录 → 阶段1 Lead Capture → 去重检测 |
| 高优先级回复（下单/接受报价） | 即时通知 owner |
| 30 分钟内无回复 | 正常，不报告 |

**报告格式**：
```
[客户回复]
- WhatsApp 新消息：X 条（已有客户：X，新客户：X）
- Email 新回复：X 条
- 高优先级：[如有，即时升级]
```

---

## 重要参数配置

```yaml
# HEARTBEAT 配置参数
stale_threshold_days: 5              # 停滞线索阈值（工作日）
quote_followup_days: 3               # 报价无反馈阈值
nurture_days: 14                     # nurture 激活周期
closed_won_care_days: 30             # 售后关怀周期
closed_lost_followup_days: 90        # 失单跟进周期
whatsapp_warning_hours: 48           # WhatsApp 窗口预警
whatsapp_expiry_hours: 72            # WhatsApp 窗口过期
email_day3_followup: 3               # 邮件序列 Day3
email_day7_followup: 7               # 邮件序列 Day7
email_day14_final: 14                # 邮件最终跟进
memory_snapshot_time: "12:00"        # CRM 快照时间
lead_discovery_time: "10:00"         # 线索发现时间
competitor_check_day: "Friday"       # 竞品动态检查日
competitor_check_time: "14:00"       # 竞品动态检查时间
memory_health_check_time: "14:00"    # 记忆健康检查时间
customer_reply_check_interval: 15    # 客户回复检测间隔（分钟）
```

---

## 快速测试

手动触发单次心跳：
```
执行 HEARTBEAT.md 第 1-14 项检查
```

预期结果：
- 无问题：`HEARTBEAT_OK`
- 有问题：按各项格式输出详情 + 建议

---

*基于 OpenClaw v2026.4.24 · B2B-SDR Template HEARTBEAT.md 同步 · 红龙工业设备定制版*
