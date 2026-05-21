## 输出格式

每个 Phase 完成后输出标准格式：

```markdown
## Phase N: [阶段名] 完成

**统计**: X 家客户处理，Y 家通过
**质量**: 通过率 Z%
**耗时**: [时间]

### 结果
[具体内容]

### 质量检查
- [x] 检查项1
- [ ] 检查项2（未通过）
```

---

## 质量门控

| 阶段 | 门控条件 | 不通过处理 |
|------|----------|-----------|
| Phase 1.5 | 必须有已验证邮箱 | 跳过该客户 |
| Phase 2 | ICP评分需有依据 | 重新背调 |
| Phase 3 | ICP ≥ 75分 | 标记暂缓 |
| Phase 4 | 开发信 ≥ 9.0分 | 重新润色 |

---

## 后续技能

| 完成后场景 | 可调用技能 |
|-----------|-----------|
| 生成报价单 | honglong-products |
| Pipeline更新 | crm |
| 质量验收 | acquisition-evaluator |
| 日历提醒 | calendar-skill |
| 社媒运营 | ai-social-media-content |
| **操作日志埋点** | holo-activity-log |
| **Pipeline自动巡检** | HEARTBEAT.md（13项心跳任务）|
| **客户记忆管理** | MEMORY.md（4层防遗忘协议）|

---

## 配套文档

本流程配合以下文档使用：

| 文档 | 用途 |
|------|------|
| `HEARTBEAT.md` | Pipeline 自动巡检（13项心跳任务），每次心跳自动执行 |
| `MEMORY.md` | 4层防遗忘记忆协议，对话全程记忆管理 |
| `AGENTS.md` | 10阶段Pipeline详细动作文档，所有操作人员可查 |
| `smart-quote` | 智能报价系统（含报价锁定机制 + 授权矩阵）|
| `cold-email-generator` | 开发信（含 Email Sequence 4步序列化跟进）|
| `telegram-toolkit` | Telegram-first市场支持（俄罗斯/伊朗/独联体）|
| `honglong-assistant` | 人格层（含反verbosity规则：消息必须短）|
| `acquisition-coordinator` | 实际执行引擎，读取本流程规范后调度子技能 |

---

## 操作日志埋点规范

> **重要**：每个Phase完成后应调用 `holo-activity-log` 记录操作

### 埋点时机

| Phase | 埋点时机 | action_type | 必填字段 |
|-------|---------|-------------|---------|
| Phase 1 | 搜索完成后 | `search` | result, score |
| Phase 1.5 | 邮箱验证后 | `email` | customer, result |
| Phase 2 | 背调完成后 | `research` | customer, result, score |
| Phase 3 | 筛选完成后 | `icp_score` | result, score |
| Phase 4 | 开发信生成后 | `email_gen` | customer, result, score |
| Phase 4 | 邮件发送后 | `email_send` | customer, result |

### 埋点示例

```
用户：帮我搜索10家非洲矿业客户
AI：
  1. 调用 exa-search skill 搜索客户
  2. ✅ 找到12家潜在客户
  3. 📝 调用 holo-activity-log 记录日志
  4. 返回客户列表
```

### 埋点调用方式

```yaml
# 在流程末尾添加
- skill: holo-activity-log
  params:
    skill_name: exa-search
    action_type: search
    customer: 非洲矿业
    result: success
    score: 12
    notes: 找到12家潜在客户，3家高价值
```

### 日志存储位置

- **NAS路径**：`\\192.168.0.194\AI数据\activity\`
- **文件格式**：`YYYY-MM-DD.csv`（每天一个文件）
- **设备标识**：`用户名@IP`（自动获取）

---

## CRM数据源说明（2026-04-16）

> ⚠️ 本地无CRM数据库。CRM为web-based fumamx系统（`skill://fumamx-crm`）。
> **邮件序列追踪使用文件方式**，非数据库查询。

### 邮件序列追踪路径（HEARTBEAT Item 7专用）
```
/tmp/us_outreach_log.md        # 主发送记录（Markdown表格）
/tmp/email_*.html              # 各客户邮件HTML正文
/tmp/email_followup_*.html    # 跟进邮件HTML正文
```

### 字段约定（us_outreach_log.md）
| 字段 | 说明 |
|------|------|
| `状态` | `SENT` / `REPLIED` / `BOUNCED` / `SPAM` / `NURTURE` |
| `MessageID` | 邮件发送ID |
| `首封日期` | 推断自文件创建日期 |
| `Day3发送日` | 实际发送日期（文件mtime） |

### 判断序列状态
- **Day 3 无回复**：当前日期 > 首封+3天 且 状态=SENT 且 无 `email_followup_1.html` mtime在期限内
- **Day 7 无回复**：当前日期 > 首封+7天 且 状态=SENT
- **Day 14 无回复**：当前日期 > 首封+14天 且 状态=SENT
- **有回复**：状态列含 `REPLIED`
- **培育**：状态列含 `NURTURE`

---

## 快速命令

```
帮我搜索 [数量] 个 [地区] 的 [行业] 客户
背调这些公司：[公司列表]
筛选高价值客户，标准：评分≥75分
给这些客户发开发信: [公司列表]
```

---

*版本: 2.1.1 | 更新时间: 2026-04-16*
*变更: 增加CRM数据源说明（邮件序列追踪文件路径+判断逻辑）*
