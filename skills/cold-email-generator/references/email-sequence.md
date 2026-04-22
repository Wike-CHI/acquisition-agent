# 邮件序列管理

> 4 步自动跟进序列，从首次开发信到最终归档。
> 每一步有明确的触发条件、内容策略和退出机制。

---

## 序列概览

```
Step 0: 首次开发信（cold-email-generator 生成）
    ↓ 无回复，等待 3 天
Step 1: Day 3 跟进 — 轻提醒 + 新价值
    ↓ 无回复，等待 4 天
Step 2: Day 7 跟进 — 不同角度切入
    ↓ 无回复，等待 7 天
Step 3: Day 14 跟进 — 最终尝试 + 价值炸弹
    ↓ 无回复
Step 4: Day 30 — 归档（发送最后一封礼貌邮件后关闭）
```

---

## Step 0：首次开发信

**生成方式**：由 cold-email-generator 核心流程生成。
**评分要求**：≥ 9.0 分。
**发送后**：保存到 NAS（`Type=email`），记录发送时间。

---

## Step 1：Day 3 跟进

### 触发条件

- Step 0 发送后 3 个工作日无回复
- 客户未退订、未标记垃圾邮件

### 内容策略

**目标**：轻提醒，不是催单。提供新的小价值。

**结构**：
```
Subject: Re: [原主题] — one more thing

Hi [Name],

Quick follow-up on my note last [day]. I realize
you're busy — just wanted to leave one more data point:

[1-2句新信息：案例/数据/行业趋势，不是重复原邮件内容]

If any of this resonates, I'd love to continue the conversation.
If not, no worries — I won't keep filling your inbox.

Best,
[签名]
```

### 要素清单

| 要素 | 要求 |
|------|------|
| 主题行 | Re: 原主题 + 补充信息（不超过 50 字符） |
| 开头 | 不说"just checking in"，给新内容 |
| 正文 | 1 个新信息点，2-3 句话 |
| 结尾 | 礼貌退出选项，降低对方心理压力 |
| 篇幅 | ≤ 80 词 |
| 禁止 | 重复原邮件内容、催单、降价 |

### CTA 策略

优先 S2（免费价值）或 S1（选择题），不用 S3（太早施压）。

---

## Step 2：Day 7 跟进

### 触发条件

- Step 1 发送后 4 个工作日无回复

### 内容策略

**目标**：换一个角度重新切入，不是继续同一话题。

**结构**：
```
Subject: [新角度的主题 — 不用 Re:]

Hi [Name],

[2-3句切入：从不同角度提供建议]

For example, [具体案例/数据，1-2句].

Worth a 5-minute conversation? I can work around your schedule.

Best,
[签名]
```

### 要素清单

| 要素 | 要求 |
|------|------|
| 主题行 | 新主题（不用 Re:），新角度 |
| 切入角度 | 不同于 Step 0/1 的话题 |
| 案例/数据 | 1 个具体案例或数据点 |
| CTA | 提出短会议（5-10 分钟） |
| 篇幅 | ≤ 100 词 |

### 角度切换参考

| 如果 Step 0 谈了 | Step 2 可以谈 |
|------------------|-------------|
| 产品功能 | 行业趋势 |
| 成本节省 | 质量提升 |
| 技术规格 | 客户案例 |
| 交货速度 | 售后支持 |
| 单一产品 | 全系列覆盖 |

---

## Step 3：Day 14 跟进（价值炸弹）

### 触发条件

- Step 2 发送后 7 个工作日无回复

### 内容策略

**目标**：最后尝试，提供最有价值的内容。这是"压箱底"的一封。

**结构**：
```
Subject: [客户公司名] + [痛点关键词]

Hi [Name],

I'll make this my last note — I know your time is valuable.

[最有价值的内容：行业报告/竞品分析/ROI计算/具体案例]

[1句总结价值]

If any of this is useful, my door is always open.
If the timing isn't right, I completely understand.

Best,
[签名]
```

### 要素清单

| 要素 | 要求 |
|------|------|
| 主题行 | 客户公司名 + 痛点关键词（高打开率） |
| 内容 | 必须是真正有价值的东西（不是"我们的产品很好"） |
| 价值类型 | 行业报告 / 竞品对比 / ROI 计算 / 案例研究 |
| 语气 | 尊重、不卑微 |
| 明确退出 | 告知这是最后一封 |

### 可用的价值炸弹

| 价值类型 | 来源 | 注意 |
|---------|------|------|
| 区域行业报告 | NAS 市场知识库 | 必须有真实报告 |
| 竞品对比表 | `competitor-intel.md` | 3-4 个维度即可 |
| ROI 计算 | `interest-signals.md` S5 | 数字必须有依据 |
| 同区域案例 | NAS 客户档案 | **禁止编造** |
| 产品对比规格 | `honglong-products` | 通用规格表 |

---

## Step 4：Day 30 归档

### 触发条件

- Step 3 发送后 16 个工作日无回复（总计约 30 天）

### 操作

发送最后一封礼貌邮件后，将客户归档。

```
Subject: Closing the loop

Hi [Name],

I'll be closing your file for now to keep my inbox organized.
If anything changes on your end — new project, equipment need,
or just a question — feel free to reach out anytime.

Wishing you all the best.

Best,
[签名]
```

### 归档操作

| 步骤 | 操作 |
|------|------|
| 1 | 更新 NAS 客户档案，状态改为 `archived` |
| 2 | 记录 4 步序列完成，无回复 |
| 3 | 设置 90 天后提醒（可选：季度唤醒邮件） |

---

## 退出序列的条件

以下任一情况发生时，**立即停止序列**，不继续发跟进邮件：

| 退出条件 | 操作 |
|---------|------|
| 客户回复（任何内容） | 切换到 `inquiry-response` 技能 |
| 客户退订 | 标记 do-not-contact，永久停止 |
| 邮件退回/无效 | 标记 bad-email，停止此邮箱 |
| 客户明确拒绝 | 标记 declined，记录原因 |
| 客户标记垃圾邮件 | 标记 spam，永久停止 |

---

## 序列管理规则

### 频率规则

| 规则 | 说明 |
|------|------|
| 最少间隔 | 3 个工作日（不含周末） |
| 最多邮件数 | 4 封（含首次） |
| 总时长 | ≤ 30 天 |
| 不同客户可并行 | 多个客户各自独立计时 |

### 质量规则

| 规则 | 说明 |
|------|------|
| 每封邮件独立可读 | 客户可能只看某一封，不能依赖上下文 |
| 不重复 | 4 封邮件不能有重复的内容/角度 |
| 都要润色 | 每封都要经过 `humanize-ai-text` 润色 |
| 都要评分 | 每封都要 ≥ 9.0 |

### 文化适配

跟进频率根据目标市场调整（详细文化画像见 `inquiry-response/references/cultural-profiles.md`）：

| 市场 | 建议总时长 | 建议 CTA 语气 |
|------|-----------|-------------|
| 美国 | 21 天 | 直接，可约电话 |
| 德国 | 30+ 天 | 提供技术数据 |
| 巴西 | 30+ 天 | 关系导向，WhatsApp |
| 日本 | 45+ 天 | 极度礼貌，不催单 |

---

_Version: 1.0.0 | 2026-04-22_
