---
name: quotation-generator
version: "2.0.0"
description: Use when 需要生成标准PDF报价单时。路由：生成PDF报价单走此技能（内置产品价格表和利润率校验），禁止跳过 smart-quote 直接生成报价单
triggers:
  - 报价单
  - PDF报价
  - 生成报价
  - 发报价
  - quotation-generator
  - 做报价
---

# quotation-generator — 红龙 QUOTATION FORM 报价单生成技能

> **Skill Graph：** 领域 → [[_index-conversion|报价与转化领域]] | 上游 ← [[smart-quote|智能报价]]（价格确认后）← [[_index-conversion|转化领域]] | 下游 → [[sales|Pipeline更新]]


> 生成红龙公司标准 QUOTATION FORM PDF，完全匹配公司实际模板格式。
> 基于 `smart-quote` 的利润率区间，生成正式报价 PDF 供老板审批后发送给客户。

---

## 触发条件

| 触发场景 | 说明 |
|---------|------|
| 客户问价（BANT ≥ 2/4） | 进入报价锁定流程后生成 PDF |
| 老板指令 | "给 [客户] 发报价" |
| Pipeline 阶段5 | 进入报价阶段时自动触发 |

---

## 前置依赖

### 必须完成

1. **smart-quote v3.0 已运行** — 从知识库查成本底价 + 利润率 + 汇率计算销售价格
2. **成本价已确认** — kb_read(type="products", name="cost-prices") 获取产品未税成本
3. **MEMORY.md 客户会话已读取** — 获取 BANT 数据
4. **NAS 产品资料已读取** — 获取产品规格参数（Heating Area, Max width, Voltage, HS CODE 等）
5. **老板已审批** — 报价锁定流程已完成

### 禁止条件

- BANT < 2/4 且 N（Need）不明确
- 老板尚未审批
- 利润率低于各国铁律底线

---

## 公司标准 QUOTATION FORM 模板

以下为公司实际使用的报价单格式，PDF 生成时必须严格遵循：

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                      QUOTATION FORM                          │
│                                                              │
│  Quote Date: YYYY/MMMM/DDDD    Quote No. HL20251204N001      │
│  until: YYYY/MMMM/DDDD                                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  The Buyer's Information:                                    │
│  Company: [客户公司名]                                       │
│  Email: [客户邮箱]                                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Product | Model | Photo | Description | Qty | Unit Price    │
│                                                       (CNY)  │
│  ─────────────────────────────────────────────────────────── │
│  [品名] | [型号] | [照片位] | [描述+规格] | [数量] | [单价]  │
│                                                              │
│  Specs:                                                      │
│  Heating Area: [加热面积]                                    │
│  Max width: [最大宽度]                                       │
│  Operating Pressure: [工作压力]                              │
│  Temperature: [温度范围]                                     │
│  Voltage: [电压]                                             │
│  HS CODE: [海关编码]                                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                          Total (EX-Factory CNY): ¥XX,XXX     │
├──────────────────────────────────────────────────────────────┤
│  COMMERCIAL TERMS                                            │
│  ─────────────────────────────────────────────────────────── │
│  Shipment Term: FOB Shanghai / CIF [Port]                    │
│  Payment Terms: T/T 30/70 / L/C at sight                     │
│  Delivery Time: [X] weeks after deposit                      │
│  Packing: Standard export wooden case                        │
│  Warranty: 12 months                                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Notes:                                                      │
│  - CE / ISO certifications available                        │
│  - Installation overseas: negotiable                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Manufacturers of Conveyor Belt Fabrications Equipments- HOLO│
└──────────────────────────────────────────────────────────────┘
```

### 字段说明

| 字段 | 说明 | 数据来源 |
|------|------|---------|
| Quote No. | HL{YYYYMMDD}N{序号}，如 HL20260506N001 | 自动生成，递增序号 |
| Product | 产品类别名（如 Air-cooled Vulcanizer） | NAS 产品资料 |
| Model | 型号（如 PA1200） | NAS 产品资料 |
| Photo | 产品照片占位区域 | NAS 产品图片或留空 |
| Description | 产品描述 + 关键规格（Heating Area, Max width, Voltage, HS CODE） | NAS 产品资料 |
| Unit Price (CNY) | EX-Factory 含税单价（人民币） | smart-quote 计算 |
| Total (EX-Factory CNY) | EX-Factory 含税总价（人民币） | Qty × Unit Price |

---

## 报价单命名规范

```
HL{YYYYMMDD}N{序号}
```

示例：
```
HL20260506N001   # 2026年5月6日第1份
HL20260506N002   # 2026年5月6日第2份
```

> 注意：这是公司实际模板格式，与旧版 `HL-{国家代码}-{YYYYMMDD}-{序号}` 不同。

---

## 多语言支持

| 语言 | 适用市场 | 报价单语言 |
|------|---------|----------|
| English | 默认（全球通用） | EN |
| Portuguese | 巴西 | PT |
| Spanish | 拉美（除巴西）| ES |
| Russian | 俄罗斯/独联体 | RU |
| Arabic | 中东 | AR |
| French | 西非/中非 | FR |

> 多语言版本仅翻译标签文字（如 "QUOTATION FORM"、"Buyer's Information"、"COMMERCIAL TERMS"），产品规格参数保持英文。

---

## 外币换算参考

> 正式报价始终以 **CNY EX-Factory** 为准。外币金额仅作客户参考，不具约束力。

当客户询问"换算成我们本地货币是多少"时，使用 smart-quote 的汇率脚本：

```bash
python ../smart-quote/scripts/exchange_rate.py <CNY金额> CNY <目标货币>
```

示例：
```bash
# 巴西客户问：¥52,000 换成巴西雷亚尔是多少？
python ../smart-quote/scripts/exchange_rate.py 52000 CNY BRL
# 输出: 52,000.00 CNY → 37,953.45 BRL (汇率 0.729874)
```

| 规则 | 说明 |
|------|------|
| 报价单正文 | 始终 CNY，不展示外币金额 |
| 邮件/消息正文 | 可附带外币参考金额，注明"按当日汇率估算" |
| 汇率锁定 | 客户要求锁定汇率超过 7 天 → 升级老板审批 |
| 汇率波动大 | 建议客户签 CNY 合同，或缩短报价有效期至 7 天 |

---

## 生成流程

```
报价请求
  ↓
smart-quote 生成利润率区间（CNY EX-Factory）
  ↓
MEMORY.md 读取客户 BANT
  ↓
NAS 读取产品规格参数
  ↓
老板审批确认
  ↓
quotation-generator 生成 QUOTATION FORM PDF 草稿
  ↓
发送老板最终确认（WhatsApp）
  ↓
PDF 发送客户
  ↓
CRM 更新：status = quote_sent，附加报价单编号
```

---

---

## 详细参考

> 以下内容已拆分到 [[references/implementation-guide.md]]，仅在需要时读取：
> - 实施方式
> - 报价后追踪
> - 与现有技能的关系
> - CRM 更新
> - REQUIRED: 报价单生成后回写钩子
> - 报价单信息
> - 状态
> - v2.0 vs v1.0 主要变更
> - ... 及其他 1 个章节
>
> Python/WeasyPrint 实施细节、CRM更新、回写钩子和版本变更。
