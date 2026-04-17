---
name: holo-activity-log
version: 1.1.0
description: HOLO获客系统操作日志埋点技能。记录业务员使用WorkBuddy执行获客流程的每一次操作，数据存储到NAS共享盘。Agent统一使用HOLO-AGENT账号。当需要：(1) 记录操作日志 (2) 埋点追踪 (3) 统计分析业务行为 时使用此技能。
always: false
triggers:
  # 记录相关
  - 记录日志
  - 记录一下
  - 写日志
  - 埋点
  - 操作记录
  # 统计相关
  - 统计
  - 今日操作
  - 查看日志
  - 操作统计
  # 集成调用
  - holo-activity-log
  - activity-log
  - 操作埋点
---

# HOLO 活动日志技能 v1.0

## 概述

本技能用于记录红龙获客系统中业务员的操作日志，实现操作行为追踪和统计分析。

> **重要**：NAS密码通过对话传递，不存储在任何配置文件中

---

## 核心能力

1. **操作记录** - 记录每一次关键操作（搜索、背调、发邮件等）
2. **设备追踪** - 通过 IP + 用户名 标识每个业务员的设备
3. **统计分析** - 支持按人员、按时间、按操作类型统计

---

## 知识库结构

| 文件 | 内容 |
|------|------|
| [references/DATA-MODEL.md](references/DATA-MODEL.md) | 数据模型定义（字段、枚举、格式） |
| [references/USAGE.md](references/USAGE.md) | 使用指南和集成说明 |
| [scripts/log-activity.ps1](scripts/log-activity.ps1) | 日志写入脚本 |

---

## 调用方式

### 方式一：对话触发（推荐）

```
用户：记录一下，我刚完成了背调
用户：记录：我给 ABC Corp 发了一封开发信，评分9.2
用户：统计一下今天的操作
```

### 方式二：参数传递

```yaml
skill: holo-activity-log
params:
  skill_name: company-research      # 技能名
  action_type: research             # 操作类型
  customer: National Cement Ethiopia # 客户名称
  result: success                   # 结果状态
  score: 82                        # ICP评分
  duration_sec: 120                # 耗时秒数
  notes: 非洲最大水泥厂供应商      # 备注
```

---

## 参数说明

| 参数 | 必需 | 类型 | 说明 | 示例 |
|------|------|------|------|------|
| `skill_name` | ✅ | String | 触发的技能名 | `company-research` |
| `action_type` | ✅ | Enum | 操作类型 | `research` |
| `customer` | ❌ | String | 目标客户名称 | `National Cement Ethiopia` |
| `result` | ✅ | Enum | 结果状态 | `success` |
| `score` | ❌ | Decimal | 结果评分 | `82`、`9.3` |
| `duration_sec` | ❌ | Int | 执行耗时（秒） | `45` |
| `notes` | ❌ | String | 备注信息 | `ICP:82` |
| `nas_pass` | ❌ | String | NAS密码（对话传递） | - |

---

## 操作类型（action_type）

| 值 | 说明 | 示例 |
|----|------|------|
| `search` | 客户搜索 | 搜索了10家矿业公司 |
| `research` | 客户背调 | 完成了ABC Corp背调 |
| `email_gen` | 开发信生成 | 生成了9.3分开发信 |
| `email_send` | 邮件发送 | 发送成功 |
| `linkedin` | LinkedIn触达 | 发送连接请求 |
| `facebook` | Facebook运营 | 发帖/评论 |
| `quote` | 报价生成 | 生成报价单 |
| `delivery` | 发送队列 | 加入Drip Campaign |
| `icp_score` | ICP评分 | 客户评分82分 |
| `other` | 其他操作 | 其他操作 |

---

## 结果状态（result）

| 值 | 说明 |
|----|------|
| `success` | 完全成功 |
| `partial` | 部分成功 |
| `fail` | 失败 |
| `skip` | 跳过 |
| `pending` | 进行中 |

---

## 执行脚本

脚本路径：`{skill_dir}/scripts/log-activity.ps1`

```powershell
# 基本调用
.\log-activity.ps1 -SkillName "company-research" -ActionType "research" -Customer "ABC Corp" -Result "success" -Score 85

# 完整参数
.\log-activity.ps1 -NasPass "Hl88889999" -SkillName "cold-email-generator" -ActionType "email_gen" -Customer "National Cement" -Result "success" -Score 9.3 -DurationSec 30 -Notes "第2轮润色达到9.3分"
```

---

## 输出格式

执行成功后返回：

```json
{
  "Success": true,
  "Message": "日志写入成功",
  "FilePath": "\\\\192.168.0.194\\AI数据\\activity\\2026-04-10.csv",
  "LogLine": "2026-04-10 16:30:00.123|Administrator@192.168.0.101|192.168.0.101|company-research|research|ABC Corp|success|85|120|非洲客户",
  "DeviceID": "Administrator@192.168.0.101"
}
```

---

## 与其他技能的集成

### 在获客流程中埋点

| 流程阶段 | 埋点时机 | action_type |
|----------|----------|-------------|
| Phase 1 搜索 | 搜索完成后 | `search` |
| Phase 1.5 验证 | 邮箱验证后 | `email` |
| Phase 2 背调 | 背调完成后 | `research` |
| Phase 3 筛选 | 筛选完成后 | `icp_score` |
| Phase 4 触达 | 开发信生成后 | `email_gen` |
| Phase 4 触达 | 邮件发送后 | `email_send` |

### 示例集成代码

```yaml
# 在 company-research skill 完成后调用
- skill: holo-activity-log
  trigger: 自动（由AI判断操作完成）
  params:
    skill_name: company-research
    action_type: research
    customer: "{{客户名称}}"
    result: "{{背调结果}}"
    score: "{{ICP评分}}"
    duration_sec: "{{执行耗时}}"
    notes: "{{关键发现}}"
```

---

## NAS 连接信息（Agent专用）

> ⚠️ **安装须知**：Agent统一使用此账号，不依赖业务员个人NAS账号

| 项目 | 值 |
|------|-----|
| IP | `192.168.0.194` |
| Agent账号 | `HOLO-AGENT` |
| Agent密码 | `Hl88889999` |
| 共享路径 | `\\192.168.0.194\home\activity` |
| 日志目录 | `\\192.168.0.194\home\activity` |
| 文件格式 | `YYYY-MM-DD.csv` |

### 群晖配置要求

1. 在群晖管理界面创建用户 `HOLO-AGENT`，密码 `Hl88889999`
2. 给该用户分配 `home` 目录的读写权限
3. 日志目录会自动创建：`home/activity/YYYY-MM-DD.csv`

---

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| NAS连接失败 | 检查网络是否可达：`Test-NetConnection 192.168.0.194` |
| 文件写入失败 | 检查共享目录权限 |
| 设备ID显示unknown | 检查网络适配器配置 |
| 字符乱码 | 确认使用UTF-8 with BOM编码 |

---

*版本: 1.0.0 | 创建: 2026-04-10*
