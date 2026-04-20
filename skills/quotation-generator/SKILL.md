---
name: quotation-generator
version: "1.0.0"
description: 自动生成红龙专业 PDF 形式发票，含公司抬头、多语言支持、报价后追踪。
triggers:
  - 报价单
  - PDF报价
  - 生成报价
  - 发报价
  - quotation-generator
---

# quotation-generator — 红龙 PDF 报价单生成技能

> 自动生成红龙专业 PDF 形式发票（Proforma Invoice），含公司抬头、多语言支持、报价后追踪。
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

1. **smart-quote 已运行** — 获取利润率区间和参考价格
2. **MEMORY.md 客户会话已读取** — 获取 BANT 数据
3. **NAS 产品资料已读取** — 获取产品规格参数
4. **老板已审批** — 报价锁定流程已完成

### 禁止条件

- ❌ BANT < 2/4 且 N（Need）不明确
- ❌ 老板尚未审批
- ❌ 利润率低于各国铁律底线

---

## 报价单内容

每份 Proforma Invoice 包含：

1. **公司抬头** — Logo、公司名、地址、联系方式
2. **客户信息** — 公司名、联系人、国家
3. **产品明细表** — 型号、规格、数量、单价、总价
4. **条款** — 付款方式、交货时间、运输方式、贸易术语
5. **有效期** — 默认 7 天（可配置）
6. **备注** — 特殊要求、认证情况、质保条款

---

## 报价单命名规范

```
HL-{国家代码}-{YYYYMMDD}-{序号}
```

示例：
```
HL-BR-20260415-001   # 巴西
HL-CL-20260415-001   # 智利
HL-KZ-20260415-001   # 哈萨克斯坦
```

---

## 多语言支持

| 语言 | 适用市场 | 报价单语言 |
|------|---------|----------|
| English | 默认 | EN |
| Portuguese | 巴西 | PT |
| Spanish | 拉美（除巴西）| ES |
| Russian | 俄罗斯/独联体 | RU |
| Arabic | 中东 | AR |
| French | 西非/中非 | FR |

---

## 生成流程

```
报价请求
  ↓
smart-quote 生成利润率区间
  ↓
MEMORY.md 读取客户 BANT
  ↓
老板审批确认
  ↓
quotation-generator 生成 PDF 草稿
  ↓
发送老板最终确认（WhatsApp）
  ↓
PDF 发送客户
  ↓
CRM 更新：status = quote_sent，附加报价单编号
```

---

## PDF 模板结构

```
┌─────────────────────────────────────────────────┐
│  [LOGO]          PROFORMA INVOICE               │
│  HOLO Industrial   Invoice No: HL-BR-20260415-001│
│  Equipment Mfg Co., Ltd                          │
│  Ruian, Wenzhou, Zhejiang 325200, China          │
│  Tel: +86 131 6586 2311                         │
│  Email: wikeye2025@163.com                       │
├─────────────────────────────────────────────────┤
│  Bill To:                    Ship To:           │
│  [Company Name]              [Company Name]     │
│  [Address]                   [Address]          │
│  [Country]                    [Country]          │
│                                                  │
│  Date: 2026-04-15         Valid Until: 2026-04-22│
│  Ref No: HOLO-BR-2026-0415                      │
├─────────────────────────────────────────────────┤
│  Item | Description | Qty | Unit Price | Total    │
│  ─────────────────────────────────────────────  │
│  1    | Air-cool...     | 1   | USD X,XXX  |...  │
│  2    | ...             | ... | ...        |...  │
├─────────────────────────────────────────────────┤
│                          SUBTOTAL: USD XX,XXX   │
│                          FREIGHT: USD X,XXX     │
│                          TOTAL: USD XX,XXX      │
├─────────────────────────────────────────────────┤
│  Payment Terms: T/T 30/70                        │
│  Delivery Time: [X] weeks after deposit          │
│  Shipping: FOB Shanghai                          │
│  Validity: 7 days                               │
├─────────────────────────────────────────────────┤
│  Notes:                                          │
│  - CE / ISO certifications available            │
│  - Warranty: 12 months                          │
│  - Installation overseas: negotiable            │
└─────────────────────────────────────────────────┘
```

---

## 实施方式

### 方案 A：Python + ReportLab（推荐）

```python
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm

def generate_quote(data: dict, output_path: str):
    doc = SimpleDocTemplate(output_path, pagesize=A4)
    styles = getSampleStyleSheet()

    # Company header
    header = Paragraph("HOLO Industrial Equipment Mfg Co., Ltd", styles["Title"])
    subheader = Paragraph("Ruian, Wenzhou, Zhejiang 325200, China | Tel: +86 131 6586 2311", styles["Normal"])

    # Product table
    table_data = [["Item", "Description", "Qty", "Unit Price", "Total"]]
    for i, item in enumerate(data["items"], 1):
        table_data.append([
            str(i),
            item["description"],
            str(item["qty"]),
            f"USD {item['unit_price']:,.2f}",
            f"USD {item['total']:,.2f}"
        ])
    # ... totals row

    t = Table(table_data, colWidths=[1.5*cm, 8*cm, 2*cm, 3*cm, 3*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("BACKGROUND", (0, 1), (-1, -2), colors.beige),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))

    elements = [header, subheader, Spacer(1, 0.5*cm), t]
    doc.build(elements)
```

