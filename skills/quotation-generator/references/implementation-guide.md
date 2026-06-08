## 实施方式

### 方案 A：Python + ReportLab（推荐）

```python
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def generate_quote(data: dict, output_path: str):
    """
    data = {
        "quote_no": "HL20260506N001",
        "quote_date": "2026/May/06",
        "valid_until": "2026/May/13",
        "buyer_company": "Belttech do Brasil",
        "buyer_email": "procurement@belttech.com.br",
        "items": [
            {
                "product": "Air-cooled Vulcanizer",
                "model": "PA1200",
                "photo_path": "W:/产品照片/PA1200.png",  # optional
                "description": "3rd Gen air-cooled press for conveyor belt splicing",
                "qty": 2,
                "unit_price_cny": 52000,
                "specs": {
                    "heating_area": "1200×150mm",
                    "max_width": "1200mm",
                    "operating_pressure": "0.6-0.8MPa",
                    "temperature": "0-200°C",
                    "voltage": "380V/50Hz",
                    "hs_code": "8477800000"
                }
            }
        ],
        "shipment_term": "FOB Shanghai",
        "payment_terms": "T/T 30/70",
        "delivery_time": "4 weeks after deposit",
        "packing": "Standard export wooden case",
        "warranty": "12 months",
        "notes": "CE / ISO certifications available"
    }
    """
    doc = SimpleDocTemplate(output_path, pagesize=A4,
                           leftMargin=2*cm, rightMargin=2*cm,
                           topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle("Title", parent=styles["Title"],
                                 fontSize=18, alignment=TA_CENTER, spaceAfter=12)
    header_style = ParagraphStyle("Header", parent=styles["Normal"],
                                  fontSize=9, alignment=TA_LEFT)

    elements = []

    # === QUOTATION FORM Title ===
    elements.append(Paragraph("QUOTATION FORM", title_style))
    elements.append(Spacer(1, 6*mm))

    # === Quote Date + Quote No + Valid Until ===
    date_info = [
        [Paragraph(f"Quote Date: {data['quote_date']}", header_style),
         Paragraph(f"Quote No. {data['quote_no']}", header_style)],
        [Paragraph(f"until: {data['valid_until']}", header_style), ""],
    ]
    date_table = Table(date_info, colWidths=[9*cm, 9*cm])
    date_table.setStyle(TableStyle([
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    elements.append(date_table)
    elements.append(Spacer(1, 8*mm))

    # === Buyer's Information ===
    elements.append(Paragraph("The Buyer's Information:", styles["Heading3"]))
    elements.append(Paragraph(f"Company: {data['buyer_company']}", header_style))
    elements.append(Paragraph(f"Email: {data['buyer_email']}", header_style))
    elements.append(Spacer(1, 8*mm))

    # === Product Table ===
    table_header = ["Product", "Model", "Photo", "Description", "Qty",
                    "Unit Price\n(CNY)", "Total\n(EX-Factory CNY)"]

    # Build table data
    table_data = [table_header]
    for item in data["items"]:
        desc_text = item["description"]
        # Append spec lines
        specs = item.get("specs", {})
        if specs:
            spec_lines = []
            for key, val in specs.items():
                spec_lines.append(f"{key.replace('_', ' ').title()}: {val}")
            desc_text += "\n" + "\n".join(spec_lines)

        row = [
            Paragraph(item["product"], header_style),
            Paragraph(item["model"], header_style),
            Image(item["photo_path"], width=2*cm, height=2*cm) if item.get("photo_path") else "[Photo]",
            Paragraph(desc_text.replace("\n", "<br/>"), header_style),
            str(item["qty"]),
            Paragraph(f"¥{item['unit_price_cny']:,.2f}", header_style),
            Paragraph(f"¥{item['qty'] * item['unit_price_cny']:,.2f}", header_style),
        ]
        table_data.append(row)

    # Totals row
    total_cny = sum(item["qty"] * item["unit_price_cny"] for item in data["items"])
    table_data.append(["", "", "", "", "", "Total:", f"¥{total_cny:,.2f}"])

    col_widths = [2.5*cm, 2*cm, 2*cm, 5*cm, 1*cm, 2.5*cm, 3*cm]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B4F8A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("ALIGN", (4, 1), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -2), 0.5, colors.grey),
        ("LINEBELOW", (0, -2), (-1, -2), 1, colors.black),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F0F4F8")),
        ("SPAN", (5, -1), (5, -1)),  # "Total:" label
    ]))
    elements.append(t)
    elements.append(Spacer(1, 8*mm))

    # === Commercial Terms ===
    elements.append(Paragraph("COMMERCIAL TERMS", styles["Heading3"]))
    terms_data = [
        ["Shipment Term:", data["shipment_term"]],
        ["Payment Terms:", data["payment_terms"]],
        ["Delivery Time:", data["delivery_time"]],
        ["Packing:", data["packing"]],
        ["Warranty:", data["warranty"]],
    ]
    terms_table = Table(terms_data, colWidths=[3*cm, 13*cm])
    terms_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    elements.append(terms_table)

    # === Notes ===
    if data.get("notes"):
        elements.append(Spacer(1, 6*mm))
        elements.append(Paragraph("Notes:", styles["Heading3"]))
        for note in data["notes"].split("\n"):
            if note.strip():
                elements.append(Paragraph(f"- {note.strip()}", header_style))

    # === Footer ===
    elements.append(Spacer(1, 12*mm))
    footer_style = ParagraphStyle("Footer", parent=styles["Normal"],
                                  fontSize=8, alignment=TA_CENTER,
                                  textColor=colors.grey)
    elements.append(Paragraph(
        "Manufacturers of Conveyor Belt Fabrications Equipments- HOLO",
        footer_style
    ))

    doc.build(elements)
```

