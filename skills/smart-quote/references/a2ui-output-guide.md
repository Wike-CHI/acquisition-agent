# A2UI 输出指南

> 当你需要输出结构化信息（客户卡片、邮件预览、报价摘要等）时，在 Markdown 文本之后附加 A2UI 交互式卡片。

## 什么是 A2UI

A2UI 是一种声明式 UI 协议。你在回复中嵌入 ```` ```a2ui ``` 代码块，前端会自动将其渲染为可交互的 UI 组件。

## 基本格式

````
```a2ui
{"beginRendering":{"surfaceId":"唯一ID","catalogId":"basic"}}
```

```a2ui
{"surfaceUpdate":{"surfaceId":"同上ID","components":[组件列表]}}
```
````

## 组件类型

### Text — 文本展示

```json
{"id":"t1","component":{"Text":{"text":"要显示的文本"}}}
```

### Button — 可点击按钮

```json
{"id":"b1","component":{"Button":{"text":"按钮文字","action":{"type":"动作类型","context":{}}}}}
```

**可用动作类型：**
- `send_email` — 发送邮件（context: `{to, subject, body}`）
- `send_whatsapp` — 发送 WhatsApp（context: `{phone, message}`）
- `openUrl` — 打开链接（context: `{url}`）
- `copy_text` — 复制文本（context: `{text}`）
- `generate_quote` — 生成报价（context: `{company, product, quantity}`）

## 完整示例

### 客户卡片（company-research 使用）

```
## 企业背调报告：Acme Industrial Corp.

（Markdown 格式的详细报告...）

```a2ui
{"beginRendering":{"surfaceId":"cr-acme-2026","catalogId":"basic"}}
```

```a2ui
{"surfaceUpdate":{"surfaceId":"cr-acme-2026","components":[
  {"id":"name","component":{"Text":{"text":"🏢 Acme Industrial Corp."}}},
  {"id":"info","component":{"Text":{"text":"John Smith · john@acme.com · 沙特 · 制造业"}}},
  {"id":"icp","component":{"Text":{"text":"ICP 评分: 82/100 (A级客户)"}}},
  {"id":"actions","component":{"Button":{"text":"📧 发送开发信","action":{"type":"send_email","context":{"to":"john@acme.com","subject":"Partnership Inquiry","body":"..."}}}}},
  {"id":"quote","component":{"Button":{"text":"💰 生成报价","action":{"type":"generate_quote","context":{"company":"Acme Industrial Corp.","product":"待确认","quantity":"待确认"}}}}}
]}}
```
````

### 邮件预览（cold-email-generator 使用）

```
## 开发信草稿

（Markdown 格式的邮件内容...）

```a2ui
{"beginRendering":{"surfaceId":"email-draft-001","catalogId":"basic"}}
```

```a2ui
{"surfaceUpdate":{"surfaceId":"email-draft-001","components":[
  {"id":"to","component":{"Text":{"text":"收件人: john@acme.com"}}},
  {"id":"subject","component":{"Text":{"text":"主题: Partnership Opportunity - HongLong Industrial"}}},
  {"id":"body","component":{"Text":{"text":"Dear John,\n\nI came across Acme Industrial..."}}},
  {"id":"send","component":{"Button":{"text":"📤 发送此邮件","action":{"type":"send_email","context":{"to":"john@acme.com","subject":"Partnership Opportunity","body":"Dear John..."}}}}}
]}}
```
````

### 报价摘要（smart-quote 使用）

```
## 报价分析

（Markdown 格式的报价详情...）

```a2ui
{"beginRendering":{"surfaceId":"quote-001","catalogId":"basic"}}
```

```a2ui
{"surfaceUpdate":{"surfaceId":"quote-001","components":[
  {"id":"product","component":{"Text":{"text":"🛒 产品: 全自动包装机 HL-200"}}},
  {"id":"qty","component":{"Text":{"text":"数量: 2 台"}}},
  {"id":"margin","component":{"Text":{"text":"建议利润率: 15%-20%"}}},
  {"id":"est","component":{"Text":{"text":"估算FOB价: $12,000 - $13,000"}}},
  {"id":"gen","component":{"Button":{"text":"📋 生成正式报价单","action":{"type":"generate_quote","context":{"company":"客户公司","product":"全自动包装机 HL-200","quantity":"2"}}}}}
]}}
```
````

## 规则

1. **surfaceId 必须唯一** — 用 `技能缩写-客户名-日期` 格式，如 `cr-acme-20260423`
2. **beginRendering 和 surfaceUpdate 必须成对出现**
3. **每个 surfaceUpdate 的 surfaceId 必须匹配 beginRendering**
4. **先 Markdown 后 A2UI** — 文字说明在前，交互卡片在后
5. **按钮动作必须有 context** — 不要传空 context
6. **不要在 A2UI 中放敏感信息** — 价格、成本等用范围而非精确值
