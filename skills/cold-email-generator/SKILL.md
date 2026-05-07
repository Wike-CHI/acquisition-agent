---
name: cold-email-generator
version: 2.1.0
description: "B2B cold email generator with AI detection, multi-round polishing, and strict scoring (≥9.0). MUST USE when user says '开发信', 'cold email', '写邮件', '起草邮件', '给XX公司发邮件', 'follow up email', or needs to write any outbound sales email — even if they don't explicitly say 'cold email'. Also triggers for email sequence management and follow-up scheduling."
triggers:
  - 开发信
  - cold email
  - 外联邮件
  - 销售邮件
  - 推销邮件
  - 生成邮件
  - 写开发信
  - 起草邮件
  - follow up
  - 跟进邮件
  - 邮件序列
---

# Cold Email Generator v2.1

生成个性化 B2B 开发信，经过 AI 检测、多轮润色、严格评分（≥9.0）。

---

## 何时使用 / 何时不使用

### ✅ 使用场景
- 给新客户写第一封开发信
- 写跟进邮件（Day 3/7/14）
- 管理邮件序列（4 步自动跟进）
- 需要去 AI 味的个性化邮件

### ❌ 不使用场景
- 客户已回复且进入谈判 → 用 `inquiry-response`
- 需要报价 → 用 `smart-quote`
- 需要背调 → 用 `company-research`

---

## 快速参考

| 你要做的 | 执行 |
|---------|------|
| 给新客户写开发信 | ① 检查 NAS 档案 ② 用初稿模板生成 ③ 调用 humanize-ai-text 润色 ④ 评分 ≥9.0 |
| 写跟进邮件 | 查 `references/email-sequence.md` 对应步次的要素和 CTA 策略 |
| 客户已回复 | 切换到 `inquiry-response`，不再用本技能 |
| 需要 NAS 资料 | 查 `references/nas-paths.md` |

---

## 核心原则

1. **个性化** — 必须包含客户特定信息（公司名、产品线、近期动态）
2. **简洁** — 150 词以内，3-4 段
3. **价值导向** — 强调客户获得什么，不是我们卖什么
4. **文化适配** — 根据目标国家调整语气（查 `cultural-profiles.md`）
5. **去 AI 味** — 强制调用 `humanize-ai-text`，AI 密度 < 2%
6. **绝对禁止报价** — 不得出现具体金额（$、¥、€），只能用 "competitive pricing" 等定性描述。报价走 `smart-quote`

---

## 核心流程

```
检查 NAS 档案（references/nas-paths.md）
       ↓
未发送 → 初稿生成（下方模板）
       ↓
调用 humanize-ai-text 润色（detect → transform → 验证）
       ↓
评分 ≥ 9.0？→ 否 → 第2轮润色 → 再评分
       ↓
最终版本 → 读取签名（references/nas-paths.md 签名规范）
       ↓
发送（email-sender）
```

## 评分标准

| 维度 | 分值 | 标准 |
|------|------|------|
| 个性化 | 2.0 | 包含客户特定信息 |
| 相关性 | 2.0 | 产品匹配度高，解决痛点 |
| 简洁性 | 2.0 | ≤150 词，≤4 段 |
| 语法 | 2.0 | 无错误，专业语气 |
| 去AI味 | 2.0 | AI 密度 < 2% |

## 输入要求

| 必需 | 可选 |
|------|------|
| 公司名 + 国家 | 联系人姓名 |
| 业务范围 | 客户近期动态 |
| 匹配产品 | 竞品信息 |

## 初稿模板

```
Subject: [个性化主题行]

Greeting: [姓名，非 Dear Sir/Madam]

Hook: [与客户相关的行业趋势/痛点/近期动态]

Value: [红龙产品如何解决该痛点，1-2句话]

Benefits:
- [利益点1]
- [利益点2]
- [利益点3]

CTA: [从 references/cta-strategies.md 选择，优先选择题钩子 S1]

Signature: [从 NAS 签名文件读取]
```

## CTA 策略库

> 详细模板见 `references/cta-strategies.md`
> 选择题钩子(S1) > 免费价值(S2) > 限时窗口(S3) > 行业定制(S4)
> ⚠️ CTA 中绝对禁止出现具体金额

## 签名规范

从 `../../workspace/operator-config.md` 读取。
详细配置见 `references/nas-paths.md`。

## 目标市场文化适配

详细文化画像见 `inquiry-response/references/cultural-profiles.md`

| 市场 | 语气 | 渠道 | 注意 |
|------|------|------|------|
| 北美（美/加/墨） | 专业简洁 | Email + LinkedIn | 强调TCO和品质对标Flexco |
| 欧洲（德/英/法） | 正式 | Email + WhatsApp | 强调技术规格和认证 |
| 南美（巴西/智利） | 热情 | WhatsApp | 葡萄牙语/西班牙语 |
| 东南亚（越/泰/印尼） | 关系导向 | WhatsApp | 可提及中国邻近优势 |
| 中东（沙特/阿联酋） | 正式但灵活 | WhatsApp + Email | 强调品质和快速交付 |
| 南亚（印/巴/孟） | 价格导向 | WhatsApp | 重点强调性价比 |
| 独联体（俄/哈） | 正式 | Telegram | 俄语优先 |
| 东亚（日/韩） | 极度礼貌 | Email | 绝不催单，切入难度大 |

---

## 参考文档

| 文件 | 何时读取 |
|------|---------|
| `references/cta-strategies.md` | 写 CTA 时 |
| `references/email-sequence.md` | 写跟进邮件/管理序列时 |
| `references/nas-paths.md` | 需要读取/保存资料时 |

---

## 踩坑记录

| 日期 | 问题 | 修复 |
|------|------|------|
| 2026-04-22 | AI 幻觉 $2,800 报价（实际 $7,800） | 新增原则 #6 绝对禁止报价 |
| 2026-04-01 | 评分虚高（10/10 但未调用润色） | 强制调用 humanize-text，评分提升至 ≥9.0 |

---

_Version: 2.1.0 | 更新: 2026-04-23_

---

## 交互式卡片输出（A2UI）

生成邮件草稿后，在 Markdown 内容末尾附加 A2UI 邮件预览卡片。

**参考文件**：`references/a2ui-output-guide.md`（读取此文件获取完整格式说明）

**输出规则：**
1. 先输出 Markdown 格式的邮件内容
2. 在末尾附加 ```` ```a2ui ``` 卡片，包含：
   - 收件人邮箱（Text 组件）
   - 邮件主题（Text 组件）
   - 邮件正文摘要（Text 组件）
   - "发送此邮件"按钮（action: `send_email`，context 含 to/subject/body）
3. surfaceId 格式：`email-{客户域名关键词}-{序号}`