### 方案 B：HTML to PDF（WeasyPrint）

```python
from weasyprint import HTML
import jinja2

def generate_quote_html(data: dict, template: str, output: str):
    env = jinja2.Environment(loader=jinja2.FileSystemLoader("templates/"))
    tpl = env.get_template(template)
    HTML(string=tpl.render(**data)).write_pdf(output)
```

> 推荐方案 A（ReportLab），因为产品照片和表格布局需要精确控制。方案 B 适合纯文本布局。

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
| `smart-quote` | 提供利润率区间和 CNY EX-Factory 参考价格 |
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
quote_number: HL20260506N001
quote_date: 2026-05-06
quote_valid_until: 2026-05-13
quote_amount_cny: XX,XXX
items: [产品列表]
```

---

## REQUIRED: 报价单生成后回写钩子

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
- 报价单号：{HLYYYYMMDDNXXX}
- 生成日期：{日期}
- 金额：{总金额} CNY (EX-Factory)
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
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType quote -Customer "{公司名}" -Result success -Score 0 -Notes "报价单{HLYYYYMMDDNXXX}已生成，金额{总金额}CNY (EX-Factory)" -SkillName quotation-generator
```

### 发送报价单后追加

报价单发送给客户后，额外记录 `email_send` 日志：

```powershell
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType email_send -Customer "{公司名}" -Result success -Notes "报价单{HLYYYYMMDDNXXX}已通过{渠道}发送" -SkillName quotation-generator
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
$nasPath = "\\192.168.0.98\AI数据\proposals"
if (!(Test-Path "K:")) { net use K: \\192.168.0.98\home /user:$user $pass /persistent:yes }
if (!(Test-Path $nasPath)) { New-Item -ItemType Directory -Path $nasPath -Force }
Copy-Item "{本地PDF路径}" "$nasPath\{报价单号}.pdf" -Force
```

**NAS 路径**：`\\192.168.0.98\AI数据\proposals\{报价单号}.pdf`

**降级策略**：NAS 不可用时仅本地存储，不阻断流程。

---

## v2.0 vs v1.0 主要变更

| 项目 | v1.0（旧） | v2.0（新） |
|------|-----------|-----------|
| 文档标题 | PROFORMA INVOICE | QUOTATION FORM |
| 报价单号格式 | HL-BR-20260415-001 | HL20260506N001 |
| 货币 | USD | CNY (EX-Factory) |
| 产品表格列 | Item, Description, Qty, Unit Price, Total | Product, Model, Photo, Description, Qty, Unit Price(CNY), Total(EX-Factory CNY) |
| 产品规格 | 不展示 | Heating Area, Max width, Voltage, HS CODE 等 |
| 商业条款 | Payment Terms, Delivery, Shipping, Validity | Shipment Term, Payment Terms, Delivery Time, Packing, Warranty |
| 页脚 | 无 | "Manufacturers of Conveyor Belt Fabrications Equipments- HOLO" |

---

## 实施检查清单

- [ ] Python 环境有 `reportlab`（`pip install reportlab`）
- [ ] NAS 产品照片目录可访问（W:\产品照片\）
- [ ] NAS 产品规格数据已获取（Heating Area, Max width, Voltage, HS CODE）
- [ ] 各语言 QUOTATION FORM 标签翻译（EN/PT/ES/RU/AR/FR）
- [ ] 报价单号序号管理（检查当天已有几份报价单）
- [ ] PDF 生成脚本测试通过
- [ ] 知识库回写钩子已验证（write-knowledge.ps1）
- [ ] 活动日志已验证（log-activity.ps1）