### 方案 B：HTML to PDF

```python
from weasyprint import HTML
import jinja2

def generate_quote_html(data: dict, template: str, output: str):
    env = jinja2.Environment(loader=jinja2.FileSystemLoader("templates/"))
    tpl = env.get_template(template)
    HTML(string=tpl.render(**data)).write_pdf(output)
```

---

## 报价后追踪

> 由 HEARTBEAT 第 3 项（报价追踪）自动驱动

| 时间 | 动作 |
|------|------|
| Day 3 无回复 | 跟进消息（WhatsApp/Telegram）|
| Day 7 无回复 | 第二轮跟进 + 案例分享 |
| Day 14 无回复 | 最终跟进，或移入 nurture |

---

## 与现有技能的关系

| 技能 | 关系 |
|------|------|
| `smart-quote` | 提供利润率区间和参考价格，作为输入 |
| `telegram-toolkit` | Telegram-first 市场可直接发送 PDF |
| `whatsapp-outreach` | 发送 PDF 给客户（≤ 100MB）|
| `email-sender` | Email 渠道发送 PDF 附件 |
| `MEMORY.md` | 读取客户会话，获取 BANT 数据 |
| `AGENTS.md` | 阶段5 报价流程引用本技能 |

---

## CRM 更新

报价发送后，更新 CRM：

```
status: quote_sent
quote_number: HL-BR-20260415-001
quote_date: 2026-04-15
quote_valid_until: 2026-04-22
quote_amount_usd: XX,XXX
items: [产品列表]
```

---

## 📌 REQUIRED: 报价单生成后回写钩子

> **MUST** — PDF 生成后必须执行以下步骤。不可跳过。

### Step 7.1：保存报价摘要到知识库

```powershell
powershell -File "{{SKILL_DIR}}/../knowledge-base/scripts/write-knowledge.ps1" -Type email -Name "{公司名}" -Content @"
---
title: {公司名} - 报价单记录
type: quotation
customer: {公司名}
country: {国家代码}
---

# 报价单生成记录

## 报价单信息
- 报价单号：{HL-XX-YYYYMMDD-NNN}
- 生成日期：{日期}
- 金额：{总金额} USD
- 产品明细：{产品列表}
- 付款方式：{付款条款}
- 交货时间：{交期}
- 运输方式：{贸易术语}
- 有效期至：{有效期}

## 状态
- 报价单状态：generated
- 审批状态：pending_approval
- 发送渠道：待定（email/whatsapp/telegram）
- 客户反馈：待跟进
"@
```

### Step 7.2：记录活动日志

```powershell
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType quote -Customer "{公司名}" -Result success -Score 0 -Notes "报价单{HL-XX-YYYYMMDD-NNN}已生成，金额{总金额}USD" -SkillName quotation-generator
```

### 发送报价单后追加

报价单发送给客户后，额外记录 `email_send` 日志：

```powershell
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType email_send -Customer "{公司名}" -Result success -Notes "报价单{HL-XX-YYYYMMDD-NNN}已通过{渠道}发送" -SkillName quotation-generator
```

同时更新知识库中的报价状态：将 `报价单状态：generated` 改为 `报价单状态：sent`，将 `审批状态：pending_approval` 改为 `审批状态：approved`。

### Step 7.3：备份 PDF 到 NAS（REQUIRED）

PDF 生成后，复制一份到 NAS 共享目录，供团队和主管查阅：

```powershell
# 确保 NAS 已挂载
$credFile = "$env:USERPROFILE\.openclaw\.nas_credentials"
$enc = Get-Content $credFile -Raw | ConvertFrom-Json
$user = $enc.User | ConvertTo-SecureString | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
$pass = $enc.Pass | ConvertTo-SecureString | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
$nasPath = "\\192.168.0.194\AI数据\proposals"
if (!(Test-Path "K:")) { net use K: \\192.168.0.194\home /user:$user $pass /persistent:yes }
if (!(Test-Path $nasPath)) { New-Item -ItemType Directory -Path $nasPath -Force }
Copy-Item "{本地PDF路径}" "$nasPath\{报价单号}.pdf" -Force
```

**NAS 路径**：`\\192.168.0.194\AI数据\proposals\{报价单号}.pdf`

**降级策略**：NAS 不可用时仅本地存储，不阻断流程。

---

## 实施检查清单

- [ ] Python 环境有 `reportlab` 或 `weasyprint`
- [ ] 公司 Logo 文件（PNG/PDF）
- [ ] 各语言报价单模板（EN/PT/ES/RU/AR/FR）
- [ ] 报价单编号规则已定义
- [ ] PDF 生成脚本测试通过
- [ ] 知识库回写钩子已验证（write-knowledge.ps1）
- [ ] 活动日志已验证（log-activity.ps1）
