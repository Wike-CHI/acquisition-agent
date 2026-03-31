---
name: calendar-skill
version: 1.0.0
description: "日历提醒与任务调度技能。管理客户跟进日程、邮件发送提醒、会议安排。支持创建、查看、删除日历事件。"
always: false
triggers:
  - 日历
  - 提醒
  - 跟进日程
  - 安排会议
  - calendar
  - reminder
  - follow-up schedule
---

# Calendar Skill - 日历提醒与任务调度

管理获客相关的日程安排和提醒，确保不遗漏任何跟进节点。

## 功能

- **跟进日程管理** - D0/D3/D5/D14 自动跟进提醒
- **日历事件** - 创建、查看、删除事件
- **邮件发送提醒** - 定时提醒发送跟进邮件
- **任务调度** - 与 automation 联动执行定时任务

## D0-D14 跟进节奏

| 天数 | 动作 | 说明 |
|------|------|------|
| D0 | 发送开发信 | 首次触达 |
| D3 | LinkedIn 连接 | 社媒辅助 |
| D5 | 跟进邮件 | 再次触达，补充产品信息 |
| D14 | 最终跟进 | 最后一轮，若无回复归档 |

## 使用方式

### 创建跟进提醒
```
为客户 "VICSUN CO., LTD" 创建 D3 跟进提醒（2026-04-03 09:00）
```

### 查看今日日程
```
查看今日跟进任务
```

### 批量创建跟进日程
```
为以下客户批量创建跟进日程：
1. VICSUN - D0已发送
2. BELT-TECH - D0已发送
```

## 实现方式

使用 WorkBuddy `automation_update` 工具创建定时任务：
- 一次性提醒：`scheduleType: "once"`, `scheduledAt: "2026-04-03T09:00"`
- 循环提醒：`scheduleType: "recurring"`, `rrule: "FREQ=DAILY;BYHOUR=9;BYMINUTE=0"`

## 与获客系统集成

- `acquisition-workflow` Phase 4 触达 → 自动创建 D3/D5/D14 提醒
- `email-sender` 发送邮件后 → 自动创建下次跟进日程
- `fumamx-crm` 客户状态变更 → 触发跟进提醒更新
